// @flow
import { List, Map, fromJS } from 'immutable';
import { DateTime } from 'luxon';
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../../utils/Logger';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getNeighborDetails,
  getNeighborESID,
  getPropertyTypeIdFromEdm,
  getUTCDateRangeSearchString,
} from '../../../utils/DataUtils';
import { isDefined, isEmptyString, isNonEmptyString } from '../../../utils/LangUtils';
import { getPersonFullName } from '../../../utils/PeopleUtils';
import {
  GET_CHECK_IN_NEIGHBORS,
  GET_HOURS_WORKED_BY_WORKSITE,
  GET_MONTHLY_PARTICIPANTS_BY_WORKSITE,
  GET_WORKSITES,
  getCheckInNeighbors,
  getHoursWorkedByWorksite,
  getMonthlyParticipantsByWorksite,
  getWorksites,
} from './WorksiteStatsActions';
import { STATE } from '../../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { ALL_TIME, MONTHLY, YEARLY } from '../consts/TimeConsts';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { executeSearch, searchEntityNeighborsWithFilter } = SearchApiActions;
const { executeSearchWorker, searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const {
  APPOINTMENT,
  CHECK_INS,
  CHECK_IN_DETAILS,
  PEOPLE,
  WORKSITE,
  WORKSITE_PLAN,
} = APP_TYPE_FQNS;
const {
  DATETIME_START,
  HOURS_WORKED,
  NAME,
} = PROPERTY_TYPE_FQNS;

const getAppFromState = (state) => state.get(STATE.APP, Map());
const getEdmFromState = (state) => state.get(STATE.EDM, Map());
const LOG = new Logger('StatsSagas');

/*
 *
 * WorksiteStatsActions.getWorksites()
 *
 */

function* getWorksitesWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;
  const workerResponse :Object = {};
  let response :Object = {};

  try {
    yield put(getWorksites.request(id));

    const app = yield select(getAppFromState);
    const worksiteESID :UUID = getEntitySetIdFromApp(app, WORKSITE);
    response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: worksiteESID }));
    const worksites :List = fromJS(response.data);
    const worksiteEKIDs :UUID[] = [];
    const worksiteByEKID :Map = Map().withMutations((map :Map) => {
      worksites.forEach((worksite :Map) => {
        const worksiteEKID :UUID = getEntityKeyId(worksite);
        map.set(worksiteEKID, worksite);
        worksiteEKIDs.push(getEntityKeyId(worksite));
      });
    }).asImmutable();

    workerResponse.data = { worksites, worksiteEKIDs, worksiteByEKID };
    yield put(getWorksites.success(id));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error(action.type, error);
    yield put(getWorksites.failure(id, error));
  }
  finally {
    yield put(getWorksites.finally(id));
  }
  return workerResponse;
}

function* getWorksitesWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_WORKSITES, getWorksitesWorker);
}

/*
 *
 * WorksiteStatsActions.getCheckInNeighbors()
 *
 */

function* getCheckInNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  const workerResponse :Object = {};
  let response :Object = {};

  try {
    yield put(getCheckInNeighbors.request(id));
    const { checkInEKIDs } = value;

    const app = yield select(getAppFromState);
    const appointmentESID :UUID = getEntitySetIdFromApp(app, APPOINTMENT);
    const checkInsESID :UUID = getEntitySetIdFromApp(app, CHECK_INS);
    const checkInDetailsESID :UUID = getEntitySetIdFromApp(app, CHECK_IN_DETAILS);
    const worksiteESID :UUID = getEntitySetIdFromApp(app, WORKSITE);
    const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);
    const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);

    let searchFilter :Object = {
      entityKeyIds: checkInEKIDs,
      destinationEntitySetIds: [appointmentESID, checkInDetailsESID],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: checkInsESID, filter: searchFilter })
    );
    if (response.error) throw response.error;
    const neighbors :Map = fromJS(response.data);
    const appointmentEKIDs :UUID[] = [];

    let checkInEKIDByAppointmentEKID :Map = Map().asMutable();
    const checkInDetailsByCheckInEKID :Map = Map().withMutations((map :Map) => {
      neighbors.forEach((neighborsList :List, checkInEKID :UUID) => {
        const appointmentNeighbor :Map = neighborsList
          .find((neighbor :Map) => getNeighborESID(neighbor) === appointmentESID);
        const appointmentEKID :UUID = getEntityKeyId(getNeighborDetails(appointmentNeighbor));
        if (isDefined(appointmentEKID)) appointmentEKIDs.push(appointmentEKID);
        checkInEKIDByAppointmentEKID = checkInEKIDByAppointmentEKID.set(appointmentEKID, checkInEKID);

        const checkInDetailsNeighbor :Map = neighborsList
          .find((neighbor :Map) => getNeighborESID(neighbor) === checkInDetailsESID);
        const checkInDetails :Map = getNeighborDetails(checkInDetailsNeighbor);
        map.set(checkInEKID, checkInDetails);
      });
    }).asImmutable();

    searchFilter = {
      entityKeyIds: appointmentEKIDs,
      destinationEntitySetIds: [worksitePlanESID],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: appointmentESID, filter: searchFilter })
    );
    if (response.error) throw response.error;
    const worksitePlanEKIDs :UUID[] = [];
    const worksitePlanEKIDByAppointmentEKID :Map = Map().withMutations((map :Map) => {
      fromJS(response.data).forEach((neighborsList :List, appointmentEKID :UUID) => {
        const worksitePlanEKID :UUID = getEntityKeyId(getNeighborDetails(neighborsList.get(0)));
        worksitePlanEKIDs.push(worksitePlanEKID);
        map.set(appointmentEKID, worksitePlanEKID);
      });
    }).asImmutable();

    searchFilter = {
      entityKeyIds: worksitePlanEKIDs,
      destinationEntitySetIds: [worksiteESID],
      sourceEntitySetIds: [peopleESID],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: worksitePlanESID, filter: searchFilter })
    );
    if (response.error) throw response.error;
    const peopleAndWorksiteNeighbors :Map = fromJS(response.data);

    let personNameByWorksitePlanEKID :Map = Map().asMutable();

    const worksiteNameByWorksitePlanEKID :Map = Map().withMutations((map :Map) => {
      peopleAndWorksiteNeighbors.forEach((neighborsList :List, worksitePlanEKID :UUID) => {
        const worksiteNeighbor :Map = neighborsList.find((neighbor :Map) => getNeighborESID(neighbor) === worksiteESID);
        const worksite :Map = getNeighborDetails(worksiteNeighbor);
        const { [NAME]: worksiteName } = getEntityProperties(worksite, [NAME]);
        map.set(worksitePlanEKID, worksiteName);


        const personNeighbor :Map = neighborsList.find((neighbor :Map) => getNeighborESID(neighbor) === peopleESID);
        const person :Map = getNeighborDetails(personNeighbor);
        const personName :string = getPersonFullName(person);
        personNameByWorksitePlanEKID = personNameByWorksitePlanEKID.set(worksitePlanEKID, personName);
      });
    });

    personNameByWorksitePlanEKID = personNameByWorksitePlanEKID.asImmutable();

    workerResponse.data = {
      checkInDetailsByCheckInEKID,
      checkInEKIDByAppointmentEKID,
      personNameByWorksitePlanEKID,
      worksiteNameByWorksitePlanEKID,
      worksitePlanEKIDByAppointmentEKID,
    };
    yield put(getCheckInNeighbors.success(id));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error(action.type, error);
    yield put(getCheckInNeighbors.failure(id, error));
  }
  finally {
    yield put(getCheckInNeighbors.finally(id));
  }
  return workerResponse;
}

function* getCheckInNeighborsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_CHECK_IN_NEIGHBORS, getCheckInNeighborsWorker);
}

/*
 *
 * WorksiteStatsActions.getHoursWorkedByWorksite()
 *
 */

function* getHoursWorkedByWorksiteWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;
  let response :Object = {};
  let hoursByWorksite :Map = Map().asMutable();
  /*
    if it's all time, you only need all worksite plans and then worksite neighbors
    if it's monthly or yearly, you need all checkins -> appointment neighbors
      -> worksite plan neighbors -> worksite neighbors
  */

  try {
    yield put(getHoursWorkedByWorksite.request(id));
    const app = yield select(getAppFromState);
    const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);
    const worksiteESID :UUID = getEntitySetIdFromApp(app, WORKSITE);

    response = yield call(getWorksitesWorker, getWorksites());
    if (response.error) throw response.error;
    const { worksites, worksiteEKIDs, worksiteByEKID } = response.data;

    worksites.forEach((worksite :Map) => {
      const { [NAME]: worksiteName } = getEntityProperties(worksite, [NAME]);
      if (worksiteName.length) hoursByWorksite.set(worksiteName, 0);
    });

    const { value } = action;
    if (fromJS(value).isEmpty() || value.timeFrame === ALL_TIME) {

      const searchFilter :Object = {
        entityKeyIds: worksiteEKIDs,
        destinationEntitySetIds: [],
        sourceEntitySetIds: [worksitePlanESID],
      };

      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: worksiteESID, filter: searchFilter })
      );
      if (response.error) throw response.error;
      const worksitePlanNeighbors :Map = fromJS(response.data);

      worksitePlanNeighbors.forEach((neighborsList :List, worksiteEKID :UUID) => {
        const worksite :Map = worksiteByEKID.get(worksiteEKID, Map());
        const { [NAME]: worksiteName } = getEntityProperties(worksite, [NAME]);

        neighborsList.forEach((neighbor :Map) => {
          const worksitePlan :Map = getNeighborDetails(neighbor);
          let { [HOURS_WORKED]: hoursWorked } = getEntityProperties(worksitePlan, [HOURS_WORKED]);
          if (isNonEmptyString(hoursWorked)) hoursWorked = parseFloat(hoursWorked);
          if (isEmptyString(hoursWorked)) hoursWorked = 0;
          if (worksiteName.length) {
            const hoursTotalForWorksite :number = hoursByWorksite.get(worksiteName, 0);
            hoursByWorksite = hoursByWorksite.set(worksiteName, hoursTotalForWorksite + hoursWorked);
          }
        });
      });
    }
    else {
      const { month, timeFrame, year } = value;

      const edm = yield select(getEdmFromState);
      const checkInsESID :UUID = getEntitySetIdFromApp(app, CHECK_INS);
      const datetimeStartPTID :UUID = getPropertyTypeIdFromEdm(edm, DATETIME_START);
      const searchOptions = {
        entitySetIds: [checkInsESID],
        start: 0,
        maxHits: 10000,
        constraints: []
      };

      let searchTerm :string = '';

      if (timeFrame === MONTHLY) {
        const mmMonth :string = month < 10 ? `0${month}` : month;
        const firstDateOfMonth :DateTime = DateTime.fromISO(`${year}-${mmMonth}-01`);
        searchTerm = getUTCDateRangeSearchString(datetimeStartPTID, 'month', firstDateOfMonth);
      }
      else if (timeFrame === YEARLY) {
        const firstDateOfYear :DateTime = DateTime.fromISO(`${year}-01-01`);
        searchTerm = getUTCDateRangeSearchString(datetimeStartPTID, 'year', firstDateOfYear);
      }
      searchOptions.constraints.push({
        min: 1,
        constraints: [{
          searchTerm,
          fuzzy: false
        }]
      });
      response = yield call(executeSearchWorker, executeSearch({ searchOptions }));
      if (response.error) throw response.error;
      const checkIns :List = fromJS(response.data.hits);
      const checkInEKIDs :UUID[] = [];
      checkIns.forEach((checkIn :Map) => checkInEKIDs.push(getEntityKeyId(checkIn)));

      if (checkInEKIDs.length) {
        response = yield call(getCheckInNeighborsWorker, getCheckInNeighbors({ checkInEKIDs }));
        if (response.error) throw response.error;
        const {
          checkInDetailsByCheckInEKID,
          checkInEKIDByAppointmentEKID,
          worksiteNameByWorksitePlanEKID,
          worksitePlanEKIDByAppointmentEKID,
        } = response.data;

        const hoursByCheckInEKID :Map = Map().withMutations((map :Map) => {
          checkInDetailsByCheckInEKID.forEach((checkInDetails :Map, checkInEKID :UUID) => {
            const { [HOURS_WORKED]: hoursWorked } = getEntityProperties(checkInDetails, [HOURS_WORKED]);
            map.set(checkInEKID, hoursWorked);
          });
        });

        checkInEKIDByAppointmentEKID.forEach((checkInEKID :UUID, appointmentEKID :UUID) => {
          const worksitePlanEKID :UUID = worksitePlanEKIDByAppointmentEKID.get(appointmentEKID, '');
          const worksiteName :string = worksiteNameByWorksitePlanEKID.get(worksitePlanEKID, '');
          const hours :number = hoursByCheckInEKID.get(checkInEKID, 0);
          if (worksiteName.length) {
            const hoursTotalForWorksite :number = hoursByWorksite.get(worksiteName, 0);
            hoursByWorksite = hoursByWorksite.set(worksiteName, hoursTotalForWorksite + hours);
          }
        });
      }
    }

    hoursByWorksite = hoursByWorksite.asImmutable();
    yield put(getHoursWorkedByWorksite.success(id, hoursByWorksite));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getHoursWorkedByWorksite.failure(id, error));
  }
  finally {
    yield put(getHoursWorkedByWorksite.finally(id));
  }
}

function* getHoursWorkedByWorksiteWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_HOURS_WORKED_BY_WORKSITE, getHoursWorkedByWorksiteWorker);
}

/*
 *
 * WorksiteStatsActions.getMonthlyParticipantsByWorksite()
 *
 */

function* getMonthlyParticipantsByWorksiteWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let response :Object = {};
  let participantsByWorksite :Map = Map().asMutable();

  try {
    yield put(getMonthlyParticipantsByWorksite.request(id));

    response = yield call(getWorksitesWorker, getWorksites());
    if (response.error) throw response.error;
    const { worksites } = response.data;

    worksites.forEach((worksite :Map) => {
      const { [NAME]: worksiteName } = getEntityProperties(worksite, [NAME]);
      if (worksiteName.length) participantsByWorksite.set(worksiteName, List());
    });

    const { month, year } = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const checkInsESID :UUID = getEntitySetIdFromApp(app, CHECK_INS);
    const datetimeStartPTID :UUID = getPropertyTypeIdFromEdm(edm, DATETIME_START);
    const searchOptions = {
      entitySetIds: [checkInsESID],
      start: 0,
      maxHits: 10000,
      constraints: []
    };
    const mmMonth :string = month < 10 ? `0${month}` : month;
    const firstDateOfMonth :DateTime = DateTime.fromISO(`${year}-${mmMonth}-01`);
    const searchTerm :string = getUTCDateRangeSearchString(datetimeStartPTID, 'month', firstDateOfMonth);
    searchOptions.constraints.push({
      min: 1,
      constraints: [{
        searchTerm,
        fuzzy: false
      }]
    });
    response = yield call(executeSearchWorker, executeSearch({ searchOptions }));
    if (response.error) throw response.error;
    const checkIns :List = fromJS(response.data.hits);
    const checkInEKIDs :UUID[] = [];
    checkIns.forEach((checkIn :Map) => checkInEKIDs.push(getEntityKeyId(checkIn)));

    if (checkInEKIDs.length) {
      response = yield call(getCheckInNeighborsWorker, getCheckInNeighbors({ checkInEKIDs }));
      if (response.error) throw response.error;
      const {
        checkInEKIDByAppointmentEKID,
        personNameByWorksitePlanEKID,
        worksiteNameByWorksitePlanEKID,
        worksitePlanEKIDByAppointmentEKID,
      } = response.data;

      checkInEKIDByAppointmentEKID.forEach((checkInEKID :UUID, appointmentEKID :UUID) => {
        const worksitePlanEKID :UUID = worksitePlanEKIDByAppointmentEKID.get(appointmentEKID, '');
        const worksiteName :string = worksiteNameByWorksitePlanEKID.get(worksitePlanEKID, '');
        const personName :string = personNameByWorksitePlanEKID.get(worksitePlanEKID, '');
        if (personName.length && worksiteName.length) {
          let participants :List = participantsByWorksite.get(worksiteName, List());
          if (!participants.includes(personName)) participants = participants.push(personName);
          participantsByWorksite = participantsByWorksite.set(worksiteName, participants);
        }
      });
    }
    participantsByWorksite = participantsByWorksite.asImmutable();

    yield put(getMonthlyParticipantsByWorksite.success(id, participantsByWorksite));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getMonthlyParticipantsByWorksite.failure(id, error));
  }
  finally {
    yield put(getMonthlyParticipantsByWorksite.finally(id));
  }
}

function* getMonthlyParticipantsByWorksiteWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_MONTHLY_PARTICIPANTS_BY_WORKSITE, getMonthlyParticipantsByWorksiteWorker);
}

export {
  getCheckInNeighborsWatcher,
  getCheckInNeighborsWorker,
  getHoursWorkedByWorksiteWatcher,
  getHoursWorkedByWorksiteWorker,
  getMonthlyParticipantsByWorksiteWatcher,
  getMonthlyParticipantsByWorksiteWorker,
  getWorksitesWatcher,
  getWorksitesWorker,
};
