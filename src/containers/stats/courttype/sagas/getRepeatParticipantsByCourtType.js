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

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../../core/edm/constants/FullyQualifiedNames';
import { selectEntitySetId, selectOrgId } from '../../../../core/redux/selectors';
import { getNeighborDetails } from '../../../../utils/DataUtils';
import { GET_REPEAT_PARTICIPANTS_BY_COURT_TYPE, getRepeatParticipantsByCourtType } from '../CourtTypeActions';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const { getEntityKeyId, getPropertyValue } = DataUtils;
const { isDefined } = LangUtils;

const {
  DIVERSION_PLAN,
  MANUAL_PRETRIAL_COURT_CASES,
  PEOPLE,
} = APP_TYPE_FQNS;
const { COURT_CASE_TYPE } = PROPERTY_TYPE_FQNS;

const LOG = new Logger('CourtTypeSagas');

function* getRepeatParticipantsByCourtTypeWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id } = action;

  try {
    yield put(getRepeatParticipantsByCourtType.request(id));

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

    const peopleESID :UUID = yield select(selectEntitySetId(selectedOrgId, PEOPLE));

    filter = {
      entityKeyIds: diversionPlanEKIDs,
      destinationEntitySetIds: [],
      sourceEntitySetIds: [peopleESID],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter })
    );
    if (response.error) throw response.error;

    const personNeighborsByDiversionPlanEKID = fromJS(response.data)
      .map((personNeighbors :List) => getNeighborDetails(personNeighbors.get(0)));

    const personEKIDCountMap = Map().asMutable();
    const diversionPlanEKIDByPersonEKID = Map().withMutations((mutator :Map) => {
      personNeighborsByDiversionPlanEKID.forEach((person :Map, diversionPlanEKID :UUID) => {
        const personEKID :?UUID = getEntityKeyId(person);
        mutator.set(personEKID, diversionPlanEKID);

        const personEKIDCount = personEKIDCountMap.get(personEKID);
        if (!isDefined(personEKIDCount)) {
          personEKIDCountMap.set(personEKID, 1);
        }
        else {
          personEKIDCountMap.set(personEKID, personEKIDCount + 1);
        }
      });
    });

    const repeatParticipantCountsByCourtType = Map().withMutations((mutator :Map) => {
      personEKIDCountMap.forEach((enrollmentCount :number, personEKID :UUID) => {
        if (enrollmentCount > 1) {
          const diversionPlanEKID :UUID = diversionPlanEKIDByPersonEKID.get(personEKID);
          const courtCase :Map = courtCaseByDiversionPlanEKID.get(diversionPlanEKID, Map());
          const courtType :string = getPropertyValue(courtCase, [COURT_CASE_TYPE, 0]);

          let repeatParticipantMap = mutator.get(courtType, Map());
          const numberOfTimesCurrentEnrollmentCountAppears = repeatParticipantMap.get(enrollmentCount, 0);
          repeatParticipantMap = repeatParticipantMap
            .set(enrollmentCount, numberOfTimesCurrentEnrollmentCountAppears + 1);
          mutator.set(courtType, repeatParticipantMap);
        }
      });
    });

    yield put(getRepeatParticipantsByCourtType.success(id, repeatParticipantCountsByCourtType));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getRepeatParticipantsByCourtType.failure(id, error));
  }
  finally {
    yield put(getRepeatParticipantsByCourtType.finally(id));
  }
}

function* getRepeatParticipantsByCourtTypeWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_REPEAT_PARTICIPANTS_BY_COURT_TYPE, getRepeatParticipantsByCourtTypeWorker);
}

export {
  getRepeatParticipantsByCourtTypeWatcher,
  getRepeatParticipantsByCourtTypeWorker,
};
