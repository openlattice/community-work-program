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
import { isDefined } from '../../utils/LangUtils';
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
  let enrollmentsByCourtTypeGraphData :Map = fromJS(courtTypeCountObj);
  let activePeopleByCourtTypeGraphData :Map = fromJS(courtTypeCountObj);
  let successfulPeopleByCourtTypeGraphData :Map = fromJS(courtTypeCountObj);
  let unsuccessfulPeopleByCourtTypeGraphData :Map = fromJS(courtTypeCountObj);
  let totalParticipantCount :number = 0;
  let totalActiveParticipantCount :number = 0;

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

      let courtTypeAndDateByPersonEKID :Map = Map();

      if (!neighborsByDiversionPlanEKID.isEmpty()) {
        neighborsByDiversionPlanEKID.forEach((caseAndPersonNeighbors :List) => {
          const courtCaseObj :Map = caseAndPersonNeighbors
            .find((neighbor :Map) => getNeighborESID(neighbor) === manualCourtCasesESID);
          const courtCase :Map = getNeighborDetails(courtCaseObj);
          const { [COURT_CASE_TYPE]: courtCaseType } = getEntityProperties(courtCase, [COURT_CASE_TYPE]);
          const enrollmentCount :number = enrollmentsByCourtTypeGraphData.get(courtCaseType, 0);
          if (isDefined(enrollmentsByCourtTypeGraphData.get(courtCaseType))) {
            enrollmentsByCourtTypeGraphData = enrollmentsByCourtTypeGraphData.set(courtCaseType, enrollmentCount + 1);
          }

          const person :Map = caseAndPersonNeighbors.find((neighbor :Map) => getNeighborESID(neighbor) === peopleESID);
          const personEKID :UUID = getEntityKeyId(getNeighborDetails(person));
          const { enrollmentStatusDate } = courtTypeAndDateByPersonEKID.get(personEKID, {});
          const enrollmentStatusNeighbor :Map = caseAndPersonNeighbors
            .find((neighbor :Map) => getNeighborESID(neighbor) === enrollmentStatusESID);
          const { [EFFECTIVE_DATE]: neighborDate, [STATUS]: status } = getEntityProperties(
            getNeighborDetails(enrollmentStatusNeighbor),
            [EFFECTIVE_DATE, STATUS]
          );
          // $FlowFixMe
          if (DateTime.fromISO(enrollmentStatusDate).startOf('day')
            < DateTime.fromISO(neighborDate).startOf('day') || !isDefined(enrollmentStatusDate)) {
            courtTypeAndDateByPersonEKID = courtTypeAndDateByPersonEKID.set(
              personEKID,
              { courtType: courtCaseType, enrollmentStatusDate: neighborDate, status }
            );
          }
        });
      }

      courtTypeAndDateByPersonEKID.forEach(({ courtType, status } :Object) => {
        if (ACTIVE_STATUSES.includes(status)) {
          const activePersonCount :number = activePeopleByCourtTypeGraphData.get(courtType, 0);
          activePeopleByCourtTypeGraphData = activePeopleByCourtTypeGraphData.set(courtType, activePersonCount + 1);
          totalActiveParticipantCount += 1;
        }
        if (status === ENROLLMENT_STATUSES.COMPLETED || status === ENROLLMENT_STATUSES.SUCCESSFUL) {
          const successfulPersonCount :number = successfulPeopleByCourtTypeGraphData.get(courtType, 0);
          successfulPeopleByCourtTypeGraphData = successfulPeopleByCourtTypeGraphData
            .set(courtType, successfulPersonCount + 1);
        }
        if (status === ENROLLMENT_STATUSES.REMOVED_NONCOMPLIANT || status === ENROLLMENT_STATUSES.UNSUCCESSFUL) {
          const unsuccessfulPersonCount :number = unsuccessfulPeopleByCourtTypeGraphData.get(courtType, 0);
          unsuccessfulPeopleByCourtTypeGraphData = unsuccessfulPeopleByCourtTypeGraphData
            .set(courtType, unsuccessfulPersonCount + 1);
        }
        totalParticipantCount += 1;
      });
    }

    yield put(getStatsData.success(id, {
      activePeopleByCourtTypeGraphData,
      enrollmentsByCourtTypeGraphData,
      successfulPeopleByCourtTypeGraphData,
      totalActiveParticipantCount,
      totalDiversionPlanCount,
      totalParticipantCount,
      unsuccessfulPeopleByCourtTypeGraphData,
    }));
  }
  catch (error) {
    LOG.error('caught exception in getStatsDataWorker()', error);
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
