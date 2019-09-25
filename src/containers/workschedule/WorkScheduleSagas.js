/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import {
  SearchApiActions,
  SearchApiSagas
} from 'lattice-sagas';
import { DateTime } from 'luxon';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import {
  APP_TYPE_FQNS,
  INCIDENT_START_DATETIME,
  WORKSITE_FQNS
} from '../../core/edm/constants/FullyQualifiedNames';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import {
  FIND_APPOINTMENTS,
  GET_WORKSITE_AND_PERSON_NAMES,
  findAppointments,
  getWorksiteAndPersonNames,
} from './WorkScheduleActions';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getNeighborDetails,
  getNeighborESID,
  getPropertyTypeIdFromEdm,
  getSearchTerm,
  getUTCDateRangeSearchString
} from '../../utils/DataUtils';
import { timePeriods } from './WorkScheduleConstants';

const LOG = new Logger('WorkScheduleSagas');
const { executeSearch, searchEntityNeighborsWithFilter } = SearchApiActions;
const { executeSearchWorker, searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

const {
  APPOINTMENT,
  PEOPLE,
  WORKSITE,
  WORKSITE_PLAN
} = APP_TYPE_FQNS;
const { NAME } = WORKSITE_FQNS;

const getAppFromState = state => state.get(STATE.APP, Map());
const getEdmFromState = state => state.get(STATE.EDM, Map());

/*
appointment -> addresses -> work site plan -> based on -> work site
work site plan -> related to -> enrollment status
*/

/*
 *
 * WorkScheduleActions.getWorksiteAndPersonNames()
 *
 */

function* getWorksiteAndPersonNamesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};
  let worksiteNamesByAppointmentEKID :Map = Map();
  let personByAppointmentEKID :Map = Map();

  try {
    yield put(getWorksiteAndPersonNames.request(id, value));
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const { appointments } = value;
    const appointmentEKIDs :UUID[] = [];
    appointments.forEach((appt :Map) => {
      const apptEKID :UUID = getEntityKeyId(appt);
      appointmentEKIDs.push(apptEKID);
    });

    const app = yield select(getAppFromState);
    const appointmentESID :UUID = getEntitySetIdFromApp(app, APPOINTMENT);
    const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);

    const worksitePlanSearchFilter = {
      entityKeyIds: appointmentEKIDs,
      destinationEntitySetIds: [worksitePlanESID],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: appointmentESID, filter: worksitePlanSearchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    const worksitePlans :Map = fromJS(response.data);
    const setOfWorksitePlanEKIDs :Set<*> = new Set();
    let appointmentWorksitePlanEKIDMap :Map = Map();

    worksitePlans.forEach((worksitePlanList :List, appointmentEKID :UUID) => {
      const worksitePlan :Map = getNeighborDetails(worksitePlanList.get(0));
      const worksitePlanEKID :UUID = getEntityKeyId(worksitePlan);
      setOfWorksitePlanEKIDs.add(worksitePlanEKID);
      appointmentWorksitePlanEKIDMap = appointmentWorksitePlanEKIDMap.set(appointmentEKID, worksitePlanEKID);
    });
    const worksitePlanEKIDs :UUID[] = Array.from(setOfWorksitePlanEKIDs);

    const worksiteESID :UUID = getEntitySetIdFromApp(app, WORKSITE);
    const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);
    const worksiteFilter = {
      entityKeyIds: worksitePlanEKIDs,
      destinationEntitySetIds: [worksiteESID],
      sourceEntitySetIds: [peopleESID],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: worksitePlanESID, filter: worksiteFilter })
    );
    if (response.error) {
      throw response.error;
    }
    let worksitesByWorksitePlan :Map = Map();
    let peopleByWorksitePlan :Map = Map();

    fromJS(response.data)
      .forEach((neighborsList :List, worksitePlanEKID :UUID) => {
        neighborsList.forEach((neighbor) => {
          const entity = getNeighborDetails(neighbor);
          if (getNeighborESID(neighbor) === worksiteESID) {
            worksitesByWorksitePlan = worksitesByWorksitePlan.set(worksitePlanEKID, entity);
          }
          if (getNeighborESID(neighbor) === peopleESID) {
            peopleByWorksitePlan = peopleByWorksitePlan.set(worksitePlanEKID, entity);
          }
        });
      });

    appointmentWorksitePlanEKIDMap.forEach((worksitePlanEKID :UUID, appointmentEKID :UUID) => {
      const worksite :Map = worksitesByWorksitePlan.get(worksitePlanEKID);
      const { [NAME]: worksiteName } = getEntityProperties(worksite, [NAME]);
      worksiteNamesByAppointmentEKID = worksiteNamesByAppointmentEKID.set(appointmentEKID, worksiteName);

      const person :Map = peopleByWorksitePlan.get(worksitePlanEKID);
      personByAppointmentEKID = personByAppointmentEKID.set(appointmentEKID, person);
    });

    yield put(getWorksiteAndPersonNames.success(id, {
      personByAppointmentEKID,
      worksiteNamesByAppointmentEKID
    }));
  }
  catch (error) {
    LOG.error('caught exception in getWorksiteAndPersonNamesWorker()', error);
    yield put(getWorksiteAndPersonNames.failure(id, error));
  }
  finally {
    yield put(getWorksiteAndPersonNames.finally(id));
  }
}

function* getWorksiteAndPersonNamesWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_WORKSITE_AND_PERSON_NAMES, getWorksiteAndPersonNamesWorker);
}

/*
 *
 * WorkScheduleActions.findAppointments()
 *
 */

function* findAppointmentsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};
  let appointments :List = List();

  try {
    yield put(findAppointments.request(id, value));
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const { selectedDate, timePeriod } = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const appointmentESID :UUID = getEntitySetIdFromApp(app, APPOINTMENT);
    const startDatetimePTID :UUID = getPropertyTypeIdFromEdm(edm, INCIDENT_START_DATETIME);

    const searchOptions = {
      entitySetIds: [appointmentESID],
      start: 0,
      maxHits: 10000,
      constraints: [{
        min: 1,
        constraints: []
      }]
    };
    let searchTerm :string = '';

    if (timePeriod === timePeriods.DAY) {
      searchTerm = getSearchTerm(startDatetimePTID, selectedDate);
      searchOptions.constraints[0].constraints.push({
        searchTerm,
        fuzzy: false
      });
    }
    if (timePeriod === timePeriods.WEEK || timePeriod === timePeriods.MONTH) {
      const selectedDateAsDateTime :DateTime = DateTime.fromISO(selectedDate);
      searchTerm = getUTCDateRangeSearchString(startDatetimePTID, timePeriod, selectedDateAsDateTime);
      searchOptions.constraints[0].constraints.push({
        searchTerm,
        fuzzy: false
      });
    }

    response = yield call(executeSearchWorker, executeSearch({ searchOptions }));
    if (response.error) {
      throw response.error;
    }
    appointments = fromJS(response.data.hits);

    if (!appointments.isEmpty()) {
      yield call(getWorksiteAndPersonNamesWorker, getWorksiteAndPersonNames({ appointments }));
    }

    yield put(findAppointments.success(id, appointments));
  }
  catch (error) {
    LOG.error('caught exception in findAppointmentsWorker()', error);
    yield put(findAppointments.failure(id, error));
  }
  finally {
    yield put(findAppointments.finally(id));
  }
}

function* findAppointmentsWatcher() :Generator<*, *, *> {

  yield takeEvery(FIND_APPOINTMENTS, findAppointmentsWorker);
}

export {
  findAppointmentsWatcher,
  findAppointmentsWorker,
  getWorksiteAndPersonNamesWatcher,
  getWorksiteAndPersonNamesWorker,
};
