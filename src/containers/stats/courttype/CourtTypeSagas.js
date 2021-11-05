/*
 * @flow
 */

import FS from 'file-saver';
import Papa from 'papaparse';
import isFunction from 'lodash/isFunction';
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, fromJS } from 'immutable';
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import { DataUtils } from 'lattice-utils';
import { DateTime } from 'luxon';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import {
  DOWNLOAD_COURT_TYPE_DATA,
  GET_ENROLLMENTS_BY_COURT_TYPE,
  GET_HOURS_BY_COURT_TYPE,
  GET_MONTHLY_PARTICIPANTS_BY_COURT_TYPE,
  GET_MONTHLY_PARTICIPANTS_WITH_NO_CHECK_INS,
  GET_REFERRALS_BY_COURT_TYPE,
  GET_TOTAL_PARTICIPANTS_BY_COURT_TYPE,
  downloadCourtTypeData,
  getEnrollmentsByCourtType,
  getHoursByCourtType,
  getMonthlyParticipantsByCourtType,
  getMonthlyParticipantsWithNoCheckIns,
  getReferralsByCourtType,
  getTotalParticipantsByCourtType,
} from './CourtTypeActions';

import Logger from '../../../utils/Logger';
import { ENROLLMENT_STATUSES } from '../../../core/edm/constants/DataModelConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import {
  getEntityProperties,
  getEntitySetIdFromApp,
  getNeighborDetails,
  getNeighborESID,
  getPropertyTypeIdFromEdm,
  getUTCDateRangeSearchString,
  sortEntitiesByDateProperty,
} from '../../../utils/DataUtils';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { isDefined, isEmptyString } from '../../../utils/LangUtils';
import { getPersonFullName } from '../../../utils/PeopleUtils';
import { STATE } from '../../../utils/constants/ReduxStateConsts';
import { COMPLETION_STATUSES } from '../../participants/ParticipantsConstants';
import { ACTIVE_STATUSES, courtTypeCountObj } from '../consts/CourtTypeConsts';
import { DOWNLOAD_CONSTS } from '../consts/StatsConsts';
import { ALL_TIME, MONTHLY, YEARLY } from '../consts/TimeConsts';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { searchEntitySetData, searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntitySetDataWorker, searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const { getEntityKeyId, getPropertyValue } = DataUtils;
const {
  APPOINTMENT,
  CHECK_INS,
  CHECK_IN_DETAILS,
  DIVERSION_PLAN,
  ENROLLMENT_STATUS,
  MANUAL_PRETRIAL_COURT_CASES,
  PEOPLE,
  WORKSITE_PLAN,
} = APP_TYPE_FQNS;
const {
  CHECK_IN_DATETIME,
  COURT_CASE_TYPE,
  DATETIME_RECEIVED,
  DATETIME_START,
  EFFECTIVE_DATE,
  HOURS_WORKED,
  ORIENTATION_DATETIME,
  STATUS,
} = PROPERTY_TYPE_FQNS;

const getAppFromState = (state) => state.get(STATE.APP, Map());
const getEdmFromState = (state) => state.get(STATE.EDM, Map());
const LOG = new Logger('CourtTypeSagas');

/*
 * updateMonthlyParticipantMap
 */

const updateMonthlyParticipantMap = (
  participantsAndHoursByCourtType :Map,
  diversionPlanEKID :UUID,
  personNameByDiversionPlanEKID :Map,
  courtCaseByDiversionPlanEKID :Map,
) => {

  let updatedMap :Map = participantsAndHoursByCourtType;
  const personName = personNameByDiversionPlanEKID.get(diversionPlanEKID, '');
  const courtCase = courtCaseByDiversionPlanEKID.get(diversionPlanEKID, Map());
  const { [COURT_CASE_TYPE]: courtType } = getEntityProperties(courtCase, [COURT_CASE_TYPE]);
  if (isDefined(updatedMap.get(courtType))) {
    let participantsAndTheirHoursByCourtType :Map = updatedMap.get(courtType, Map());
    const participantHours = participantsAndTheirHoursByCourtType.get(personName, 0);
    participantsAndTheirHoursByCourtType = participantsAndTheirHoursByCourtType.set(personName, participantHours);
    updatedMap = updatedMap.set(courtType, participantsAndTheirHoursByCourtType);
  }
  return updatedMap;
};

/*
 *
 * CourtTypeActions.downloadCourtTypeData()
 *
 */

function* downloadCourtTypeDataWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(downloadCourtTypeData.request(id));

    const { courtTypeData, fileName, getBottomRow } = value;
    let csvData :Object[] = courtTypeData.map((row :Map) => {
      const newCSVObject :Object = {};
      newCSVObject['Court Type'] = row.get(DOWNLOAD_CONSTS.COURT_TYPE, '');

      if (isDefined(row.get(DOWNLOAD_CONSTS.STATUSES))) {
        row.get(DOWNLOAD_CONSTS.STATUSES).forEach((statusCount :Map) => {
          newCSVObject[statusCount.get(DOWNLOAD_CONSTS.STATUS)] = statusCount.get(DOWNLOAD_CONSTS.COUNT);
        });
      }

      if (isDefined(row.get('Participants'))) newCSVObject.Participants = row.get('Participants');
      if (isDefined(row.get('Participant'))) newCSVObject.Participant = row.get('Participant');
      if (isDefined(row.get('Hours'))) newCSVObject.Hours = row.get('Hours');

      if (isDefined(row.get(DOWNLOAD_CONSTS.TOTAL))) newCSVObject.Total = row.get(DOWNLOAD_CONSTS.TOTAL);
      return newCSVObject;
    }).toJS();

    csvData = csvData.sort((row1 :Object, row2 :Object) => {
      if (row1.Total > row2.Total) return -1;
      if (row1.Total < row2.Total) return 1;
      return 0;
    });

    if (isFunction(getBottomRow)) {
      const total = getBottomRow(csvData);
      csvData.push(total);
    }
    else if (isDefined(csvData[0].Total)) {
      const countTotal :number = csvData.map((obj :Object) => obj.Total)
        .reduce((sum :number, count :number) => sum + count);
      const total = {
        'Court Type': DOWNLOAD_CONSTS.TOTAL_FOR_ALL_COURT_TYPES,
        Total: countTotal,
      };
      csvData.push(total);
    }

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], {
      type: 'application/json'
    });
    FS.saveAs(blob, fileName.concat('.csv'));
    yield put(downloadCourtTypeData.success(id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(downloadCourtTypeData.failure(id, error));
  }
  finally {
    yield put(downloadCourtTypeData.finally(id));
  }
}

