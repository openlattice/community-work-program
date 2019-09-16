/*
 * @flow
 */

import {
  all,
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { Models, Types } from 'lattice';
import { DataApiActions, DataApiSagas } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../../utils/Logger';
import { ERR_ACTION_VALUE_NOT_DEFINED, ERR_WORKER_SAGA } from '../../../utils/Errors';
import {
  DELETE_ENTITIES,
  SUBMIT_DATA_GRAPH,
  SUBMIT_PARTIAL_REPLACE,
  deleteEntities,
  submitDataGraph,
  submitPartialReplace,
} from './DataActions';

const LOG = new Logger('DataSagas');
const { DataGraphBuilder } = Models;
const { DeleteTypes, UpdateTypes } = Types;
const {
  createEntityAndAssociationData,
  deleteEntity,
  updateEntityData,
} = DataApiActions;
const {
  createEntityAndAssociationDataWorker,
  deleteEntityWorker,
  updateEntityDataWorker,
} = DataApiSagas;

/*
 *
 * DataActions.submitDataGraph()
 *
 */

function* submitDataGraphWorker(action :SequenceAction) :Generator<*, *, *> {

  const workerResponse :Object = {};

  const { id, value } = action;
  if (value === null || value === undefined) {
    workerResponse.error = ERR_ACTION_VALUE_NOT_DEFINED;
    yield put(submitDataGraph.failure(id, workerResponse.error));
    return workerResponse;
  }

  try {
    yield put(submitDataGraph.request(action.id, value));

    const dataGraph = (new DataGraphBuilder())
      .setAssociations(value.associationEntityData)
      .setEntities(value.entityData)
      .build();

    const response = yield call(createEntityAndAssociationDataWorker, createEntityAndAssociationData(dataGraph));
    if (response.error) throw response.error;

    workerResponse.data = response.data;

    yield put(submitDataGraph.success(action.id, response.data));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error(ERR_WORKER_SAGA, error);
    yield put(submitDataGraph.failure(action.id, error));
  }
  finally {
    yield put(submitDataGraph.finally(action.id));
  }

  return workerResponse;
}

function* submitDataGraphWatcher() :Generator<*, *, *> {

  yield takeEvery(SUBMIT_DATA_GRAPH, submitDataGraphWorker);
}

/*
 *
 * DataActions.submitPartialReplace()
 *
 */

function* submitPartialReplaceWorker(action :SequenceAction) :Generator<*, *, *> {

  const sagaResponse :Object = {};

  const { id, value } = action;
  if (value === null || value === undefined) {
    sagaResponse.error = ERR_ACTION_VALUE_NOT_DEFINED;
    yield put(submitPartialReplace.failure(id, sagaResponse.error));
    return sagaResponse;
  }

  try {
    yield put(submitPartialReplace.request(action.id, value));

    const calls = [];
    const { entityData } = value;
    Object.keys(entityData).forEach((entitySetId :UUID) => {
      calls.push(
        call(
          updateEntityDataWorker,
          updateEntityData({
            entitySetId,
            entities: entityData[entitySetId],
            updateType: UpdateTypes.PartialReplace,
          }),
        )
      );
    });

    const updateResponses = yield all(calls);
    const responseErrors = updateResponses.reduce((acc, response) => {
      if (response.error) {
        acc.push(response.error);
      }
      return acc;
    }, []);
    const errors = {
      errors: responseErrors
    };

    if (responseErrors.length) throw errors;

    yield put(submitPartialReplace.success(action.id));
  }
  catch (error) {
    sagaResponse.error = error;
    LOG.error(ERR_WORKER_SAGA, error);
    yield put(submitPartialReplace.failure(action.id, error));
  }
  finally {
    yield put(submitPartialReplace.finally(action.id));
  }

  return sagaResponse;
}

function* submitPartialReplaceWatcher() :Generator<*, *, *> {

  yield takeEvery(SUBMIT_PARTIAL_REPLACE, submitPartialReplaceWorker);
}

/*
 *
 * DataActions.deleteEntities()
 *
 */

function* deleteEntitiesWorker(action :SequenceAction) :Generator<*, *, *> {

  const workerResponse :Object = {};

  const { id, value } = action;
  if (value === null || value === undefined) {
    workerResponse.error = ERR_ACTION_VALUE_NOT_DEFINED;
    yield put(deleteEntities.failure(id, workerResponse.error));
    return workerResponse;
  }

  try {
    yield put(deleteEntities.request(action.id, value));

    const deleteRequests = value.map((dataObject) => {

      const { entitySetId, entityKeyId } = dataObject;
      return call(deleteEntityWorker, deleteEntity({
        entityKeyId,
        entitySetId,
        deleteType: DeleteTypes.SOFT,
      }));
    });

    const deleteResponses = yield all(deleteRequests);
    const reducedError = deleteResponses.reduce((acc, response) => acc.error || response.error, {});
    if (reducedError) throw reducedError;

    yield put(deleteEntities.success(action.id));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error(ERR_WORKER_SAGA, error);
    yield put(deleteEntities.failure(action.id, error));
  }
  finally {
    yield put(deleteEntities.finally(action.id));
  }

  return workerResponse;
}

function* deleteEntitiesWatcher() :Generator<*, *, *> {

  yield takeEvery(DELETE_ENTITIES, deleteEntitiesWorker);
}

export {
  deleteEntitiesWatcher,
  deleteEntitiesWorker,
  submitDataGraphWatcher,
  submitDataGraphWorker,
  submitPartialReplaceWatcher,
  submitPartialReplaceWorker,
};
