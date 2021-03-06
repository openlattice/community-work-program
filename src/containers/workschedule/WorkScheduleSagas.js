/*
 * @flow
 */

import {
  all,
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, fromJS } from 'immutable';
import {
  SearchApiActions,
  SearchApiSagas
} from 'lattice-sagas';
import { DateTime } from 'luxon';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  FIND_APPOINTMENTS,
  GET_PERSON_COURT_TYPE,
  GET_WORKSITE_AND_PERSON_NAMES,
  GET_WORKSITE_PLANS_BY_PERSON,
  findAppointments,
  getPersonCourtType,
  getWorksiteAndPersonNames,
  getWorksitePlansByPerson,
} from './WorkScheduleActions';

import Logger from '../../utils/Logger';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getNeighborDetails,
  getNeighborESID,
  getPropertyTypeIdFromEdm,
  getUTCDateRangeSearchString
} from '../../utils/DataUtils';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { isDefined } from '../../utils/LangUtils';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import { getAppointmentCheckIns } from '../participant/assignedworksites/WorksitePlanActions';
import { getAppointmentCheckInsWorker } from '../participant/assignedworksites/WorksitePlanSagas';

const LOG = new Logger('WorkScheduleSagas');
const { searchEntitySetData, searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntitySetDataWorker, searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

const {
  APPOINTMENT,
  DIVERSION_PLAN,
  MANUAL_PRETRIAL_COURT_CASES,
  PEOPLE,
  WORKSITE,
  WORKSITE_PLAN
} = APP_TYPE_FQNS;
const { COURT_CASE_TYPE, INCIDENT_START_DATETIME, NAME } = PROPERTY_TYPE_FQNS;

const getAppFromState = (state) => state.get(STATE.APP, Map());
const getEdmFromState = (state) => state.get(STATE.EDM, Map());

/*
  appointment -> addresses -> work site plan -> based on -> work site
  person -> has -> check-in -> fulfills -> appointment
  check-in -> has -> check-in details
  person -> assigned to -> work site plan
  person -> assigned to -> work site
  work site plan -> part of -> diversion plan
  diversion plan -> related to -> court case
*/

function* getPersonCourtTypeWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let response :Object = {};
  let courtTypeByAppointmentEKID :Map = Map();

  try {

    const { worksitePlanEKIDs, worksitePlanEKIDByAppointmentEKID } = value;
    const app = yield select(getAppFromState);
    const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);

    let searchFilter = {
      entityKeyIds: worksitePlanEKIDs,
      destinationEntitySetIds: [diversionPlanESID],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: worksitePlanESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    let diversionPlanByWorksitePlanEKID :Map = fromJS(response.data);
    if (!diversionPlanByWorksitePlanEKID.isEmpty()) {
      const diversionPlanEKIDs :UUID[] = [];
      diversionPlanByWorksitePlanEKID = diversionPlanByWorksitePlanEKID
        .map((neighborList :List) => neighborList.get(0))
        .map((neighbor :Map) => getNeighborDetails(neighbor))
        .map((entity :Map) => getEntityKeyId(entity));
      diversionPlanByWorksitePlanEKID.valueSeq().toList().forEach((ekid :string) => {
        diversionPlanEKIDs.push(ekid);
      });

      const courtCasesESID :UUID = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
      searchFilter = {
        entityKeyIds: diversionPlanEKIDs,
        destinationEntitySetIds: [courtCasesESID],
        sourceEntitySetIds: [],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter: searchFilter })
      );
      if (response.error) {
        throw response.error;
      }
      let courtCasesByDiversionPlanEKID :Map = fromJS(response.data);
      if (!courtCasesByDiversionPlanEKID.isEmpty()) {
        courtCasesByDiversionPlanEKID = courtCasesByDiversionPlanEKID
          .map((neighborList :List) => neighborList.get(0))
          .map((neighbor :Map) => getNeighborDetails(neighbor));

        worksitePlanEKIDByAppointmentEKID.forEach((worksitePlanEKID, appointmentEKID) => {
          const diversionPlanEKID = diversionPlanByWorksitePlanEKID.get(worksitePlanEKID, '');
          const courtCase = courtCasesByDiversionPlanEKID.get(diversionPlanEKID, '');
          const { [COURT_CASE_TYPE]: courtType } = getEntityProperties(courtCase, [COURT_CASE_TYPE]);
          courtTypeByAppointmentEKID = courtTypeByAppointmentEKID.set(appointmentEKID, courtType);
        });
      }
    }

    yield put(getPersonCourtType.success(id, courtTypeByAppointmentEKID));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getPersonCourtType.failure(id, error));
  }
  finally {
    yield put(getPersonCourtType.finally(id));
  }
}

function* getPersonCourtTypeWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PERSON_COURT_TYPE, getPersonCourtTypeWorker);
}

/*
 *
 * WorkScheduleActions.getWorksitePlansByPerson()
 *
 */

function* getWorksitePlansByPersonWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id } = action;
  const workerResponse = {};
  let response :Object = {};

  try {
    yield put(getWorksitePlansByPerson.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const {
      diversionPlanByWorksitePlan,
      peopleByWorksitePlan,
      worksitePlansByDiversionPlanEKID,
    } = value;

    const worksitePlanEKIDs :UUID[] = [];

    const personEKIDByWorksitePlanEKID :Map = Map().withMutations((mutator) => {
      peopleByWorksitePlan.forEach((person :Map, worksitePlanEKIDForAppointment :UUID) => {
        const diversionPlanEKID :UUID = diversionPlanByWorksitePlan.get(worksitePlanEKIDForAppointment, '');
        const worksitePlans :List = worksitePlansByDiversionPlanEKID.get(diversionPlanEKID, List());
        const personEKID :UUID = getEntityKeyId(person);
        worksitePlans.forEach((worksitePlan :Map) => {
          const worksitePlanEKID :UUID = getEntityKeyId(worksitePlan);
          worksitePlanEKIDs.push(worksitePlanEKID);
          mutator.set(worksitePlanEKID, personEKID);
        });
      });
    });

    const app = yield select(getAppFromState);
    const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);
    const worksiteESID :UUID = getEntitySetIdFromApp(app, WORKSITE);

    const filter = {
      entityKeyIds: worksitePlanEKIDs,
      destinationEntitySetIds: [worksiteESID],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: worksitePlanESID, filter })
    );
    if (response.error) throw response.error;

    const worksitesByWorksitePlanEKIDByPersonEKID :Map = Map().withMutations((mutator) => {
      fromJS(response.data).forEach((worksiteNeighborsList :List, worksitePlanEKID :UUID) => {
        const worksite :Map = getNeighborDetails(worksiteNeighborsList.get(0, Map()));
        const personEKID :UUID = personEKIDByWorksitePlanEKID.get(worksitePlanEKID, '');
        const worksitesByWorksitePlanEKIDS = mutator.get(personEKID, Map());
        mutator.set(personEKID, worksitesByWorksitePlanEKIDS.set(worksitePlanEKID, worksite));
      });
    });

    workerResponse.data = worksitesByWorksitePlanEKIDByPersonEKID;
    yield put(getWorksitePlansByPerson.success(id, worksitesByWorksitePlanEKIDByPersonEKID));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error(action.type, error);
    yield put(getWorksitePlansByPerson.failure(id, error));
  }
  finally {
    yield put(getWorksitePlansByPerson.finally(id));
  }
  return workerResponse;
}

function* getWorksitePlansByPersonWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_WORKSITE_PLANS_BY_PERSON, getWorksitePlansByPersonWorker);
}

/*
 *
 * WorkScheduleActions.getWorksiteAndPersonNames()
 *
 */

function* getWorksiteAndPersonNamesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let response :Object = {};
  let worksiteNamesByAppointmentEKID :Map = Map();
  let personByAppointmentEKID :Map = Map();

  try {
    yield put(getWorksiteAndPersonNames.request(id, value));
    const { workAppointmentEKIDs } = value;

    const app = yield select(getAppFromState);
    const appointmentESID :UUID = getEntitySetIdFromApp(app, APPOINTMENT);
    const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);

    const worksitePlanSearchFilter = {
      entityKeyIds: workAppointmentEKIDs,
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
    let worksitePlanEKIDByAppointmentEKID :Map = Map();

    worksitePlans.forEach((worksitePlanList :List, appointmentEKID :UUID) => {
      const worksitePlan :Map = getNeighborDetails(worksitePlanList.get(0));
      const worksitePlanEKID :UUID = getEntityKeyId(worksitePlan);
      setOfWorksitePlanEKIDs.add(worksitePlanEKID);
      worksitePlanEKIDByAppointmentEKID = worksitePlanEKIDByAppointmentEKID.set(appointmentEKID, worksitePlanEKID);
    });
    const worksitePlanEKIDs :UUID[] = Array.from(setOfWorksitePlanEKIDs);
    yield call(getPersonCourtTypeWorker, getPersonCourtType({ worksitePlanEKIDs, worksitePlanEKIDByAppointmentEKID }));

    const worksiteESID :UUID = getEntitySetIdFromApp(app, WORKSITE);
    const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
    const worksiteFilter = {
      entityKeyIds: worksitePlanEKIDs,
      destinationEntitySetIds: [diversionPlanESID, worksiteESID],
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
    let diversionPlanByWorksitePlan :Map = Map();
    const personEKIDs :UUID[] = [];
    const diversionPlanEKIDs :UUID[] = [];

    fromJS(response.data)
      .forEach((neighborsList :List, worksitePlanEKID :UUID) => {
        neighborsList.forEach((neighbor) => {
          const entity = getNeighborDetails(neighbor);
          if (getNeighborESID(neighbor) === worksiteESID) {
            worksitesByWorksitePlan = worksitesByWorksitePlan.set(worksitePlanEKID, entity);
          }
          if (getNeighborESID(neighbor) === peopleESID) {
            personEKIDs.push(getEntityKeyId(entity));
            peopleByWorksitePlan = peopleByWorksitePlan.set(worksitePlanEKID, entity);
          }
          if (getNeighborESID(neighbor) === diversionPlanESID) {
            const diversionPlanEKID :UUID = getEntityKeyId(entity);
            diversionPlanByWorksitePlan = diversionPlanByWorksitePlan.set(worksitePlanEKID, diversionPlanEKID);
            diversionPlanEKIDs.push(diversionPlanEKID);
          }
        });
      });

    let worksitePlansByDiversionPlanEKID :Map = Map();

    if (diversionPlanEKIDs.length) {
      const diversionPlanFilter = {
        entityKeyIds: diversionPlanEKIDs,
        destinationEntitySetIds: [],
        sourceEntitySetIds: [worksitePlanESID],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter: diversionPlanFilter })
      );
      if (response.error) throw response.error;
      worksitePlansByDiversionPlanEKID = fromJS(response.data)
        .map((worksitePlanNeighborsList :List) => worksitePlanNeighborsList
          .map((worksitePlanNeighbor :Map) => getNeighborDetails(worksitePlanNeighbor)));
    }

    yield call(getWorksitePlansByPersonWorker, getWorksitePlansByPerson({
      diversionPlanByWorksitePlan,
      peopleByWorksitePlan,
      worksitePlansByDiversionPlanEKID
    }));

    worksitePlanEKIDByAppointmentEKID.forEach((worksitePlanEKID :UUID, appointmentEKID :UUID) => {
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
    LOG.error(action.type, error);
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
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
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

    const selectedDateAsDateTime :DateTime = DateTime.fromISO(selectedDate);
    const searchTerm :string = getUTCDateRangeSearchString(startDatetimePTID, timePeriod, selectedDateAsDateTime);
    searchOptions.constraints[0].constraints.push({
      searchTerm,
      fuzzy: false
    });

    response = yield call(searchEntitySetDataWorker, searchEntitySetData(searchOptions));
    if (response.error) throw response.error;
    appointments = fromJS(response.data.hits);

    if (!appointments.isEmpty()) {
      const workAppointmentEKIDs :UUID[] = [];
      appointments.forEach((appt :Map) => {
        const apptEKID :UUID = getEntityKeyId(appt);
        workAppointmentEKIDs.push(apptEKID);
      });

      yield all([
        call(getWorksiteAndPersonNamesWorker, getWorksiteAndPersonNames({ workAppointmentEKIDs })),
        call(getAppointmentCheckInsWorker, getAppointmentCheckIns({ workAppointmentEKIDs }))
      ]);
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
  getPersonCourtTypeWatcher,
  getPersonCourtTypeWorker,
  getWorksiteAndPersonNamesWatcher,
  getWorksiteAndPersonNamesWorker,
  getWorksitePlansByPersonWatcher,
  getWorksitePlansByPersonWorker,
};
