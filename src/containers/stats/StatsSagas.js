// @flow
import { List, Map, fromJS } from 'immutable';
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
} from '../../utils/DataUtils';
import {
  GET_STATS_DATA,
  getStatsData,
} from './StatsActions';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { COURT_TYPES_MAP, ENROLLMENT_STATUSES } from '../../core/edm/constants/DataModelConsts';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const {
  DIVERSION_PLAN,
  ENROLLMENT_STATUS,
  MANUAL_PRETRIAL_COURT_CASES,
  PEOPLE,
} = APP_TYPE_FQNS;
const { COURT_CASE_TYPE, EFFECTIVE_DATE, STATUS } = PROPERTY_TYPE_FQNS;

const getAppFromState = (state) => state.get(STATE.APP, Map());
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
  getStatsDataWatcher,
  getStatsDataWorker,
};
