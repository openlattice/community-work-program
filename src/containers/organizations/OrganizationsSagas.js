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
  GET_ORGANIZATIONS,
  getOrganizations,
} from './OrganizationsActions';
import { getWorksites } from '../worksites/WorksitesActions';
import { getWorksitesWorker } from '../worksites/WorksitesSagas';

const { ORGANIZATION } = APP_TYPE_FQNS;
const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;

const LOG = new Logger('OrganizationSagas');

const getAppFromState = state => state.get(STATE.APP, Map());

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
      const organizationEKIDs :string[] = organizations
        .map((orgObj :Map) => {
          const org = getNeighborDetails(orgObj);
          return getEntityKeyId(org);
        })
        .toJS();
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
  getOrganizationsWatcher,
  getOrganizationsWorker,
};
