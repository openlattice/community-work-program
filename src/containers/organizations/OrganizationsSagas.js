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
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
// import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { getEntitySetIdFromApp, getEntityKeyId, getNeighborDetails } from '../../utils/DataUtils';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import {
  ADD_ORGANIZATION,
  GET_ORGANIZATIONS,
  addOrganization,
  getOrganizations,
} from './OrganizationsActions';
import { getWorksites } from '../worksites/WorksitesActions';
import { getWorksitesWorker } from '../worksites/WorksitesSagas';
import { submitDataGraph } from '../../core/sagas/data/DataActions';
import { submitDataGraphWorker } from '../../core/sagas/data/DataSagas';

const { ORGANIZATION } = APP_TYPE_FQNS;
const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;

const LOG = new Logger('OrganizationSagas');

const getAppFromState = state => state.get(STATE.APP, Map());

/*
 *
 * OrganizationActions.addOrganization()
 *
 */

function* addOrganizationWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};

  try {
    yield put(addOrganization.request(id));

    response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) {
      throw response.error;
    }

    yield put(addOrganization.success(id));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in addOrganizationWorker()', error);
    yield put(addOrganization.failure(id, error));
  }
  finally {
    yield put(addOrganization.finally(id));
  }
}

function* addOrganizationWatcher() :Generator<*, *, *> {

  yield takeEvery(ADD_ORGANIZATION, addOrganizationWorker);
}

/*
 *
 * OrganizationActions.getOrganizations()
 *
 */

function* getOrganizationsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id } = action;
  const workerResponse = {};
  let response :Object = {};
  let organizations :List = List();

  try {
    yield put(getOrganizations.request(id));
    const app = yield select(getAppFromState);
    const organizationESID = getEntitySetIdFromApp(app, ORGANIZATION);

    response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: organizationESID }));
    if (response.error) {
      throw response.error;
    }
    organizations = fromJS(response.data);

    if (organizations.count() > 0) {
      const organizationEKIDs :string[] = [];
      organizations.forEach((orgObj :Map) => {
        const org = getNeighborDetails(orgObj);
        const orgEKID = getEntityKeyId(org);
        if (orgEKID) organizationEKIDs.push(orgEKID);
      });
      yield call(getWorksitesWorker, getWorksites({ organizationEKIDs }));
    }

    yield put(getOrganizations.success(id, organizations));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getOrganizationsWorker()', error);
    yield put(getOrganizations.failure(id, error));
  }
  finally {
    yield put(getOrganizations.finally(id));
  }
  return workerResponse;
}

function* getOrganizationsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_ORGANIZATIONS, getOrganizationsWorker);
}

export {
  addOrganizationWatcher,
  addOrganizationWorker,
  getOrganizationsWatcher,
  getOrganizationsWorker,
};
