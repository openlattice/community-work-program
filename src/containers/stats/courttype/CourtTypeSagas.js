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
import type { SequenceAction } from 'redux-reqseq';

import {
  DOWNLOAD_COURT_TYPE_DATA,
  GET_ENROLLMENTS_BY_COURT_TYPE,
  GET_HOURS_BY_COURT_TYPE,
  GET_MONTHLY_PARTICIPANTS_BY_COURT_TYPE,
  GET_TOTAL_PARTICIPANTS_BY_COURT_TYPE,
  downloadCourtTypeData,
  getEnrollmentsByCourtType,
  getHoursByCourtType,
  getMonthlyParticipantsByCourtType,
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
} from '../../../utils/DataUtils';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { isDefined, isEmptyString } from '../../../utils/LangUtils';
import { getPersonFullName } from '../../../utils/PeopleUtils';
import { STATE } from '../../../utils/constants/ReduxStateConsts';
import { ACTIVE_STATUSES, courtTypeCountObj } from '../consts/CourtTypeConsts';
import { DOWNLOAD_CONSTS } from '../consts/StatsConsts';
import { ALL_TIME, MONTHLY, YEARLY } from '../consts/TimeConsts';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { searchEntitySetData, searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntitySetDataWorker, searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const { getEntityKeyId } = DataUtils;
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
  DATETIME_START,
  EFFECTIVE_DATE,
  HOURS_WORKED,
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
    let listOfParticipantsAndTheirHours :List = updatedMap
      .get(courtType, List());
    if (!listOfParticipantsAndTheirHours.find((participantMap :Map) => participantMap
      .get('personName') === personName)) {
      listOfParticipantsAndTheirHours = listOfParticipantsAndTheirHours.push(fromJS({ personName, hours: 0 }));
    }
    updatedMap = updatedMap.set(courtType, listOfParticipantsAndTheirHours);
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
      fromJS(response.data).forEach((plan :Map) => {
        const planEKID :?UUID = getEntityKeyId(plan);
        if (planEKID) diversionPlans.push(planEKID);
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
            const { [COURT_CASE_TYPE]: courtType } = getEntityProperties(
              getNeighborDetails(courtCaseNeighbor),
              [COURT_CASE_TYPE]
            );

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
    .map(() => List());

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
            let listOfParticipantsAndTheirHours :List = monthlyParticipantsByCourtType.get(courtType, List());
            if (!listOfParticipantsAndTheirHours
              .find((participantMap :Map) => participantMap.get('personName') === personName)) {
              listOfParticipantsAndTheirHours = listOfParticipantsAndTheirHours.push(fromJS({ personName, hours }));
            }
            else {
              const participantIndex :number = listOfParticipantsAndTheirHours
                .findIndex((participantMap :Map) => participantMap.get('personName') === personName);
              listOfParticipantsAndTheirHours = listOfParticipantsAndTheirHours
                .setIn(
                  [participantIndex, 'hours'],
                  listOfParticipantsAndTheirHours.getIn([participantIndex, 'hours']) + hours
                );
            }
            monthlyParticipantsByCourtType = monthlyParticipantsByCourtType
              .set(courtType, listOfParticipantsAndTheirHours);
          }
        });
      });
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
    const enrollmentStatusEKIDs :UUID[] = [];
    const enrollmentStatusByEKID :Map = Map().withMutations((map :Map) => {
      enrollmentStatuses.forEach((enrollmentStatus :Map) => {
        const enrollmentStatusEKID :?UUID = getEntityKeyId(enrollmentStatus);
        if (enrollmentStatusEKID) enrollmentStatusEKIDs.push(enrollmentStatusEKID);
        map.set(enrollmentStatusEKID, enrollmentStatus);
      });
    });

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
          const { [COURT_CASE_TYPE]: courtType } = getEntityProperties(courtCase, [COURT_CASE_TYPE]);
          const enrollmentStatusesForDiversionPlan :List = enrollmentStatusEKIDsByDiversionPlanEKID
            .get(diversionPlanEKID, List());
          /*
            i'll add all enrollment statuses here, but this could be revised to use only the most
            recent enrollment status, so enrollments (diversionPlans) aren't double counted:
          */
          enrollmentStatusesForDiversionPlan.forEach((enrollmentStatusEKID :UUID) => {
            const enrollmentStatus :Map = enrollmentStatusByEKID.get(enrollmentStatusEKID, Map());
            const { [STATUS]: status } = getEntityProperties(enrollmentStatus, [STATUS]);

            if (ACTIVE_STATUSES.includes(status)) {
              const count :number = activeEnrollmentsByCourtType.get(courtType, 0);
              activeEnrollmentsByCourtType = activeEnrollmentsByCourtType.set(courtType, count + 1);
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
        });
      }
    }

    activeEnrollmentsByCourtType = activeEnrollmentsByCourtType.asImmutable();
    closedEnrollmentsByCourtType = closedEnrollmentsByCourtType.asImmutable();
    jobSearchEnrollmentsByCourtType = jobSearchEnrollmentsByCourtType.asImmutable();
    successfulEnrollmentsByCourtType = successfulEnrollmentsByCourtType.asImmutable();
    unsuccessfulEnrollmentsByCourtType = unsuccessfulEnrollmentsByCourtType.asImmutable();

    yield put(getEnrollmentsByCourtType.success(id, {
      activeEnrollmentsByCourtType,
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

export {
  downloadCourtTypeDataWatcher,
  downloadCourtTypeDataWorker,
  getEnrollmentsByCourtTypeWatcher,
  getEnrollmentsByCourtTypeWorker,
  getHoursByCourtTypeWatcher,
  getHoursByCourtTypeWorker,
  getMonthlyParticipantsByCourtTypeWatcher,
  getMonthlyParticipantsByCourtTypeWorker,
  getTotalParticipantsByCourtTypeWatcher,
  getTotalParticipantsByCourtTypeWorker,
};
