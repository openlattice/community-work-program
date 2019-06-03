/*
 * @flow
 */

import {
  all,
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { OrderedMap, fromJS } from 'immutable';
import { Types, SearchApi } from 'lattice';
import {
  AppApiActions,
  AppApiSagas,
  EntityDataModelApiActions,
  EntityDataModelApiSagas,
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import {
  INITIALIZE_APPLICATION,
  initializeApplication,
  LOAD_APP,
  loadApp,
} from './AppActions';
import {
  getEntitySetIds,
  getEntityDataModelTypes,
} from '../../core/edm/EDMActions';
import {
  getEntitySetIdsWorker,
  getEntityDataModelTypesWorker,
} from '../../core/edm/EDMSagas';
import { APP_NAME } from '../../core/edm/constants/DataModelConsts';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

let { APP_SETTINGS } = APP_TYPE_FQNS;
APP_SETTINGS = APP_SETTINGS.toString();

const { SecurableTypes } = Types;
const { getEntityDataModelProjection } = EntityDataModelApiActions;
const { getEntityDataModelProjectionWorker } = EntityDataModelApiSagas;
const { getApp, getAppConfigs, getAppTypes } = AppApiActions;
const { getAppWorker, getAppConfigsWorker, getAppTypesWorker } = AppApiSagas;

const LOG = new Logger('AppSagas');

/*
 *
 * AppActions.loadAppWorker()
 *
 */
function* loadAppWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadApp.request(action.id));
    let appSettingsByOrgId :OrderedMap<*, *> = OrderedMap();
    /*
     * 1. load App
     */

    let response :any = {};
    response = yield call(getAppWorker, getApp(APP_NAME));
    if (response.error) throw response.error;

    /*
     * 2. load AppConfigs and AppTypes
     */

    const app = response.data;
    response = yield all([
      call(getAppConfigsWorker, getAppConfigs(app.id)),
      call(getAppTypesWorker, getAppTypes(app.appTypeIds)),
    ]);
    if (response[0].error) throw response[0].error;
    if (response[1].error) throw response[1].error;
    /*
     * 3. load EntityTypes and PropertyTypes
     */

    const appConfigs :Object[] = response[0].data;
    const appTypesMap :Object = response[1].data;
    const appTypes :Object[] = (Object.values(appTypesMap) :any);
    const projection :Object[] = appTypes.map((appType :Object) => ({
      id: appType.entityTypeId,
      include: [SecurableTypes.EntityType, SecurableTypes.PropertyTypeInEntitySet],
      type: SecurableTypes.EntityType,
    }));
    response = yield call(getEntityDataModelProjectionWorker, getEntityDataModelProjection(projection));
    if (response.error) {
      console.error(response.error);
      throw response.error;
    }

    const edm :Object = response.data;
    appConfigs.forEach((appConfig :Object) => {

      const { organization } :Object = appConfig;
      const orgId :string = organization.id;
      if (fromJS(appConfig.config).size) {
        const appSettingsConfig = appConfig.config[APP_SETTINGS];
        appSettingsByOrgId = appSettingsByOrgId.set(orgId, appSettingsConfig.entitySetId);
      }
    });
    const appSettingCalls = appSettingsByOrgId.valueSeq().map(entitySetId => (
      call(SearchApi.searchEntitySetData, entitySetId, {
        searchTerm: '*',
        start: 0,
        maxHits: 1
      })
    ));

    const orgIds = appSettingsByOrgId.keySeq().toJS();
    const appSettingResults = yield all(appSettingCalls.toJS());
    let i = 0;
    if (appSettingResults[0].numHits > 0) {
      appSettingResults.forEach((setting) => {
        const entitySetId = orgIds[i];
        const settings = JSON.parse(setting.hits[0]['ol.appdetails']);
        appSettingsByOrgId = appSettingsByOrgId.set(entitySetId, fromJS(settings));
        i += 1;
      });
    }

    yield put(loadApp.success(action.id, {
      app,
      appConfigs,
      appSettingsByOrgId,
      appTypes,
      edm
    }));

  }
  catch (error) {
    console.error(error);
    yield put(loadApp.failure(action.id, error));
  }
  finally {
    yield put(loadApp.finally(action.id));
  }
}

function* loadAppWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_APP, loadAppWorker);
}

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
      call(getEntitySetIdsWorker, getEntitySetIds()),
      call(getEntityDataModelTypesWorker, getEntityDataModelTypes()),
    ]);

    yield put(initializeApplication.success(action.id));
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
  loadAppWorker,
  loadAppWatcher,
};
