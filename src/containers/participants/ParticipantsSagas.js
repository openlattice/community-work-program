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
  EntityDataModelApiActions,
  EntityDataModelApiSagas,
  DataApiActions,
  DataApiSagas,
} from 'lattice-sagas';

import Logger from '../../utils/Logger';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import {
  GET_PARTICIPANTS,
  getParticipants,
} from './ParticipantsActions';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;

const LOG = new Logger('StudySagas');

/*
 *
 * ParticipantsActions.getParticipants()
 *
 */

function* getParticipantsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (value === null || value === undefined) {
    yield put(getParticipants.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }

  let response :Object = {};
  const { peopleEntitySetId } = value;
  try {
    yield put(getParticipants.request(id));

    response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: peopleEntitySetId }));
    if (response.error) {
      throw response.error;
    }

    const participants :List = fromJS(response.data);

    yield put(getParticipants.success(id, participants));
  }
  catch (error) {
    LOG.error('caught exception in getParticipantsWorker()', error);
    yield put(getParticipants.failure(id, error));
  }
  finally {
    yield put(getParticipants.finally(id));
  }
}

function* getParticipantsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PARTICIPANTS, getParticipantsWorker);
}


export {
  getParticipantsWatcher,
  getParticipantsWorker,
};
