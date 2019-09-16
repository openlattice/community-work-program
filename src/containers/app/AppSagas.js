/*
 * @flow
 */

import {
  all,
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import {
  AppApiActions,
  AppApiSagas,
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import {
  INITIALIZE_APPLICATION,
  initializeApplication,
} from './AppActions';
import {
  getEntityDataModelTypes,
} from '../../core/edm/EDMActions';
import {
  getEntityDataModelTypesWorker,
} from '../../core/edm/EDMSagas';
import { APP_NAME } from '../../core/edm/constants/DataModelConsts';

const { getApp, getAppConfigs } = AppApiActions;
const { getAppWorker, getAppConfigsWorker } = AppApiSagas;

const LOG = new Logger('AppSagas');

/*
 *
 * AppActions.initializeApplication()
 *
 */

function* initializeApplicationWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (value === null || value === undefined) {
    yield put(initializeApplication.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }

  try {
    yield put(initializeApplication.request(action.id));

    // we need to wait for these to complete before proceeding
    yield all([
      // TODO: we should have a saga that runs these on a schedule to refresh the data
      call(getEntityDataModelTypesWorker, getEntityDataModelTypes()),
    ]);

    /*
     * 1. load App
     */

    let response :any = {};
    response = yield call(getAppWorker, getApp(APP_NAME));
    if (response.error) throw response.error;

    /*
     * 2. load AppConfigs
     */

    const app = response.data;
    response = yield call(getAppConfigsWorker, getAppConfigs(app.id));
    if (response.error) throw response.error;

    const appConfigs :Object[] = response.data;

    yield put(initializeApplication.success(action.id, {
      app,
      appConfigs,
    }));
  }
  catch (error) {
    LOG.error('caught exception in initializeApplicationWorker()', error);
    yield put(initializeApplication.failure(action.id, error));
  }
  finally {
    yield put(initializeApplication.finally(action.id));
  }
}

function* initializeApplicationWatcher() :Generator<*, *, *> {

  yield takeEvery(INITIALIZE_APPLICATION, initializeApplicationWorker);
}

export {
  initializeApplicationWatcher,
  initializeApplicationWorker,
};