function* downloadCourtTypeDataWatcher() :Generator<*, *, *> {

  yield takeEvery(DOWNLOAD_COURT_TYPE_DATA, downloadCourtTypeDataWorker);
}

/*
 *
 * CourtTypeActions.getHoursByCourtType()
 *
 */

function* getHoursByCourtTypeWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  let response :Object = {};
  let hoursByCourtType :Map = fromJS(courtTypeCountObj).asMutable();

  try {
    yield put(getHoursByCourtType.request(id));
    const { month, timeFrame, year } = value;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const checkInsESID :UUID = getEntitySetIdFromApp(app, CHECK_INS);
    const datetimeStartPTID :UUID = getPropertyTypeIdFromEdm(edm, DATETIME_START);
    const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);

    let searchFilter :Object = {};
    const worksitePlanEKIDs :UUID[] = [];

    let worksitePlanEKIDsByAppointmentEKIDs :Map = Map().asMutable();
    let appointmentEKIDsByCheckInEKIDs :Map = Map().asMutable();
    let hoursByCheckInEKID :Map = Map().asMutable();

    let hoursByWorksitePlanEKID :Map = Map().asMutable();

    if (timeFrame !== ALL_TIME) {
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

      response = yield call(searchEntitySetDataWorker, searchEntitySetData(searchOptions));
      if (response.error) throw response.error;
      const checkInsWithinMonth :List = fromJS(response.data.hits);

      const checkInEKIDs :UUID[] = [];
      checkInsWithinMonth.forEach((checkIn :Map) => {
        const checkInEKID :?UUID = getEntityKeyId(checkIn);
        if (checkInEKID) checkInEKIDs.push(checkInEKID);
      });

      if (checkInEKIDs.length) {
        const appointmentESID :UUID = getEntitySetIdFromApp(app, APPOINTMENT);
        const checkInDetailsESID :UUID = getEntitySetIdFromApp(app, CHECK_IN_DETAILS);
        searchFilter = {
          entityKeyIds: checkInEKIDs,
          destinationEntitySetIds: [appointmentESID, checkInDetailsESID],
          sourceEntitySetIds: [],
        };
        response = yield call(
          searchEntityNeighborsWithFilterWorker,
          searchEntityNeighborsWithFilter({ entitySetId: checkInsESID, filter: searchFilter })
        );
        if (response.error) throw response.error;
        const appointmentAndPeopleNeighbors :Map = fromJS(response.data);
        const appointmentEKIDs :UUID[] = [];

        appointmentAndPeopleNeighbors.forEach((neighborsList :List, checkInEKID :UUID) => {
          const appointmentNeighbor :Map = neighborsList
            .find((neighbor :Map) => getNeighborESID(neighbor) === appointmentESID);
          const appointmentEKID :?UUID = getEntityKeyId(getNeighborDetails(appointmentNeighbor));
          if (isDefined(appointmentEKID)) appointmentEKIDs.push(appointmentEKID);
          appointmentEKIDsByCheckInEKIDs.set(checkInEKID, appointmentEKID);

          const checkInDetailsNeighbor :Map = neighborsList
            .find((neighbor :Map) => getNeighborESID(neighbor) === checkInDetailsESID);
          const checkInDetails :Map = getNeighborDetails(checkInDetailsNeighbor);
          const { [HOURS_WORKED]: hoursWorked } = getEntityProperties(checkInDetails, [HOURS_WORKED]);
          hoursByCheckInEKID.set(checkInEKID, hoursWorked);
        });
        appointmentEKIDsByCheckInEKIDs = appointmentEKIDsByCheckInEKIDs.asImmutable();
        hoursByCheckInEKID = hoursByCheckInEKID.asImmutable();

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
        fromJS(response.data).forEach((neighborsList :List, appointmentEKID :UUID) => {
          const worksitePlanEKID :?UUID = getEntityKeyId(getNeighborDetails(neighborsList.get(0)));
          if (worksitePlanEKID) worksitePlanEKIDs.push(worksitePlanEKID);
          worksitePlanEKIDsByAppointmentEKIDs.set(appointmentEKID, worksitePlanEKID);
        });

        worksitePlanEKIDsByAppointmentEKIDs = worksitePlanEKIDsByAppointmentEKIDs.asImmutable();
      }
    }
    else {
      response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: worksitePlanESID }));
      if (response.error) throw response.error;
      fromJS(response.data).forEach((plan :Map) => {
        const worksitePlanEKID :?UUID = getEntityKeyId(plan);
        if (worksitePlanEKID) worksitePlanEKIDs.push(worksitePlanEKID);
        const { [HOURS_WORKED]: hours } = getEntityProperties(plan, [HOURS_WORKED]);
        const hoursToSet :number = isEmptyString(hours) ? 0 : hours;
        hoursByWorksitePlanEKID.set(worksitePlanEKID, hoursToSet);
      });
      hoursByWorksitePlanEKID = hoursByWorksitePlanEKID.asImmutable();
    }

    if (worksitePlanEKIDs.length) {
      searchFilter = {
        entityKeyIds: worksitePlanEKIDs,
        destinationEntitySetIds: [diversionPlanESID],
        sourceEntitySetIds: [],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: worksitePlanESID, filter: searchFilter })
      );
      if (response.error) throw response.error;
      const diversionPlanEKIDs :UUID[] = [];
      const diversionPlanEKIDsByWorksitePlanEKIDs :Map = Map().withMutations((map :Map) => {
        fromJS(response.data).forEach((neighborsList :List, worksitePlanEKID :UUID) => {
          const diversionPlanEKID :?UUID = getEntityKeyId(getNeighborDetails(neighborsList.get(0)));
          if (diversionPlanEKID) diversionPlanEKIDs.push(diversionPlanEKID);
          map.set(worksitePlanEKID, diversionPlanEKID);
        });
      }).asImmutable();

      const courtCaseESID :UUID = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
      searchFilter = {
        entityKeyIds: diversionPlanEKIDs,
        destinationEntitySetIds: [courtCaseESID],
        sourceEntitySetIds: [],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter: searchFilter })
      );
      if (response.error) throw response.error;
      const courtTypesByDiversionPlanEKIDs :Map = Map().withMutations((map :Map) => {
        fromJS(response.data).forEach((neighborsList :List, diversionPlanEKID :UUID) => {
          const courtCase :Map = getNeighborDetails(neighborsList.get(0));
          const { [COURT_CASE_TYPE]: courtType } = getEntityProperties(courtCase, [COURT_CASE_TYPE]);
          map.set(diversionPlanEKID, courtType);
        });
      }).asImmutable();

      if (timeFrame === MONTHLY || timeFrame === YEARLY) {
        hoursByCheckInEKID.forEach((hoursTotal :number, checkInEKID :UUID) => {
          const appointmentEKID :UUID = appointmentEKIDsByCheckInEKIDs.get(checkInEKID, '');
          const worksitePlanEKID :UUID = worksitePlanEKIDsByAppointmentEKIDs.get(appointmentEKID, '');
          const diversionPlanEKID :UUID = diversionPlanEKIDsByWorksitePlanEKIDs.get(worksitePlanEKID, '');
          const courtType :string = courtTypesByDiversionPlanEKIDs.get(diversionPlanEKID, '');
          if (isDefined(hoursByCourtType.get(courtType))) {
            const hours :number = hoursByCourtType
              .get(courtType, 0);
            hoursByCourtType = hoursByCourtType
              .set(courtType, hours + hoursTotal);
          }
        });
      }
      else {
        hoursByWorksitePlanEKID.forEach((hoursForWorksitePlan :number, worksitePlanEKID :UUID) => {
          const diversionPlanEKID :UUID = diversionPlanEKIDsByWorksitePlanEKIDs.get(worksitePlanEKID, '');
          const courtType :string = courtTypesByDiversionPlanEKIDs.get(diversionPlanEKID, '');

          if (isDefined(hoursByCourtType.get(courtType))) {
            const hoursTotalForCourtType :number = hoursByCourtType
              .get(courtType, 0);
            hoursByCourtType = hoursByCourtType
              .set(courtType, hoursTotalForCourtType + hoursForWorksitePlan);
          }
        });
      }
    }

    yield put(getHoursByCourtType.success(id, hoursByCourtType));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getHoursByCourtType.failure(id, error));
  }
  finally {
    yield put(getHoursByCourtType.finally(id));
  }
}

function* getHoursByCourtTypeWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_HOURS_BY_COURT_TYPE, getHoursByCourtTypeWorker);
}

/*
 *
 * CourtTypeActions.getTotalParticipantsByCourtType()
 *
 */

function* getTotalParticipantsByCourtTypeWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;
  let response :Object = {};
  let totalParticipantsByCourtType :Map = fromJS(courtTypeCountObj).asMutable();

  try {
    yield put(getTotalParticipantsByCourtType.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const { month, timeFrame, year } = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
    const diversionPlanEKIDs :UUID[] = [];

    if (timeFrame === ALL_TIME) {
      response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: diversionPlanESID }));
      if (response.error) throw response.error;
      fromJS(response.data).forEach((plan :Map) => {
        const planEKID :?UUID = getEntityKeyId(plan);
        if (planEKID) diversionPlanEKIDs.push(planEKID);
      });
    }
    else {
      const searchOptions = {
        entitySetIds: [diversionPlanESID],
        start: 0,
        maxHits: 10000,
        constraints: []
      };

      let searchTerm :string = '';
      const checkInDatetimePTID :string = getPropertyTypeIdFromEdm(edm, CHECK_IN_DATETIME);

      if (timeFrame === MONTHLY) {
        const mmMonth :string = month < 10 ? `0${month}` : month;
        const firstDateOfMonth :DateTime = DateTime.fromISO(`${year}-${mmMonth}-01`);
        searchTerm = getUTCDateRangeSearchString(checkInDatetimePTID, 'month', firstDateOfMonth);
      }
      else if (timeFrame === YEARLY) {
        const firstDateOfYear :DateTime = DateTime.fromISO(`${year}-01-01`);
        searchTerm = getUTCDateRangeSearchString(checkInDatetimePTID, 'year', firstDateOfYear);
      }
      searchOptions.constraints.push({
        min: 1,
        constraints: [{
          searchTerm,
          fuzzy: false
        }]
      });
      response = yield call(searchEntitySetDataWorker, searchEntitySetData(searchOptions));
      if (response.error) throw response.error;
      const diversionPlans :List = fromJS(response.data.hits);
      diversionPlans.forEach((plan :Map) => {
        const planEKID :?UUID = getEntityKeyId(plan);
        if (planEKID) diversionPlanEKIDs.push(planEKID);
      });
    }

    if (diversionPlanEKIDs.length) {

      const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);
      const courtCaseESID :UUID = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
      const searchFilter :Object = {
        entityKeyIds: diversionPlanEKIDs,
        destinationEntitySetIds: [courtCaseESID],
        sourceEntitySetIds: [peopleESID],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter: searchFilter })
      );
      if (response.error) throw response.error;
      const diversionPlanNeighbors :Map = fromJS(response.data);

      Map().withMutations((map :Map) => {

        diversionPlanNeighbors.forEach((neighborsList :List) => {
          const personNeighbor :Map = neighborsList.find((neighbor :Map) => getNeighborESID(neighbor) === peopleESID);
          const courtCaseNeighbor :Map = neighborsList
            .find((neighbor :Map) => getNeighborESID(neighbor) === courtCaseESID);

          if (isDefined(courtCaseNeighbor)) {
            const courtType = getPropertyValue(getNeighborDetails(courtCaseNeighbor), [COURT_CASE_TYPE, 0]);

            const personEKID :?UUID = getEntityKeyId(getNeighborDetails(personNeighbor));
            let personCourtTypes :List = map.get(personEKID, List());

            if (!personCourtTypes.includes(courtType) && isDefined(totalParticipantsByCourtType.get(courtType))) {
              const totalForCourtType :number = totalParticipantsByCourtType.get(courtType);
              totalParticipantsByCourtType.set(courtType, totalForCourtType + 1);
              personCourtTypes = personCourtTypes.push(courtType);
            }

            map.set(personEKID, personCourtTypes);
          }
        });

      });
    }

    totalParticipantsByCourtType = totalParticipantsByCourtType.asImmutable();
    yield put(getTotalParticipantsByCourtType.success(id, totalParticipantsByCourtType));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getTotalParticipantsByCourtType.failure(id, error));
  }
  finally {
    yield put(getTotalParticipantsByCourtType.finally(id));
  }
}

function* getTotalParticipantsByCourtTypeWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_TOTAL_PARTICIPANTS_BY_COURT_TYPE, getTotalParticipantsByCourtTypeWorker);
}

