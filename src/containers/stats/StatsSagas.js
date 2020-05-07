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

import Logger from '../../utils/Logger';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getNeighborDetails,
  getNeighborESID,
  getPropertyTypeIdFromEdm,
  getUTCDateRangeSearchString,
} from '../../utils/DataUtils';
import { isDefined } from '../../utils/LangUtils';
import {
  GET_MONTHLY_COURT_TYPE_DATA,
  GET_STATS_DATA,
  getMonthlyCourtTypeData,
  getStatsData,
} from './StatsActions';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { COURT_TYPES_MAP, ENROLLMENT_STATUSES } from '../../core/edm/constants/DataModelConsts';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { executeSearch, searchEntityNeighborsWithFilter } = SearchApiActions;
const { executeSearchWorker, searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const {
  APPOINTMENT,
  CHECK_INS,
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
const LOG = new Logger('StatsSagas');

const courtTypeCountObj :Object = {
  [COURT_TYPES_MAP.CHILD_SUPPORT]: 0,
  [COURT_TYPES_MAP.DRUG_COURT]: 0,
  [COURT_TYPES_MAP.DUI_COURT]: 0,
  [COURT_TYPES_MAP.HOPE_PROBATION]: 0,
  [COURT_TYPES_MAP.MENTAL_HEALTH]: 0,
  [COURT_TYPES_MAP.PROBATION]: 0,
  [COURT_TYPES_MAP.SENTENCED]: 0,
  [COURT_TYPES_MAP.VETERANS_COURT]: 0,
};
const ACTIVE_STATUSES :string[] = [
  ENROLLMENT_STATUSES.ACTIVE,
  ENROLLMENT_STATUSES.ACTIVE_REOPENED,
  ENROLLMENT_STATUSES.AWAITING_CHECKIN,
  ENROLLMENT_STATUSES.AWAITING_ORIENTATION,
  ENROLLMENT_STATUSES.JOB_SEARCH,
];

/*
 *
 * StatsActions.getMonthlyCourtTypeData()
 *
 */

function* getMonthlyCourtTypeDataWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  let response :Object = {};
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let monthlyHoursWorkedByCourtType :Map = fromJS(courtTypeCountObj).asMutable();
  let monthlyTotalParticipantsByCourtType :Map = fromJS(courtTypeCountObj).asMutable();

  try {
    yield put(getMonthlyCourtTypeData.request(id));
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
    // const firstDateOfMonth = DateTime.fromISO(`${year}-${mmMonth}-01`);
    const firstDateOfMonth = DateTime.fromISO(`${year}-02-01`);
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
    const checkInsWithinMonth :List = fromJS(response.data.hits);
    console.log('checkInsWithinMonth: ', checkInsWithinMonth);
    const checkInEKIDs :UUID[] = [];
    const hoursByCheckInEKID :Map = Map().withMutations((map :Map) => {
      checkInsWithinMonth.forEach((checkIn :Map) => {
        const checkInEKID :UUID = getEntityKeyId(checkIn);
        const { [HOURS_WORKED]: hoursWorked } = getEntityProperties(checkIn, [HOURS_WORKED]);
        map.set(checkInEKID, hoursWorked);
        checkInEKIDs.push(checkInEKID);
      });
    }).asImmutable();
    console.log('checkInEKIDs: ', checkInEKIDs);

    const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);
    const appointmentESID :UUID = getEntitySetIdFromApp(app, APPOINTMENT);
    let searchFilter :Object = {
      entityKeyIds: checkInEKIDs,
      destinationEntitySetIds: [appointmentESID],
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
    const checkInEKIDsByPersonEKID :Map = Map().withMutations((map :Map) => {
      appointmentAndPeopleNeighbors.forEach((neighborsList :List, checkInEKID :UUID) => {
        const appointmentNeighbor :Map = neighborsList
          .find((neighbor :Map) => getNeighborESID(neighbor) === appointmentESID);
        const appointmentEKID :UUID = getEntityKeyId(getNeighborDetails(appointmentNeighbor));
        appointmentEKIDs.push();
        appointmentEKIDsByCheckInEKIDs = appointmentEKIDsByCheckInEKIDs.set(appointmentEKID, checkInEKID);
        const personNeighbor :Map = neighborsList
          .find((neighbor :Map) => getNeighborESID(neighbor) === peopleESID);
        const personEKID :UUID = getEntityKeyId(getNeighborDetails(personNeighbor));
        map.update(personEKID, List(), (ekids) => ekids.concat(fromJS([checkInEKID])));
      });
    }).asImmutable();
    console.log('appointmentEKIDs: ', appointmentEKIDs);

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

    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);
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

    checkInEKIDsByPersonEKID.forEach((checkInEKIDsList :List) => {
      let personCourtTypes :Map = Map().asMutable();
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
            .set(courtType, participantCount + 1);
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
          .set(courtType, hours + 1);
      }
    });

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
 * StatsActions.getStatsData()
 *
 */

function* getStatsDataWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id } = action;
  let response :Object = {};
  let referralsByCourtTypeGraphData :Map = fromJS(courtTypeCountObj).asMutable();
  let activeEnrollmentsByCourtType :Map = fromJS(courtTypeCountObj).asMutable();
  let successfulEnrollmentsByCourtType :Map = fromJS(courtTypeCountObj).asMutable();
  let unsuccessfulEnrollmentsByCourtType :Map = fromJS(courtTypeCountObj).asMutable();
  let closedEnrollmentsByCourtType :Map = fromJS(courtTypeCountObj).asMutable();
  let totalParticipantCount :number = 0;
  let totalActiveEnrollmentCount :number = 0;
  let totalSuccessfulEnrollmentCount :number = 0;
  let totalUnsuccessfulEnrollmentCount :number = 0;
  let totalClosedEnrollmentsCount :number = 0;

  try {
    yield put(getStatsData.request(id));

    const app = yield select(getAppFromState);
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);

    response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: diversionPlanESID }));
    if (response.error) throw response.error;
    const totalDiversionPlanCount :number = response.data.length;
    const diversionPlans :List = fromJS(response.data).map((plan :Map) => getNeighborDetails(plan));

    if (!diversionPlans.isEmpty()) {
      const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);
      const manualCourtCasesESID :UUID = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
      const enrollmentStatusESID :UUID = getEntitySetIdFromApp(app, ENROLLMENT_STATUS);
      const diversionPlanEKIDs = [];
      diversionPlans.forEach((diversionPlan :Map) => {
        const diversionPlanEKID :UUID = getEntityKeyId(diversionPlan);
        diversionPlanEKIDs.push(diversionPlanEKID);
      });

      const searchFilter = {
        entityKeyIds: diversionPlanEKIDs,
        destinationEntitySetIds: [manualCourtCasesESID],
        sourceEntitySetIds: [enrollmentStatusESID, peopleESID],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter: searchFilter })
      );
      if (response.error) throw response.error;
      const neighborsByDiversionPlanEKID :Map = fromJS(response.data);

      let allEnrollmentsByPersonEKID :Map = Map();

      neighborsByDiversionPlanEKID.forEach((caseAndPersonNeighbors :List) => {

        const courtCaseObj :Map = caseAndPersonNeighbors
          .find((neighbor :Map) => getNeighborESID(neighbor) === manualCourtCasesESID);
        const courtCase :Map = getNeighborDetails(courtCaseObj);
        const { [COURT_CASE_TYPE]: courtCaseType } = getEntityProperties(courtCase, [COURT_CASE_TYPE]);


        const mostRecentEnrollmentStatus :Map = caseAndPersonNeighbors
          .filter((neighbor :Map) => getNeighborESID(neighbor) === enrollmentStatusESID)
          .map((neighbor :Map) => getNeighborDetails(neighbor))
          .sortBy((entity :Map) => entity.getIn([EFFECTIVE_DATE, 0]))
          .last();
        const { [EFFECTIVE_DATE]: neighborDate, [STATUS]: status } = getEntityProperties(
          mostRecentEnrollmentStatus,
          [EFFECTIVE_DATE, STATUS]
        );

        if (ACTIVE_STATUSES.includes(status)) {
          const count :number = activeEnrollmentsByCourtType.get(courtCaseType, 0);
          activeEnrollmentsByCourtType = activeEnrollmentsByCourtType.set(courtCaseType, count + 1);
          totalActiveEnrollmentCount += 1;
        }
        if (status === ENROLLMENT_STATUSES.COMPLETED || status === ENROLLMENT_STATUSES.SUCCESSFUL) {
          const count :number = successfulEnrollmentsByCourtType.get(courtCaseType, 0);
          successfulEnrollmentsByCourtType = successfulEnrollmentsByCourtType
            .set(courtCaseType, count + 1);
          totalSuccessfulEnrollmentCount += 1;
        }
        if (status === ENROLLMENT_STATUSES.REMOVED_NONCOMPLIANT || status === ENROLLMENT_STATUSES.UNSUCCESSFUL) {
          const count :number = unsuccessfulEnrollmentsByCourtType.get(courtCaseType, 0);
          unsuccessfulEnrollmentsByCourtType = unsuccessfulEnrollmentsByCourtType
            .set(courtCaseType, count + 1);
          totalUnsuccessfulEnrollmentCount += 1;
        }
        if (status === ENROLLMENT_STATUSES.CLOSED) {
          const count :number = closedEnrollmentsByCourtType.get(courtCaseType, 0);
          closedEnrollmentsByCourtType = closedEnrollmentsByCourtType
            .set(courtCaseType, count + 1);
          totalClosedEnrollmentsCount += 1;
        }

        const person :Map = caseAndPersonNeighbors.find((neighbor :Map) => getNeighborESID(neighbor) === peopleESID);
        const personEKID :UUID = getEntityKeyId(getNeighborDetails(person));
        let enrollments :List = allEnrollmentsByPersonEKID.get(personEKID, List());
        enrollments = enrollments.push(Map({ courtType: courtCaseType, enrollmentStatusDate: neighborDate }));
        allEnrollmentsByPersonEKID = allEnrollmentsByPersonEKID.set(personEKID, enrollments);
      });

      activeEnrollmentsByCourtType = activeEnrollmentsByCourtType.asImmutable();
      closedEnrollmentsByCourtType = closedEnrollmentsByCourtType.asImmutable();
      successfulEnrollmentsByCourtType = successfulEnrollmentsByCourtType.asImmutable();
      unsuccessfulEnrollmentsByCourtType = unsuccessfulEnrollmentsByCourtType.asImmutable();

      allEnrollmentsByPersonEKID.forEach((enrollments :List) => {
        totalParticipantCount += 1;
        let currentCourtType :string = '';
        let repeats :Map = Map();
        const sortedEnrollments = enrollments.sortBy((enrollment :Map) => enrollment.get('enrollmentStatusDate'));

        sortedEnrollments.forEach((enrollment :Map) => {
          const courtType :string = enrollment.get('courtType');
          if (courtType !== currentCourtType) currentCourtType = courtType;
          else {
            let courtTypeRepeatCount = repeats.get(currentCourtType, 0);
            repeats = repeats.set(currentCourtType, courtTypeRepeatCount += 1);
          }
        });

        repeats.forEach((referralCountToAdd :number, courtType :string) => {
          const totalReferralsForCourtType :number = referralsByCourtTypeGraphData.get(courtType, 0);
          referralsByCourtTypeGraphData = referralsByCourtTypeGraphData
            .set(courtType, totalReferralsForCourtType + referralCountToAdd);
        });
      });

      referralsByCourtTypeGraphData = referralsByCourtTypeGraphData.asImmutable();
    }

    const now :DateTime = DateTime.local();
    const { month, year } = now;
    yield call(getMonthlyCourtTypeDataWorker, getMonthlyCourtTypeData({ month, year }));

    yield put(getStatsData.success(id, {
      activeEnrollmentsByCourtType,
      closedEnrollmentsByCourtType,
      referralsByCourtTypeGraphData,
      successfulEnrollmentsByCourtType,
      totalActiveEnrollmentCount,
      totalClosedEnrollmentsCount,
      totalDiversionPlanCount,
      totalParticipantCount,
      totalSuccessfulEnrollmentCount,
      totalUnsuccessfulEnrollmentCount,
      unsuccessfulEnrollmentsByCourtType,
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getStatsData.failure(id, error));
  }
  finally {
    yield put(getStatsData.finally(id));
  }
}

function* getStatsDataWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_STATS_DATA, getStatsDataWorker);
}

export {
  getMonthlyCourtTypeDataWatcher,
  getMonthlyCourtTypeDataWorker,
  getStatsDataWatcher,
  getStatsDataWorker,
};
