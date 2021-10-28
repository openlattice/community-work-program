// @flow
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
import { DataUtils, LangUtils, Logger } from 'lattice-utils';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { ENROLLMENT_STATUSES } from '../../../../core/edm/constants/DataModelConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../../core/edm/constants/FullyQualifiedNames';
import { selectEntitySetId, selectOrgId } from '../../../../core/redux/selectors';
import {
  getNeighborDetails,
  getNeighborESID,
  sortEntitiesByDateProperty,
} from '../../../../utils/DataUtils';
import { COMPLETION_STATUSES } from '../../../participants/ParticipantsConstants';
import { GET_STATS_BY_COURT_TYPE, getStatsByCourtType } from '../CourtTypeActions';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const { getEntityKeyId, getPropertyValue } = DataUtils;
const { isDefined } = LangUtils;

const {
  DIVERSION_PLAN,
  ENROLLMENT_STATUS,
  MANUAL_PRETRIAL_COURT_CASES,
  PEOPLE,
} = APP_TYPE_FQNS;
const {
  COURT_CASE_TYPE,
  EFFECTIVE_DATE,
  STATUS,
} = PROPERTY_TYPE_FQNS;

const LOG = new Logger('CourtTypeSagas');

function* getStatsByCourtTypeWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;

  let totalEnrollmentsForCourtType = 0;
  let totalParticipantsForCourtType = 0;
  let enrollmentStatusCountsForCourtType = fromJS({
    [ENROLLMENT_STATUSES.ACTIVE]: 0,
    [ENROLLMENT_STATUSES.AWAITING_CHECKIN]: 0,
    [ENROLLMENT_STATUSES.CLOSED]: 0,
    [ENROLLMENT_STATUSES.COMPLETED]: 0,
    [ENROLLMENT_STATUSES.REMOVED_NONCOMPLIANT]: 0,
  }).asMutable();

  try {
    yield put(getStatsByCourtType.request(id));
    const { selectedCourtType } = value;

    const selectedOrgId :UUID = yield select(selectOrgId());
    const diversionPlanESID :UUID = yield select(selectEntitySetId(selectedOrgId, DIVERSION_PLAN));

    let response :Object = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: diversionPlanESID }));
    if (response.error) throw response.error;
    const diversionPlans :List = fromJS(response.data);
    const diversionPlanEKIDs :UUID[] = diversionPlans.map((diversionPlan :Map) => getEntityKeyId(diversionPlan)).toJS();

    const courtCaseESID :UUID = yield select(selectEntitySetId(selectedOrgId, MANUAL_PRETRIAL_COURT_CASES));
    let filter = {
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

    const diversionPlanEKIDsForGivenCourtType = courtCaseByDiversionPlanEKID
      .filter((courtCase :Map) => {
        const courtType = getPropertyValue(courtCase, [COURT_CASE_TYPE, 0]);
        return courtType === selectedCourtType.value;
      })
      .keySeq()
      .toList();

    totalEnrollmentsForCourtType = diversionPlanEKIDsForGivenCourtType.count();

    const peopleESID :UUID = yield select(selectEntitySetId(selectedOrgId, PEOPLE));
    const enrollmentStatusESID :UUID = yield select(selectEntitySetId(selectedOrgId, ENROLLMENT_STATUS));

    filter = {
      entityKeyIds: diversionPlanEKIDsForGivenCourtType.toJS(),
      destinationEntitySetIds: [],
      sourceEntitySetIds: [enrollmentStatusESID, peopleESID],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter })
    );
    if (response.error) throw response.error;

    const personNeighborsByDiversionPlanEKID = fromJS(response.data)
      .map((neighbors :List) => neighbors.find((neighbor :Map) => getNeighborESID(neighbor) === peopleESID))
      .map((personNeighbor :List) => getNeighborDetails(personNeighbor));
    const personEKIDCountMap = Map().asMutable();
    personNeighborsByDiversionPlanEKID.forEach((person :Map) => {
      const personEKID :?UUID = getEntityKeyId(person);
      const personEKIDCount = personEKIDCountMap.get(personEKID);
      if (!isDefined(personEKIDCount)) {
        personEKIDCountMap.set(personEKID, 1);
        totalParticipantsForCourtType += 1;
      }
    });
    const enrollmentStatusNeighborsByDiversionPlanEKID = fromJS(response.data)
      .map((neighbors :List) => neighbors
        .filter((neighbor :Map) => getNeighborESID(neighbor) === enrollmentStatusESID))
      .map((enrollmentStatusNeighbors :List) => enrollmentStatusNeighbors
        .map((enrollmentStatusNeighbor :Map) => getNeighborDetails(enrollmentStatusNeighbor)));

    enrollmentStatusNeighborsByDiversionPlanEKID.forEach((enrollmentStatuses :List) => {
      // fancy sorting for enrollment statuses, in case statuses were entered without dates or out of order:
      const statusesWithEffectiveDates :List = enrollmentStatuses
        .filter((status :Map) => isDefined(status.get(EFFECTIVE_DATE)));
      let sortedEnrollmentStatuses :List = sortEntitiesByDateProperty(statusesWithEffectiveDates, [EFFECTIVE_DATE]);
      sortedEnrollmentStatuses = sortedEnrollmentStatuses.sort((enrollmentStatus :Map) => {
        const status = getPropertyValue(enrollmentStatus, [STATUS, 0]);
        if (status === ENROLLMENT_STATUSES.AWAITING_CHECKIN) return -1;
        return 0;
      });
      const completionStatuses :List = sortedEnrollmentStatuses.filter((statusInList :Map) => {
        const status = getPropertyValue(statusInList, [STATUS, 0]);
        return COMPLETION_STATUSES.includes(status);
      });
      const mostRecentEnrollmentStatus :Map = completionStatuses.last() || sortedEnrollmentStatuses.last() || Map();
      const status = getPropertyValue(mostRecentEnrollmentStatus, [STATUS, 0]);

      if (status === ENROLLMENT_STATUSES.COMPLETED || status === ENROLLMENT_STATUSES.SUCCESSFUL) {
        const currentCount = enrollmentStatusCountsForCourtType.get(ENROLLMENT_STATUSES.COMPLETED);
        enrollmentStatusCountsForCourtType.set(ENROLLMENT_STATUSES.COMPLETED, currentCount + 1);
      }
      if (status === ENROLLMENT_STATUSES.REMOVED_NONCOMPLIANT || status === ENROLLMENT_STATUSES.UNSUCCESSFUL) {
        const currentCount = enrollmentStatusCountsForCourtType.get(ENROLLMENT_STATUSES.REMOVED_NONCOMPLIANT);
        enrollmentStatusCountsForCourtType.set(ENROLLMENT_STATUSES.REMOVED_NONCOMPLIANT, currentCount + 1);
      }
      if (status === ENROLLMENT_STATUSES.ACTIVE
        || status === ENROLLMENT_STATUSES.ACTIVE_REOPENED
        || status === ENROLLMENT_STATUSES.JOB_SEARCH) {
        const currentCount = enrollmentStatusCountsForCourtType.get(ENROLLMENT_STATUSES.ACTIVE);
        enrollmentStatusCountsForCourtType.set(ENROLLMENT_STATUSES.ACTIVE, currentCount + 1);
      }
      if (status === ENROLLMENT_STATUSES.CLOSED) {
        const currentCount = enrollmentStatusCountsForCourtType.get(ENROLLMENT_STATUSES.CLOSED);
        enrollmentStatusCountsForCourtType.set(ENROLLMENT_STATUSES.CLOSED, currentCount + 1);
      }
    });

    enrollmentStatusCountsForCourtType = enrollmentStatusCountsForCourtType.asImmutable();

    // console.log('enrollmentStatusCountsForCourtType ', enrollmentStatusCountsForCourtType.toJS());
    // console.log('totalEnrollmentsForCourtType ', totalEnrollmentsForCourtType);
    // console.log('totalParticipantsForCourtType ', totalParticipantsForCourtType);

    yield put(getStatsByCourtType.success(id, {
      enrollmentStatusCountsForCourtType,
      totalEnrollmentsForCourtType,
      totalParticipantsForCourtType,
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getStatsByCourtType.failure(id, error));
  }
  finally {
    yield put(getStatsByCourtType.finally(id));
  }
}

function* getStatsByCourtTypeWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_STATS_BY_COURT_TYPE, getStatsByCourtTypeWorker);
}

export {
  getStatsByCourtTypeWatcher,
  getStatsByCourtTypeWorker,
};