function* getMonthlyParticipantsWithNoCheckInsWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  let monthlyParticipantsWithNoCheckInsByCourtType :Map = fromJS(courtTypeCountObj)
    .asMutable()
    .map(() => Map());
  let workerResponse :WorkerResponse = { data: {} };

  try {
    yield put(getMonthlyParticipantsWithNoCheckIns.request(id));
    const { month, year } = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const enrollmentStatusESID :UUID = getEntitySetIdFromApp(app, ENROLLMENT_STATUS);
    const effectiveDatePTID :UUID = getPropertyTypeIdFromEdm(edm, EFFECTIVE_DATE);

    const searchOptions = {
      entitySetIds: [enrollmentStatusESID],
      start: 0,
      maxHits: 10000,
      constraints: []
    };
    const mmMonth :string = month < 10 ? `0${month}` : `${month}`;
    const firstDateOfMonth = DateTime.fromISO(`${year}-${mmMonth}-01`);
    const searchTerm = getUTCDateRangeSearchString(effectiveDatePTID, 'month', firstDateOfMonth);
    searchOptions.constraints.push({
      min: 1,
      constraints: [{
        searchTerm,
        fuzzy: false
      }]
    });
    let response = yield call(searchEntitySetDataWorker, searchEntitySetData(searchOptions));
    if (response.error) throw response.error;
    const enrollmentStatusesDuringMonth :Object[] = response.data.hits;
    const enrollmentStatusEKIDs = enrollmentStatusesDuringMonth.map((status) => getEntityKeyId(status));

    if (enrollmentStatusEKIDs.length) {

      const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
      let searchFilter :Object = {
        entityKeyIds: enrollmentStatusEKIDs,
        destinationEntitySetIds: [diversionPlanESID],
        sourceEntitySetIds: [diversionPlanESID],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: enrollmentStatusESID, filter: searchFilter })
      );
      if (response.error) throw response.error;
      const diversionPlanEKIDs :UUID[] = [];
      fromJS(response.data).forEach((neighborsList :List) => {
        const diversionPlanEKID :?UUID = getEntityKeyId(getNeighborDetails(neighborsList.get(0)));
        if (diversionPlanEKID) diversionPlanEKIDs.push(diversionPlanEKID);
      });

      if (diversionPlanEKIDs.length) {

        const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);
        const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);
        const courtCaseESID :UUID = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
        searchFilter = {
          entityKeyIds: diversionPlanEKIDs,
          destinationEntitySetIds: [courtCaseESID],
          sourceEntitySetIds: [peopleESID, worksitePlanESID],
        };
        response = yield call(
          searchEntityNeighborsWithFilterWorker,
          searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter: searchFilter })
        );
        if (response.error) throw response.error;
        let worksitePlanEKIDs :UUID[] = [];
        let personNameByDiversionPlanEKID :Map = Map();
        let courtCaseByDiversionPlanEKID :Map = Map();
        const diversionPlanEKIDsWithNoWorksitePlans :UUID[] = [];
        const diversionPlanEKIDByWorksitePlanEKID = Map().withMutations((mutator) => {
          fromJS(response.data).forEach((neighborsList :List, diversionPlanEKID :UUID) => {
            const person = neighborsList.find((neighbor) => getNeighborESID(neighbor) === peopleESID);
            const personName = getPersonFullName(getNeighborDetails(person));
            personNameByDiversionPlanEKID = personNameByDiversionPlanEKID.set(diversionPlanEKID, personName);

            const worksitePlans = neighborsList
              .filter((neighbor) => getNeighborESID(neighbor) === worksitePlanESID)
              .map((neighbor) => getNeighborDetails(neighbor));
            const worksitePlanEKIDsForDiversionPlan = worksitePlans
              .map((worksitePlan) => getEntityKeyId(worksitePlan));
            if (worksitePlans.isEmpty()) {
              diversionPlanEKIDsWithNoWorksitePlans.push(diversionPlanEKID);
            }
            worksitePlanEKIDs = worksitePlanEKIDs.concat(worksitePlanEKIDsForDiversionPlan.toJS());
            worksitePlanEKIDsForDiversionPlan.forEach((worksitePlanEKID :UUID) => {
              mutator.set(worksitePlanEKID, diversionPlanEKID);
            });

            const courtCaseNeighbor = neighborsList.find((neighbor) => getNeighborESID(neighbor) === courtCaseESID);
            courtCaseByDiversionPlanEKID = courtCaseByDiversionPlanEKID
              .set(diversionPlanEKID, getNeighborDetails(courtCaseNeighbor));
          });
        });

        diversionPlanEKIDsWithNoWorksitePlans.forEach((diversionPlanEKID :UUID) => {
          monthlyParticipantsWithNoCheckInsByCourtType = updateMonthlyParticipantMap(
            monthlyParticipantsWithNoCheckInsByCourtType,
            diversionPlanEKID,
            personNameByDiversionPlanEKID,
            courtCaseByDiversionPlanEKID,
          );
        });

        const appointmentESID :UUID = getEntitySetIdFromApp(app, APPOINTMENT);
        searchFilter = {
          entityKeyIds: worksitePlanEKIDs,
          destinationEntitySetIds: [],
          sourceEntitySetIds: [appointmentESID],
        };
        response = yield call(
          searchEntityNeighborsWithFilterWorker,
          searchEntityNeighborsWithFilter({ entitySetId: worksitePlanESID, filter: searchFilter })
        );
        if (response.error) throw response.error;
        let appointmentEKIDs :UUID[] = [];
        const worksitePlanEKIDByAppointmentEKID :Map = Map().withMutations((mutator) => {
          fromJS(response.data).forEach((neighborsList :List, worksitePlanEKID :UUID) => {
            const appointmentEKIDsForWorksitePlan = neighborsList
              .map((neighbor) => getEntityKeyId(getNeighborDetails(neighbor)));
            appointmentEKIDs = appointmentEKIDs.concat(appointmentEKIDsForWorksitePlan.toJS());
            appointmentEKIDsForWorksitePlan.forEach((appointmentEKID :UUID) => {
              mutator.set(appointmentEKID, worksitePlanEKID);
            });
          });
        });

        const worksitePlanEKIDsWithNoAppointments :UUID[] = worksitePlanEKIDs
          .filter((worksitePlanEKID :UUID) => !fromJS(response.data).keySeq().toList()
            .includes(worksitePlanEKID));

        worksitePlanEKIDsWithNoAppointments.forEach((worksitePlanEKID :UUID) => {
          const diversionPlanEKID :UUID = diversionPlanEKIDByWorksitePlanEKID.get(worksitePlanEKID, '');
          monthlyParticipantsWithNoCheckInsByCourtType = updateMonthlyParticipantMap(
            monthlyParticipantsWithNoCheckInsByCourtType,
            diversionPlanEKID,
            personNameByDiversionPlanEKID,
            courtCaseByDiversionPlanEKID,
          );
        });

        const checkInsESID :UUID = getEntitySetIdFromApp(app, CHECK_INS);
        searchFilter = {
          entityKeyIds: appointmentEKIDs,
          destinationEntitySetIds: [],
          sourceEntitySetIds: [checkInsESID],
        };
        response = yield call(
          searchEntityNeighborsWithFilterWorker,
          searchEntityNeighborsWithFilter({ entitySetId: appointmentESID, filter: searchFilter })
        );
        if (response.error) throw response.error;
        const checkInNeighborsByAppointmentEKID = fromJS(response.data);

        const appointmentEKIDsWithNoCheckIns :UUID[] = appointmentEKIDs
          .filter((appointmentEKID) => !checkInNeighborsByAppointmentEKID.keySeq().toList().includes(appointmentEKID));

        appointmentEKIDsWithNoCheckIns.forEach((appointmentEKID :UUID) => {
          const worksitePlanEKID :UUID = worksitePlanEKIDByAppointmentEKID.get(appointmentEKID, '');
          const diversionPlanEKID :UUID = diversionPlanEKIDByWorksitePlanEKID.get(worksitePlanEKID, '');
          monthlyParticipantsWithNoCheckInsByCourtType = updateMonthlyParticipantMap(
            monthlyParticipantsWithNoCheckInsByCourtType,
            diversionPlanEKID,
            personNameByDiversionPlanEKID,
            courtCaseByDiversionPlanEKID,
          );
        });
      }
      monthlyParticipantsWithNoCheckInsByCourtType = monthlyParticipantsWithNoCheckInsByCourtType.asImmutable();
      workerResponse = { data: monthlyParticipantsWithNoCheckInsByCourtType };
    }
    yield put(getMonthlyParticipantsWithNoCheckIns.success(id, monthlyParticipantsWithNoCheckInsByCourtType));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(getMonthlyParticipantsWithNoCheckIns.failure(id, error));
  }
  finally {
    yield put(getMonthlyParticipantsWithNoCheckIns.finally(id));
  }
  return workerResponse;
}

function* getMonthlyParticipantsWithNoCheckInsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_MONTHLY_PARTICIPANTS_WITH_NO_CHECK_INS, getMonthlyParticipantsWithNoCheckInsWorker);
}

/*
 *
 * CourtTypeActions.getMonthlyParticipantsByCourtType()
 *
 */

function* getMonthlyParticipantsByCourtTypeWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  let response :Object = {};
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let monthlyParticipantsByCourtType :Map = fromJS(courtTypeCountObj)
    .asMutable()
    .map(() => Map());

  try {
    yield put(getMonthlyParticipantsByCourtType.request(id));
    let { month, year } = value;
    const today :DateTime = DateTime.local();
    if (!month && !year) {
      month = today.month;
      year = today.year;
    }

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
    const mmMonth :string = month < 10 ? `0${month}` : `${month}`;
    const firstDateOfMonth = DateTime.fromISO(`${year}-${mmMonth}-01`);
    const searchTerm = getUTCDateRangeSearchString(datetimeStartPTID, 'month', firstDateOfMonth);
    searchOptions.constraints.push({
      min: 1,
      constraints: [{
        searchTerm,
        fuzzy: false
      }]
    });
    response = yield call(searchEntitySetDataWorker, searchEntitySetData(searchOptions));
    if (response.error) throw response.error;
    const checkIns :List = fromJS(response.data.hits);
    const checkInEKIDs :UUID[] = [];
    checkIns.forEach((checkIn :Map) => {
      const checkInEKID :?UUID = getEntityKeyId(checkIn);
      if (checkInEKID) checkInEKIDs.push(checkInEKID);
    });

    if (checkInEKIDs.length) {
      const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);
      const appointmentESID :UUID = getEntitySetIdFromApp(app, APPOINTMENT);
      const checkInDetailsESID :UUID = getEntitySetIdFromApp(app, CHECK_IN_DETAILS);
      let searchFilter :Object = {
        entityKeyIds: checkInEKIDs,
        destinationEntitySetIds: [appointmentESID, checkInDetailsESID],
        sourceEntitySetIds: [peopleESID],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: checkInsESID, filter: searchFilter })
      );
      if (response.error) throw response.error;
      const appointmentAndPeopleNeighbors :Map = fromJS(response.data);
      const appointmentEKIDs :UUID[] = [];

      let appointmentEKIDsByCheckInEKIDs :Map = Map().asMutable();
      let hoursByCheckInEKID :Map = Map().asMutable();
      let personNameByPersonEKID :Map = Map().asMutable();

      const checkInEKIDsByPersonEKID :Map = Map().withMutations((map :Map) => {
        appointmentAndPeopleNeighbors.forEach((neighborsList :List, checkInEKID :UUID) => {
          const appointmentNeighbor :Map = neighborsList
            .find((neighbor :Map) => getNeighborESID(neighbor) === appointmentESID);
          const appointmentEKID :?UUID = getEntityKeyId(getNeighborDetails(appointmentNeighbor));
          if (isDefined(appointmentEKID)) appointmentEKIDs.push(appointmentEKID);
          appointmentEKIDsByCheckInEKIDs = appointmentEKIDsByCheckInEKIDs.set(checkInEKID, appointmentEKID);

          const personNeighbor :Map = neighborsList
            .find((neighbor :Map) => getNeighborESID(neighbor) === peopleESID);
          const person :Map = getNeighborDetails(personNeighbor);
          const personEKID :?UUID = getEntityKeyId(person);
          map.update(personEKID, List(), (ekids) => ekids.concat(fromJS([checkInEKID])));

          const personName :string = getPersonFullName(person);
          personNameByPersonEKID = personNameByPersonEKID.set(personEKID, personName);

          const checkInDetailsNeighbor :Map = neighborsList
            .find((neighbor :Map) => getNeighborESID(neighbor) === checkInDetailsESID);
          const checkInDetails :Map = getNeighborDetails(checkInDetailsNeighbor);
          const { [HOURS_WORKED]: hoursWorked } = getEntityProperties(checkInDetails, [HOURS_WORKED]);
          hoursByCheckInEKID = hoursByCheckInEKID.set(checkInEKID, hoursWorked);
        });
      }).asImmutable();

      const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);
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
      const worksitePlanEKIDsByAppointmentEKIDs :Map = Map().withMutations((map :Map) => {
        fromJS(response.data).forEach((neighborsList :List, appointmentEKID :UUID) => {
          const worksitePlanEKID :?UUID = getEntityKeyId(getNeighborDetails(neighborsList.get(0)));
          if (worksitePlanEKID) worksitePlanEKIDs.push(worksitePlanEKID);
          map.set(appointmentEKID, worksitePlanEKID);
        });
      }).asImmutable();

      const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
      searchFilter = {
        entityKeyIds: worksitePlanEKIDs,
        destinationEntitySetIds: [diversionPlanESID],
        sourceEntitySetIds: [],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: worksitePlanESID, filter: searchFilter })
      );
      if (response.error) throw response.error;
      const diversionPlanEKIDs :UUID[] = [];
      const diversionPlanEKIDsByWorksitePlanEKIDs :Map = Map().withMutations((map :Map) => {
        fromJS(response.data).forEach((neighborsList :List, worksitePlanEKID :UUID) => {
          const diversionPlanEKID :?UUID = getEntityKeyId(getNeighborDetails(neighborsList.get(0)));
          if (diversionPlanEKID) diversionPlanEKIDs.push(diversionPlanEKID);
          map.set(worksitePlanEKID, diversionPlanEKID);
        });
      }).asImmutable();

      const courtCaseESID :UUID = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
      searchFilter = {
        entityKeyIds: diversionPlanEKIDs,
        destinationEntitySetIds: [courtCaseESID],
        sourceEntitySetIds: [],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter: searchFilter })
      );
      if (response.error) throw response.error;
      const courtTypesByDiversionPlanEKIDs :Map = Map().withMutations((map :Map) => {
        fromJS(response.data).forEach((neighborsList :List, diversionPlanEKID :UUID) => {
          const courtCase :Map = getNeighborDetails(neighborsList.get(0));
          const { [COURT_CASE_TYPE]: courtType } = getEntityProperties(courtCase, [COURT_CASE_TYPE]);
          map.set(diversionPlanEKID, courtType);
        });
      }).asImmutable();

      checkInEKIDsByPersonEKID.forEach((checkInEKIDsList :List, personEKID :UUID) => {
        checkInEKIDsList.forEach((checkInEKID :UUID) => {
          const appointmentEKID :UUID = appointmentEKIDsByCheckInEKIDs.get(checkInEKID, '');
          const worksitePlanEKID :UUID = worksitePlanEKIDsByAppointmentEKIDs.get(appointmentEKID, '');
          const diversionPlanEKID :UUID = diversionPlanEKIDsByWorksitePlanEKIDs.get(worksitePlanEKID, '');
          const courtType :string = courtTypesByDiversionPlanEKIDs.get(diversionPlanEKID, '');
          const personName :string = personNameByPersonEKID.get(personEKID, '');
          const hours :number = hoursByCheckInEKID.get(checkInEKID, 0);

          if (isDefined(monthlyParticipantsByCourtType.get(courtType))) {
            let hoursByParticipantName :Map = monthlyParticipantsByCourtType.get(courtType, Map());
            if (!isDefined(hoursByParticipantName.get(personName))) {
              hoursByParticipantName = hoursByParticipantName.set(personName, hours);
            }
            else {
              const currentHours = hoursByParticipantName.get(personName);
              hoursByParticipantName = hoursByParticipantName
                .set(personName, currentHours + hours);
            }
            monthlyParticipantsByCourtType = monthlyParticipantsByCourtType
              .set(courtType, hoursByParticipantName);
          }
        });
      });

      response = yield call(
        getMonthlyParticipantsWithNoCheckInsWorker,
        getMonthlyParticipantsWithNoCheckIns({ month, year })
      );
      if (response.error) throw response.error;
      const monthlyParticipantsWithNoCheckInsByCourtType :Map = response.data;

      monthlyParticipantsByCourtType = monthlyParticipantsWithNoCheckInsByCourtType
        .mergeDeepWith((oldVal, newVal) => oldVal + newVal, monthlyParticipantsByCourtType);

      monthlyParticipantsByCourtType = monthlyParticipantsByCourtType
        .map((courtTypeMap :Map) => (
          courtTypeMap
            .keySeq()
            .toList()
            .map((personName :string) => fromJS({ personName, hours: courtTypeMap.get(personName) }))
        ));
    }

    monthlyParticipantsByCourtType = monthlyParticipantsByCourtType.asImmutable();
    yield put(getMonthlyParticipantsByCourtType.success(id, monthlyParticipantsByCourtType));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getMonthlyParticipantsByCourtType.failure(id, error));
  }
  finally {
    yield put(getMonthlyParticipantsByCourtType.finally(id));
  }
}

function* getMonthlyParticipantsByCourtTypeWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_MONTHLY_PARTICIPANTS_BY_COURT_TYPE, getMonthlyParticipantsByCourtTypeWorker);
}

/*
 *
 * CourtTypeActions.getEnrollmentsByCourtType()
 *
 */

function* getEnrollmentsByCourtTypeWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let response :Object = {};
  let activeEnrollmentsByCourtType :Map = fromJS(courtTypeCountObj).asMutable();
  let becameActiveEnrollmentsByCourtType :Map = fromJS(courtTypeCountObj).asMutable();
  let closedEnrollmentsByCourtType :Map = fromJS(courtTypeCountObj).asMutable();
  let jobSearchEnrollmentsByCourtType :Map = fromJS(courtTypeCountObj).asMutable();
  let successfulEnrollmentsByCourtType :Map = fromJS(courtTypeCountObj).asMutable();
  let unsuccessfulEnrollmentsByCourtType :Map = fromJS(courtTypeCountObj).asMutable();

  try {
    yield put(getEnrollmentsByCourtType.request(id));

    const { month, timeFrame, year } = value;
    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const enrollmentStatusESID :UUID = getEntitySetIdFromApp(app, ENROLLMENT_STATUS);
    const effectiveDatePTID :UUID = getPropertyTypeIdFromEdm(edm, EFFECTIVE_DATE);

    const enrollmentStatusEKIDs :UUID[] = [];
    let enrollmentStatusByEKID :Map = Map();

    if (timeFrame === ALL_TIME) {
      response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: enrollmentStatusESID }));
      if (response.error) throw response.error;
      fromJS(response.data).forEach((enrollmentStatus) => {
        const effectiveDateTime = getPropertyValue(enrollmentStatus, [EFFECTIVE_DATE, 0], undefined);
        const status = getPropertyValue(enrollmentStatus, [STATUS, 0], undefined);
        if (isDefined(effectiveDateTime) && isDefined(status)) {
          const enrollmentStatusEKID = getEntityKeyId(enrollmentStatus);
          if (enrollmentStatusEKID) {
            enrollmentStatusEKIDs.push(enrollmentStatusEKID);
            enrollmentStatusByEKID = enrollmentStatusByEKID.set(enrollmentStatusEKID, enrollmentStatus);
          }
        }
      });
    }
    else {
      const searchOptions = {
        entitySetIds: [enrollmentStatusESID],
        start: 0,
        maxHits: 10000,
        constraints: []
      };

      let searchTerm :string = '';

      if (timeFrame === MONTHLY) {
        const mmMonth :string = month < 10 ? `0${month}` : month;
        const firstDateOfMonth :DateTime = DateTime.fromISO(`${year}-${mmMonth}-01`);
        searchTerm = getUTCDateRangeSearchString(effectiveDatePTID, 'month', firstDateOfMonth);
      }
      else if (timeFrame === YEARLY) {
        const firstDateOfYear :DateTime = DateTime.fromISO(`${year}-01-01`);
        searchTerm = getUTCDateRangeSearchString(effectiveDatePTID, 'year', firstDateOfYear);
      }
      searchOptions.constraints.push({
        min: 1,
        constraints: [{
          searchTerm,
          fuzzy: false
        }]
      });
      response = yield call(searchEntitySetDataWorker, searchEntitySetData(searchOptions));
      if (response.error) throw response.error;
      const enrollmentStatuses :List = fromJS(response.data.hits);
      enrollmentStatusByEKID = Map().withMutations((map :Map) => {
        enrollmentStatuses.forEach((enrollmentStatus :Map) => {
          const effectiveDateTime = getPropertyValue(enrollmentStatus, [EFFECTIVE_DATE, 0], undefined);
          const status = getPropertyValue(enrollmentStatus, [STATUS, 0], undefined);
          if (isDefined(effectiveDateTime) && isDefined(status)) {
            const enrollmentStatusEKID :?UUID = getEntityKeyId(enrollmentStatus);
            if (enrollmentStatusEKID) {
              enrollmentStatusEKIDs.push(enrollmentStatusEKID);
              map.set(enrollmentStatusEKID, enrollmentStatus);
            }
          }
        });
      });
    }

    if (enrollmentStatusEKIDs.length) {
      const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
      let searchFilter = {
        entityKeyIds: enrollmentStatusEKIDs,
        destinationEntitySetIds: [diversionPlanESID],
        sourceEntitySetIds: [diversionPlanESID],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: enrollmentStatusESID, filter: searchFilter })
      );
      if (response.error) throw response.error;
      const diversionPlanNeighbors :Map = fromJS(response.data);
      const diversionPlanEKIDs :UUID[] = [];
      const enrollmentStatusEKIDsByDiversionPlanEKID :Map = Map().withMutations((map :Map) => {
        diversionPlanNeighbors.forEach((neighborsList :List, enrollmentStatusEKID :UUID) => {
          const diversionPlanEKID :?UUID = getEntityKeyId(getNeighborDetails(neighborsList.get(0)));
          if (diversionPlanEKID) diversionPlanEKIDs.push(diversionPlanEKID);
          let enrollmentStatusesForDiversionPlan :List = map.get(diversionPlanEKID, List());
          enrollmentStatusesForDiversionPlan = enrollmentStatusesForDiversionPlan.push(enrollmentStatusEKID);
          map.set(diversionPlanEKID, enrollmentStatusesForDiversionPlan);
        });
      });

      if (diversionPlanEKIDs.length) {
        const courtCaseESID :UUID = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
        searchFilter = {
          entityKeyIds: diversionPlanEKIDs,
          destinationEntitySetIds: [courtCaseESID],
          sourceEntitySetIds: [],
        };
        response = yield call(
          searchEntityNeighborsWithFilterWorker,
          searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter: searchFilter })
        );
        if (response.error) throw response.error;
        const courtCaseNeighbors :Map = fromJS(response.data);
        courtCaseNeighbors.forEach((neighborsList :List, diversionPlanEKID :UUID) => {
          const courtCase :Map = getNeighborDetails(neighborsList.get(0));
          const courtType = getPropertyValue(courtCase, [COURT_CASE_TYPE, 0]);
          const enrollmentStatusEKIDsForDiversionPlan :List = enrollmentStatusEKIDsByDiversionPlanEKID
            .get(diversionPlanEKID, List());

          // find the most recent enrollment status for the diversion plan
          const enrollmentStatuses = enrollmentStatusEKIDsForDiversionPlan
            .map((enrollmentStatusEKID :UUID) => enrollmentStatusByEKID.get(enrollmentStatusEKID, Map()));
          let sortedEnrollmentStatuses = sortEntitiesByDateProperty(enrollmentStatuses, [EFFECTIVE_DATE]);
          sortedEnrollmentStatuses = sortedEnrollmentStatuses.sort((enrollmentStatus :Map) => {
            const status = getPropertyValue(enrollmentStatus, [STATUS, 0]);
            if (status === ENROLLMENT_STATUSES.AWAITING_CHECKIN) return -1;
            return 0;
          });
          const completionStatus :?Map = sortedEnrollmentStatuses.find((enrollmentStatus :Map) => {
            const status = getPropertyValue(enrollmentStatus, [STATUS, 0]);
            return COMPLETION_STATUSES.includes(status);
          });
          const mostRecentStatus :Map = completionStatus || sortedEnrollmentStatuses.last() || Map();

          // distribute enrollments by status and court type:
          const effectiveDateTime = getPropertyValue(mostRecentStatus, [EFFECTIVE_DATE, 0]);
          const status = getPropertyValue(mostRecentStatus, [STATUS, 0]);

          if (ACTIVE_STATUSES.includes(status)) {
            const count :number = activeEnrollmentsByCourtType.get(courtType, 0);
            activeEnrollmentsByCourtType = activeEnrollmentsByCourtType.set(courtType, count + 1);

            if (status === ENROLLMENT_STATUSES.ACTIVE) {
              const effectiveDateAsDateTime = DateTime.fromISO(effectiveDateTime);
              const becameActiveCount :number = becameActiveEnrollmentsByCourtType.get(courtType, 0);
              if (timeFrame === MONTHLY) {
                if (month === effectiveDateAsDateTime.month && year === effectiveDateAsDateTime.year) {
                  becameActiveEnrollmentsByCourtType = becameActiveEnrollmentsByCourtType
                    .set(courtType, becameActiveCount + 1);
                }
              }
              else if (timeFrame === YEARLY) {
                if (year === effectiveDateAsDateTime.year) {
                  becameActiveEnrollmentsByCourtType = becameActiveEnrollmentsByCourtType
                    .set(courtType, becameActiveCount + 1);
                }
              }
            }
          }
          if (status === ENROLLMENT_STATUSES.JOB_SEARCH) {
            const count :number = jobSearchEnrollmentsByCourtType.get(courtType, 0);
            jobSearchEnrollmentsByCourtType = jobSearchEnrollmentsByCourtType
              .set(courtType, count + 1);
          }
          if (status === ENROLLMENT_STATUSES.COMPLETED || status === ENROLLMENT_STATUSES.SUCCESSFUL) {
            const count :number = successfulEnrollmentsByCourtType.get(courtType, 0);
            successfulEnrollmentsByCourtType = successfulEnrollmentsByCourtType
              .set(courtType, count + 1);
          }
          if (status === ENROLLMENT_STATUSES.REMOVED_NONCOMPLIANT || status === ENROLLMENT_STATUSES.UNSUCCESSFUL) {
            const count :number = unsuccessfulEnrollmentsByCourtType.get(courtType, 0);
            unsuccessfulEnrollmentsByCourtType = unsuccessfulEnrollmentsByCourtType
              .set(courtType, count + 1);
          }
          if (status === ENROLLMENT_STATUSES.CLOSED) {
            const count :number = closedEnrollmentsByCourtType.get(courtType, 0);
            closedEnrollmentsByCourtType = closedEnrollmentsByCourtType
              .set(courtType, count + 1);
          }
        });
      }
    }

    activeEnrollmentsByCourtType = activeEnrollmentsByCourtType.asImmutable();
    becameActiveEnrollmentsByCourtType = becameActiveEnrollmentsByCourtType.asImmutable();
    closedEnrollmentsByCourtType = closedEnrollmentsByCourtType.asImmutable();
    jobSearchEnrollmentsByCourtType = jobSearchEnrollmentsByCourtType.asImmutable();
    successfulEnrollmentsByCourtType = successfulEnrollmentsByCourtType.asImmutable();
    unsuccessfulEnrollmentsByCourtType = unsuccessfulEnrollmentsByCourtType.asImmutable();

    yield put(getEnrollmentsByCourtType.success(id, {
      activeEnrollmentsByCourtType,
      becameActiveEnrollmentsByCourtType,
      closedEnrollmentsByCourtType,
      jobSearchEnrollmentsByCourtType,
      successfulEnrollmentsByCourtType,
      unsuccessfulEnrollmentsByCourtType,
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getEnrollmentsByCourtType.failure(id, error));
  }
  finally {
    yield put(getEnrollmentsByCourtType.finally(id));
  }
}

function* getEnrollmentsByCourtTypeWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_ENROLLMENTS_BY_COURT_TYPE, getEnrollmentsByCourtTypeWorker);
}

/*
 *
 * CourtTypeActions.getReferralsByCourtType()
 *
 */

function* getReferralsByCourtTypeWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let referralsByCourtType :Map = fromJS(courtTypeCountObj).asMutable();

  try {
    yield put(getReferralsByCourtType.request(id));
    const { month, timeFrame, year } = value;

    const app = yield select(getAppFromState);
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);

    let response :Object = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: diversionPlanESID }));
    if (response.error) throw response.error;
    const diversionPlans :List = fromJS(response.data);
    const diversionPlanEKIDs :UUID[] = diversionPlans.map((diversionPlan :Map) => getEntityKeyId(diversionPlan)).toJS();

    const courtCaseESID :UUID = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
    const filter = {
      entityKeyIds: diversionPlanEKIDs,
      destinationEntitySetIds: [courtCaseESID],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter })
    );
    if (response.error) throw response.error;
    const courtCaseByDiversionPlanEKID :Map = fromJS(response.data)
      .map((courtCaseNeighbors :List) => getNeighborDetails(courtCaseNeighbors.get(0)));

    if (timeFrame === ALL_TIME) {
      diversionPlans.forEach((diversionPlan :Map) => {
        const diversionPlanEKID :?UUID = getEntityKeyId(diversionPlan);
        const courtCase :Map = courtCaseByDiversionPlanEKID.get(diversionPlanEKID);
        const courtType = getPropertyValue(courtCase, [COURT_CASE_TYPE, 0]);

        const courtTypeReferralCount = referralsByCourtType.get(courtType);
        if (isDefined(courtTypeReferralCount)) referralsByCourtType.set(courtType, courtTypeReferralCount + 1);
      });
    }
    else {
      diversionPlans.forEach((diversionPlan :Map) => {
        const sentenceDateTime = getPropertyValue(diversionPlan, [DATETIME_RECEIVED, 0], undefined);
        const orientationDateTime = getPropertyValue(diversionPlan, [ORIENTATION_DATETIME, 0], undefined);
        const checkInDateTime = getPropertyValue(diversionPlan, [CHECK_IN_DATETIME, 0], undefined);
        const sentenceDateTimeObj = DateTime.fromISO(sentenceDateTime);
        const orientationDateTimeObj = DateTime.fromISO(orientationDateTime);
        const checkInDateTimeObj = DateTime.fromISO(checkInDateTime);

        const diversionPlanEKID :?UUID = getEntityKeyId(diversionPlan);
        const courtCase :Map = courtCaseByDiversionPlanEKID.get(diversionPlanEKID);
        const courtType = getPropertyValue(courtCase, [COURT_CASE_TYPE, 0]);
        const courtTypeReferralCount = referralsByCourtType.get(courtType);

        if (sentenceDateTimeObj.isValid && month === sentenceDateTimeObj.month && year === sentenceDateTimeObj.year) {
          if (isDefined(courtTypeReferralCount)) referralsByCourtType.set(courtType, courtTypeReferralCount + 1);
        }
        else if (orientationDateTimeObj.isValid
            && month === orientationDateTimeObj.month
            && year === orientationDateTimeObj.year) {

          if (isDefined(courtTypeReferralCount)) referralsByCourtType.set(courtType, courtTypeReferralCount + 1);
        }
        else if (checkInDateTimeObj.isValid
            && month === checkInDateTimeObj.month
            && year === checkInDateTimeObj.year) {

          if (isDefined(courtTypeReferralCount)) referralsByCourtType.set(courtType, courtTypeReferralCount + 1);
        }

      });
    }

    referralsByCourtType = referralsByCourtType.asImmutable();

    yield put(getReferralsByCourtType.success(id, referralsByCourtType));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getReferralsByCourtType.failure(id, error));
  }
  finally {
    yield put(getReferralsByCourtType.finally(id));
  }
}

function* getReferralsByCourtTypeWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_REFERRALS_BY_COURT_TYPE, getReferralsByCourtTypeWorker);
}

export {
  downloadCourtTypeDataWatcher,
  downloadCourtTypeDataWorker,
  getEnrollmentsByCourtTypeWatcher,
  getEnrollmentsByCourtTypeWorker,
  getHoursByCourtTypeWatcher,
  getHoursByCourtTypeWorker,
  getMonthlyParticipantsByCourtTypeWatcher,
  getMonthlyParticipantsByCourtTypeWorker,
  getMonthlyParticipantsWithNoCheckInsWatcher,
  getMonthlyParticipantsWithNoCheckInsWorker,
  getReferralsByCourtTypeWatcher,
  getReferralsByCourtTypeWorker,
  getTotalParticipantsByCourtTypeWatcher,
  getTotalParticipantsByCourtTypeWorker,
};
