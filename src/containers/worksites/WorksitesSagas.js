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
import { Constants } from 'lattice';
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas
} from 'lattice-sagas';

import Logger from '../../utils/Logger';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import getEntitySetIdFromApp from '../../utils/AppUtils';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQN_STRINGS } from '../../utils/constants/FQNsToStrings';
import {
  GET_ORGANIZATIONS,
  GET_ORGANIZATION_WORKSITES,
  getOrganizations,
  getOrganizationWorksites,
} from './WorksitesActions';

const LOG = new Logger('WorksitesSagas');
const { ORGANIZATION, WORKSITE } = APP_TYPE_FQN_STRINGS;
const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const { OPENLATTICE_ID_FQN } = Constants;

const getApp = state => state.get(STATE.APP, Map());

/*
 *
 * WorksitesActions.getOrganizationWorksites()
 *
 */

function* getOrganizationWorksitesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (value === null || value === undefined) {
    yield put(getOrganizationWorksites.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }

  let response :Object = {};
  const { organizationEntitySetId, organizationEntityKeyIds } = value;

  try {
    yield put(getOrganizationWorksites.request(id, value));

    /* may change depending on data model */
    const app = yield select(getApp);
    const worksitesESID :string = getEntitySetIdFromApp(app, WORKSITE);
    const params :Object = {
      entitySetId: organizationEntitySetId,
      filter: {
        entityKeyIds: organizationEntityKeyIds,
        destinationEntitySetIds: [worksitesESID],
      }
    };
    response = yield call(searchEntityNeighborsWithFilterWorker, searchEntityNeighborsWithFilter(params));
    if (response.error) {
      throw response.error;
    }
    const worksitesByOrganization :Map = fromJS(response.data);

    yield put(getOrganizationWorksites.success(id, worksitesByOrganization));
  }
  catch (error) {
    LOG.error('caught exception in getOrganizationWorksitesWorker()', error);
    yield put(getOrganizationWorksites.failure(id, error));
  }
  finally {
    yield put(getOrganizationWorksites.finally(id));
  }
}

function* getOrganizationWorksitesWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_ORGANIZATION_WORKSITES, getOrganizationWorksitesWorker);
}

/*
 *
 * WorksitesActions.getOrganizationWorksites()
 *
 */

function* getOrganizationsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id } = action;
  let response :Object = {};

  try {
    yield put(getOrganizations.request(id));

    const app = yield select(getApp);
    const orgESID :string = getEntitySetIdFromApp(app, ORGANIZATION);

    response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: orgESID }));
    if (response.error) {
      throw response.error;
    }
    const organizations :List = fromJS(response.data);

    /* get entityKeyIds of all organizations to call getOrganizationWorksites */
    let orgEKIDs :List = organizations.map((org :Object) => org.get(OPENLATTICE_ID_FQN));
    orgEKIDs = orgEKIDs.toJS();
    yield call(getOrganizationWorksitesWorker, getOrganizationWorksites({
      organizationEntitySetId: orgESID, organizationEntityKeyIds: orgEKIDs
    }));

    yield put(getOrganizations.success(id, organizations));
  }
  catch (error) {
    LOG.error('caught exception in getOrganizationsWorker()', error);
    yield put(getOrganizations.failure(id, error));
  }
  finally {
    yield put(getOrganizations.finally(id));
  }
}

function* getOrganizationsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_ORGANIZATIONS, getOrganizationsWorker);
}

export {
  getOrganizationsWatcher,
  getOrganizationsWorker,
  getOrganizationWorksitesWatcher,
  getOrganizationWorksitesWorker,
};
