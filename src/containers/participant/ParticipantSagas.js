/*
 * @flow
 */

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
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import {
  GET_CASE_INFO,
  GET_PARTICIPANT,
  getCaseInfo,
  getParticipant,
} from './ParticipantActions';
import { getEntityProperties, getEntitySetIdFromApp } from '../../utils/DataUtils';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS, CASE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { NEIGHBOR_DETAILS } from '../../core/edm/constants/DataModelConsts';

const { getEntityData } = DataApiActions;
const { getEntityDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const {
  COURT_PRETRIAL_CASES,
  MANUAL_PRETRIAL_CASES,
  PEOPLE
} = APP_TYPE_FQNS;

const getAppFromState = state => state.get(STATE.APP, Map());

const LOG = new Logger('ParticipantSagas');

const { CASE_NUMBER_TEXT } = CASE_FQNS;
/*
 *
 * ParticipantsActions.getParticipant()
 *
 */

function* getParticipantWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (value === null || value === undefined) {
    yield put(getParticipant.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }
  let response :Object = {};
  let participant :Map = Map();

  try {
    yield put(getParticipant.request(id));
    const { personEKID } = value;
    const app = yield select(getAppFromState);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);

    response = yield call(getEntityDataWorker, getEntityData({ entitySetId: peopleESID, entityKeyId: personEKID }));
    if (response.error) {
      throw response.error;
    }
    participant = fromJS(response.data);

    yield put(getParticipant.success(id, participant));
  }
  catch (error) {
    LOG.error('caught exception in getParticipantWorker()', error);
    yield put(getParticipant.failure(id, error));
  }
  finally {
    yield put(getParticipant.finally(id));
  }
}

function* getParticipantWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PARTICIPANT, getParticipantWorker);
}

/*
 *
 * ParticipantsActions.getCaseInfo()
 *
 */

function* getCaseInfoWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (value === null || value === undefined) {
    yield put(getCaseInfo.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }
  let response :Object = {};
  let caseNumber :string = '';

  try {
    yield put(getCaseInfo.request(id));
    const { sentenceIDs } = value;
    const { ekid, esid } = sentenceIDs;
    const app = yield select(getAppFromState);
    const casesESID = getEntitySetIdFromApp(app, COURT_PRETRIAL_CASES);
    const manualCasesESID = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_CASES);

    const searchFilter :Object = {
      entityKeyIds: [ekid],
      destinationEntitySetIds: [casesESID, manualCasesESID],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: esid, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }

    if (response.data[ekid]) {
      caseNumber = fromJS(response.data[ekid])
        .map((caseNeighbor :Map) => {
          const { [NEIGHBOR_DETAILS]: neighborDetails } = getEntityProperties(caseNeighbor, [NEIGHBOR_DETAILS]);
          return fromJS(neighborDetails);
        })
        .map((charge :Map) => {
          const { [CASE_NUMBER_TEXT]: caseNumberText } = getEntityProperties(charge, [CASE_NUMBER_TEXT]);
          return caseNumberText;
        })
        .get(0);
    }

    yield put(getCaseInfo.success(id, caseNumber));
  }
  catch (error) {
    LOG.error('caught exception in getCaseInfoWorker()', error);
    yield put(getCaseInfo.failure(id, error));
  }
  finally {
    yield put(getCaseInfo.finally(id));
  }
}

function* getCaseInfoWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_CASE_INFO, getCaseInfoWorker);
}

export {
  getCaseInfoWatcher,
  getCaseInfoWorker,
  getParticipantWatcher,
  getParticipantWorker,
};
