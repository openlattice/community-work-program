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

import Logger from '../../utils/Logger';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import getEntitySetIdFromApp from '../../utils/AppUtils';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQN_STRINGS } from '../../utils/constants/FQNsToStrings';
import {
  GET_ORGANIZATION,
  getOrganization,
} from './OrganizationActions';

const LOG = new Logger('OrganizationSagas');
const { ORGANIZATION } = APP_TYPE_FQN_STRINGS;
const { getEntityData } = DataApiActions;
const { getEntityDataWorker } = DataApiSagas;

const getApp = state => state.get(STATE.APP, Map());

/*
 *
 * OrganizationActions.getOrganization()
 *
 */

function* getOrganizationWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (value === null || value === undefined) {
    yield put(getOrganization.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }

  let response :Object = {};
  const { organizationEntityKeyId } = value;

  try {
    yield put(getOrganization.request(id, value));

    const app = yield select(getApp);
    const orgESID :string = getEntitySetIdFromApp(app, ORGANIZATION);
    response = yield call(getEntityDataWorker, getEntityData({
      entitySetId: orgESID,
      entityKeyId: organizationEntityKeyId
    }));
    if (response.error) {
      throw response.error;
    }
    const organization :Map = fromJS(response.data);

    yield put(getOrganization.success(id, organization));
  }
  catch (error) {
    LOG.error('caught exception in getOrganizationWorker()', error);
    yield put(getOrganization.failure(id, error));
  }
  finally {
    yield put(getOrganization.finally(id));
  }
}

function* getOrganizationWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_ORGANIZATION, getOrganizationWorker);
}

export {
  getOrganizationWatcher,
  getOrganizationWorker,
};
