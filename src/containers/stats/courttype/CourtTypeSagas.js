// @flow
import Papa from 'papaparse';
import FS from 'file-saver';
import isFunction from 'lodash/isFunction';
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
import { isDefined, isEmptyString } from '../../../utils/LangUtils';
import { getPersonFullName } from '../../../utils/PeopleUtils';
import {
  DOWNLOAD_COURT_TYPE_DATA,
  GET_ENROLLMENTS_BY_COURT_TYPE,
  GET_MONTHLY_COURT_TYPE_DATA,
  GET_MONTHLY_PARTICIPANTS_BY_COURT_TYPE,
  GET_TOTAL_PARTICIPANTS_BY_COURT_TYPE,
  downloadCourtTypeData,
  getEnrollmentsByCourtType,
  getMonthlyCourtTypeData,
  getMonthlyParticipantsByCourtType,
  getTotalParticipantsByCourtType,
} from './CourtTypeActions';
import { DOWNLOAD_CONSTS } from '../consts/StatsConsts';
import { STATE } from '../../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { ENROLLMENT_STATUSES } from '../../../core/edm/constants/DataModelConsts';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { ALL_TIME, MONTHLY, YEARLY } from '../consts/TimeConsts';
import { ACTIVE_STATUSES, courtTypeCountObj } from '../consts/CourtTypeConsts';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { executeSearch, searchEntityNeighborsWithFilter } = SearchApiActions;
const { executeSearchWorker, searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
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
 * CourtTypeActions.getMonthlyCourtTypeData()
 *
 */

function* getMonthlyCourtTypeDataWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  let response :Object = {};
  let monthlyHoursWorkedByCourtType :Map = fromJS(courtTypeCountObj).asMutable();
  let monthlyTotalParticipantsByCourtType :Map = fromJS(courtTypeCountObj).asMutable();

  try {
    yield put(getMonthlyCourtTypeData.request(id));
    const { month, timeFrame, year } = value;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const checkInsESID :UUID = getEntitySetIdFromApp(app, CHECK_INS);
    const datetimeStartPTID :UUID = getPropertyTypeIdFromEdm(edm, DATETIME_START);
    const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
    const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);

    let searchFilter :Object = {};
    const worksitePlanEKIDs :UUID[] = [];

    let worksitePlanEKIDsByAppointmentEKIDs :Map = Map().asMutable();
    let checkInEKIDsByPersonEKID :Map = Map().asMutable();
    let appointmentEKIDsByCheckInEKIDs :Map = Map().asMutable();
    let hoursByCheckInEKID :Map = Map().asMutable();

    let hoursByWorksitePlanEKID :Map = Map().asMutable();
    let personEKIDByWorksitePlanEKID :Map = Map().asMutable();

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

      response = yield call(executeSearchWorker, executeSearch({ searchOptions }));
      if (response.error) throw response.error;
      const checkInsWithinMonth :List = fromJS(response.data.hits);

      const checkInEKIDs :UUID[] = [];
      checkInsWithinMonth.forEach((checkIn :Map) => {
        const checkInEKID :UUID = getEntityKeyId(checkIn);
        checkInEKIDs.push(checkInEKID);
      });

      if (checkInEKIDs.length) {
        const appointmentESID :UUID = getEntitySetIdFromApp(app, APPOINTMENT);
        const checkInDetailsESID :UUID = getEntitySetIdFromApp(app, CHECK_IN_DETAILS);
        searchFilter = {
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

        appointmentAndPeopleNeighbors.forEach((neighborsList :List, checkInEKID :UUID) => {
          const appointmentNeighbor :Map = neighborsList
            .find((neighbor :Map) => getNeighborESID(neighbor) === appointmentESID);
          const appointmentEKID :UUID = getEntityKeyId(getNeighborDetails(appointmentNeighbor));
          if (isDefined(appointmentEKID)) appointmentEKIDs.push(appointmentEKID);
          appointmentEKIDsByCheckInEKIDs.set(checkInEKID, appointmentEKID);

          const personNeighbor :Map = neighborsList
            .find((neighbor :Map) => getNeighborESID(neighbor) === peopleESID);
          const personEKID :UUID = getEntityKeyId(getNeighborDetails(personNeighbor));
          checkInEKIDsByPersonEKID.update(personEKID, List(), (ekids) => ekids.concat(fromJS([checkInEKID])));

          const checkInDetailsNeighbor :Map = neighborsList
            .find((neighbor :Map) => getNeighborESID(neighbor) === checkInDetailsESID);
          const checkInDetails :Map = getNeighborDetails(checkInDetailsNeighbor);
          const { [HOURS_WORKED]: hoursWorked } = getEntityProperties(checkInDetails, [HOURS_WORKED]);
          hoursByCheckInEKID.set(checkInEKID, hoursWorked);
        });
        appointmentEKIDsByCheckInEKIDs = appointmentEKIDsByCheckInEKIDs.asImmutable();
        checkInEKIDsByPersonEKID = checkInEKIDsByPersonEKID.asImmutable();
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
          const worksitePlanEKID :UUID = getEntityKeyId(getNeighborDetails(neighborsList.get(0)));
          worksitePlanEKIDs.push(worksitePlanEKID);
          worksitePlanEKIDsByAppointmentEKIDs.set(appointmentEKID, worksitePlanEKID);
        });

        worksitePlanEKIDsByAppointmentEKIDs = worksitePlanEKIDsByAppointmentEKIDs.asImmutable();
      }
    }
    else {
      response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: worksitePlanESID }));
      if (response.error) throw response.error;
      fromJS(response.data).forEach((plan :Map) => {
        const worksitePlanEKID :UUID = getEntityKeyId(plan);
        worksitePlanEKIDs.push(worksitePlanEKID);
        const { [HOURS_WORKED]: hours } = getEntityProperties(plan, [HOURS_WORKED]);
        const hoursToSet :number = isEmptyString(hours) ? 0 : hours;
        hoursByWorksitePlanEKID.set(worksitePlanEKID, hoursToSet);
      });
      hoursByWorksitePlanEKID = hoursByWorksitePlanEKID.asImmutable();

      searchFilter = {
        entityKeyIds: worksitePlanEKIDs,
        destinationEntitySetIds: [],
        sourceEntitySetIds: [peopleESID],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: worksitePlanESID, filter: searchFilter })
      );
      if (response.error) throw response.error;
      fromJS(response.data).forEach((personNeighborsList :List, worksitePlanEKID :UUID) => {
        const personEKID :UUID = getEntityKeyId(getNeighborDetails(personNeighborsList.get(0)));
        personEKIDByWorksitePlanEKID.set(worksitePlanEKID, personEKID);
      });
      personEKIDByWorksitePlanEKID = personEKIDByWorksitePlanEKID.asImmutable();
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
          const diversionPlanEKID :UUID = getEntityKeyId(getNeighborDetails(neighborsList.get(0)));
          diversionPlanEKIDs.push(diversionPlanEKID);
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
        checkInEKIDsByPersonEKID.forEach((checkInEKIDsList :List) => {
          let personCourtTypes :Map = fromJS(courtTypeCountObj).asMutable();
          checkInEKIDsList.forEach((checkInEKID :UUID) => {
            const appointmentEKID :UUID = appointmentEKIDsByCheckInEKIDs.get(checkInEKID, '');
            const worksitePlanEKID :UUID = worksitePlanEKIDsByAppointmentEKIDs.get(appointmentEKID, '');
            const diversionPlanEKID :UUID = diversionPlanEKIDsByWorksitePlanEKIDs.get(worksitePlanEKID, '');
            const courtType :string = courtTypesByDiversionPlanEKIDs.get(diversionPlanEKID, '');
            if (isDefined(personCourtTypes.get(courtType))) {
              personCourtTypes = personCourtTypes.set(courtType, personCourtTypes.get(courtType) + 1);
            }
          });

          personCourtTypes.forEach((total :number, courtType :string) => {
            if (isDefined(monthlyTotalParticipantsByCourtType.get(courtType))) {
              const participantCount :number = monthlyTotalParticipantsByCourtType
                .get(courtType, 0);
              monthlyTotalParticipantsByCourtType = monthlyTotalParticipantsByCourtType
                .set(courtType, participantCount + total);
            }
          });
        });

        hoursByCheckInEKID.forEach((hoursTotal :number, checkInEKID :UUID) => {
          const appointmentEKID :UUID = appointmentEKIDsByCheckInEKIDs.get(checkInEKID, '');
          const worksitePlanEKID :UUID = worksitePlanEKIDsByAppointmentEKIDs.get(appointmentEKID, '');
          const diversionPlanEKID :UUID = diversionPlanEKIDsByWorksitePlanEKIDs.get(worksitePlanEKID, '');
          const courtType :string = courtTypesByDiversionPlanEKIDs.get(diversionPlanEKID, '');
          if (isDefined(monthlyHoursWorkedByCourtType.get(courtType))) {
            const hours :number = monthlyHoursWorkedByCourtType
              .get(courtType, 0);
            monthlyHoursWorkedByCourtType = monthlyHoursWorkedByCourtType
              .set(courtType, hours + hoursTotal);
          }
        });
      }
      else {
        const personEKIDs :UUID[] = [];
        personEKIDByWorksitePlanEKID.forEach((personEKID :UUID) => {
          if (!personEKIDs.includes(personEKID)) personEKIDs.push(personEKID);
        });
        const courtTypesByPersonEKID :Map = Map().withMutations((map :Map) => {
          personEKIDByWorksitePlanEKID.forEach((personEKID :UUID, worksitePlanEKID :UUID) => {
            const diversionPlanEKID :UUID = diversionPlanEKIDsByWorksitePlanEKIDs.get(worksitePlanEKID, '');
            const courtType :string = courtTypesByDiversionPlanEKIDs.get(diversionPlanEKID, '');

            const hoursForWorksitePlan :number = hoursByWorksitePlanEKID.get(worksitePlanEKID, 0);
            if (isDefined(monthlyHoursWorkedByCourtType.get(courtType))) {
              const hoursTotalForCourtType :number = monthlyHoursWorkedByCourtType
                .get(courtType, 0);
              monthlyHoursWorkedByCourtType = monthlyHoursWorkedByCourtType
                .set(courtType, hoursTotalForCourtType + hoursForWorksitePlan);
            }

            let personCourtTypes :List = map.get(personEKID, List());
            if (isDefined(courtType) && !personCourtTypes.includes(courtType)) {
              personCourtTypes = personCourtTypes.push(courtType);
            }
            map.set(personEKID, personCourtTypes);
          });
        });

        courtTypesByPersonEKID.forEach((courtTypesList :List) => {
          courtTypesList.forEach((courtType :string) => {
            if (isDefined(monthlyTotalParticipantsByCourtType.get(courtType))) {
              const participantCount :number = monthlyTotalParticipantsByCourtType
                .get(courtType, 0);
              monthlyTotalParticipantsByCourtType = monthlyTotalParticipantsByCourtType
                .set(courtType, participantCount + 1);
            }
          });
        });
      }
    }

    yield put(getMonthlyCourtTypeData.success(id, {
      monthlyHoursWorkedByCourtType,
      monthlyTotalParticipantsByCourtType
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getMonthlyCourtTypeData.failure(id, error));
  }
  finally {
    yield put(getMonthlyCourtTypeData.finally(id));
  }
}

function* getMonthlyCourtTypeDataWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_MONTHLY_COURT_TYPE_DATA, getMonthlyCourtTypeDataWorker);
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

    const app = yield select(getAppFromState);
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
    response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: diversionPlanESID }));
    if (response.error) throw response.error;

    const diversionPlanEKIDs :UUID[] = [];
    fromJS(response.data).forEach((plan :Map) => diversionPlanEKIDs.push(getEntityKeyId(plan)));

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

          const personEKID :UUID = getEntityKeyId(getNeighborDetails(personNeighbor));
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
    response = yield call(executeSearchWorker, executeSearch({ searchOptions }));
    if (response.error) throw response.error;
    const checkIns :List = fromJS(response.data.hits);
    const checkInEKIDs :UUID[] = [];
    checkIns.forEach((checkIn :Map) => checkInEKIDs.push(getEntityKeyId(checkIn)));

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
          const appointmentEKID :UUID = getEntityKeyId(getNeighborDetails(appointmentNeighbor));
          if (isDefined(appointmentEKID)) appointmentEKIDs.push(appointmentEKID);
          appointmentEKIDsByCheckInEKIDs = appointmentEKIDsByCheckInEKIDs.set(checkInEKID, appointmentEKID);

          const personNeighbor :Map = neighborsList
            .find((neighbor :Map) => getNeighborESID(neighbor) === peopleESID);
          const person :Map = getNeighborDetails(personNeighbor);
          const personEKID :UUID = getEntityKeyId(person);
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
          const worksitePlanEKID :UUID = getEntityKeyId(getNeighborDetails(neighborsList.get(0)));
          worksitePlanEKIDs.push(worksitePlanEKID);
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
          const diversionPlanEKID :UUID = getEntityKeyId(getNeighborDetails(neighborsList.get(0)));
          diversionPlanEKIDs.push(diversionPlanEKID);
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
    response = yield call(executeSearchWorker, executeSearch({ searchOptions }));
    if (response.error) throw response.error;
    const enrollmentStatuses :List = fromJS(response.data.hits);
    const enrollmentStatusEKIDs :UUID[] = [];
    const enrollmentStatusByEKID :Map = Map().withMutations((map :Map) => {
      enrollmentStatuses.forEach((enrollmentStatus :Map) => {
        const enrollmentStatusEKID :UUID = getEntityKeyId(enrollmentStatus);
        enrollmentStatusEKIDs.push(enrollmentStatusEKID);
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
          const diversionPlanEKID :UUID = getEntityKeyId(getNeighborDetails(neighborsList.get(0)));
          diversionPlanEKIDs.push(diversionPlanEKID);
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
  getMonthlyCourtTypeDataWatcher,
  getMonthlyCourtTypeDataWorker,
  getMonthlyParticipantsByCourtTypeWatcher,
  getMonthlyParticipantsByCourtTypeWorker,
  getTotalParticipantsByCourtTypeWatcher,
  getTotalParticipantsByCourtTypeWorker,
};
