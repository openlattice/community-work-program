/*
 * @flow
 */

import {
  all,
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { EntityDataModelApiActions, EntityDataModelApiSagas } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { ERR_WORKER_SAGA } from '../../utils/Errors';
import {
  GET_EDM_TYPES,
  getEntityDataModelTypes,
} from './EDMActions';

const LOG = new Logger('EDMSagas');

const {
  getAllAssociationTypes,
  getAllEntityTypes,
  getAllPropertyTypes,
} = EntityDataModelApiActions;

const {
  getAllAssociationTypesWorker,
  getAllEntityTypesWorker,
  getAllPropertyTypesWorker,
} = EntityDataModelApiSagas;

/*
 *
 * EDMActions.getEntityDataModelTypes()
 *
 */

function* getEntityDataModelTypesWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(getEntityDataModelTypes.request(action.id));
    const response = yield all([
      call(getAllAssociationTypesWorker, getAllAssociationTypes()),
      call(getAllEntityTypesWorker, getAllEntityTypes()),
      call(getAllPropertyTypesWorker, getAllPropertyTypes()),
    ]);
    yield put(getEntityDataModelTypes.success(
      action.id,
      [
        ...response[0].data,
        ...response[1].data,
        ...response[2].data,
      ]
    ));
  }
  catch (error) {
    LOG.error(ERR_WORKER_SAGA, error);
    yield put(getEntityDataModelTypes.failure(action.id, error));
  }
  finally {
    yield put(getEntityDataModelTypes.finally(action.id));
  }
}

function* getEntityDataModelTypesWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_EDM_TYPES, getEntityDataModelTypesWorker);
}

export {
  getEntityDataModelTypesWatcher,
  getEntityDataModelTypesWorker,
};
