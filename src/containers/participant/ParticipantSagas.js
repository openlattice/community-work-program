/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import {
  DataApiActions,
  DataApiSagas,
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import {
  GET_PARTICIPANT,
  getParticipant,
} from './ParticipantActions';
import { getEntitySetIdFromApp } from '../../utils/DataUtils';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const { getEntityData } = DataApiActions;
const { getEntityDataWorker } = DataApiSagas;
const { PEOPLE } = APP_TYPE_FQNS;

const getAppFromState = state => state.get(STATE.APP, Map());

const LOG = new Logger('ParticipantSagas');

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
    console.log('participant: ', participant);

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

export {
  getParticipantWatcher,
  getParticipantWorker,
};
