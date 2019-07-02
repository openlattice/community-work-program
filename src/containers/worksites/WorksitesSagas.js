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
  SearchApiActions,
  SearchApiSagas
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { getEntitySetIdFromApp, getNeighborDetails } from '../../utils/DataUtils';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import {
  GET_WORKSITES,
  GET_WORKSITE_PLANS,
  getWorksitePlans,
  getWorksites,
} from './WorksitesActions';

const { ORGANIZATION, WORKSITE, WORKSITE_PLAN } = APP_TYPE_FQNS;

const LOG = new Logger('WorksitesSagas');
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

const getAppFromState = state => state.get(STATE.APP, Map());

/*
 *
 * WorksitesActions.getWorksitePlans()
 *
 */

function* getWorksitePlansWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let worksitePlansByWorksite :Map = Map();

  try {
    yield put(getWorksitePlans.request(id));
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const { worksiteEKIDs } = value;
    const app = yield select(getAppFromState);
    const worksiteESID = getEntitySetIdFromApp(app, WORKSITE);
    const worksitePlanESID = getEntitySetIdFromApp(app, WORKSITE_PLAN);

    const searchFilter = {
      entitySetId: worksiteESID,
      filter: {
        entityKeyIds: worksiteEKIDs,
        destinationEntitySetIds: [],
        sourceEntitySetIds: [worksitePlanESID],
      }
    };
    response = yield call(searchEntityNeighborsWithFilterWorker, searchEntityNeighborsWithFilter(searchFilter));
    if (response.error) {
      throw response.error;
    }
    worksitePlansByWorksite = fromJS(response.data)
      .map((worksiteList :List) => worksiteList
        .map((worksite :Map) => getNeighborDetails(worksite)));

    yield put(getWorksitePlans.success(id, worksitePlansByWorksite));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getWorksitePlansWorker()', error);
    yield put(getWorksitePlans.failure(id, error));
  }
  finally {
    yield put(getWorksitePlans.finally(id));
  }
  return workerResponse;
}

function* getWorksitePlansWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_WORKSITE_PLANS, getWorksitePlansWorker);
}

/*
 *
 * WorksitesActions.getWorksites()
 *
 */

function* getWorksitesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let worksitesByOrg :Map = Map();

  try {
    yield put(getWorksites.request(id));
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const { organizationEKIDs } = value;
    const app = yield select(getAppFromState);
    const organizationESID = getEntitySetIdFromApp(app, ORGANIZATION);
    const worksiteESID = getEntitySetIdFromApp(app, WORKSITE);

    const searchFilter = {
      entitySetId: organizationESID,
      filter: {
        entityKeyIds: organizationEKIDs,
        destinationEntitySetIds: [worksiteESID],
        sourceEntitySetIds: [],
      }
    };
    response = yield call(searchEntityNeighborsWithFilterWorker, searchEntityNeighborsWithFilter(searchFilter));
    if (response.error) {
      throw response.error;
    }
    worksitesByOrg = fromJS(response.data)
      .map((worksiteList :List) => worksiteList
        .map((worksite :Map) => getNeighborDetails(worksite)));

    yield put(getWorksites.success(id, worksitesByOrg));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getWorksitesWorker()', error);
    yield put(getWorksites.failure(id, error));
  }
  finally {
    yield put(getWorksites.finally(id));
  }
  return workerResponse;
}

function* getWorksitesWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_WORKSITES, getWorksitesWorker);
}

// /*
//  *
//  * WorksitesActions.getOrganizationWorksites()
//  *
//  */
//
// function* getOrganizationWorksitesWorker(action :SequenceAction) :Generator<*, *, *> {
//
//   const { id, value } = action;
//   if (value === null || value === undefined) {
//     yield put(getOrganizationWorksites.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
//     return;
//   }
//
//   let response :Object = {};
//   const { organizationEntitySetId, organizationEntityKeyIds } = value;
//
//   try {
//     yield put(getOrganizationWorksites.request(id, value));
//
//     /* may change depending on data model */
//     const app = yield select(getApp);
//     const worksitesESID :string = getEntitySetIdFromApp(app, WORKSITE);
//     const params :Object = {
//       entitySetId: organizationEntitySetId,
//       filter: {
//         entityKeyIds: organizationEntityKeyIds,
//         destinationEntitySetIds: [worksitesESID],
//       }
//     };
//     response = yield call(searchEntityNeighborsWithFilterWorker, searchEntityNeighborsWithFilter(params));
//     if (response.error) {
//       throw response.error;
//     }
//     const worksitesByOrganization :Map = fromJS(response.data);
//
//     yield put(getOrganizationWorksites.success(id, worksitesByOrganization));
//   }
//   catch (error) {
//     LOG.error('caught exception in getOrganizationWorksitesWorker()', error);
//     yield put(getOrganizationWorksites.failure(id, error));
//   }
//   finally {
//     yield put(getOrganizationWorksites.finally(id));
//   }
// }
//
// function* getOrganizationWorksitesWatcher() :Generator<*, *, *> {
//
//   yield takeEvery(GET_ORGANIZATION_WORKSITES, getOrganizationWorksitesWorker);
// }
//
// /*
//  *
//  * WorksitesActions.getOrganizationWorksites()
//  *
//  */
//
// function* getOrganizationsWorker(action :SequenceAction) :Generator<*, *, *> {
//
//   const { id } = action;
//   let response :Object = {};
//
//   try {
//     yield put(getOrganizations.request(id));
//
//     const app = yield select(getApp);
//     const orgESID :string = getEntitySetIdFromApp(app, ORGANIZATION);
//
//     response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: orgESID }));
//     if (response.error) {
//       throw response.error;
//     }
//     const organizations :List = fromJS(response.data);
//
//     /* get entityKeyIds of all organizations to call getOrganizationWorksites */
//     let orgEKIDs :List = organizations.map((org :Object) => org.get(OPENLATTICE_ID_FQN));
//     orgEKIDs = orgEKIDs.toJS();
//     yield call(getOrganizationWorksitesWorker, getOrganizationWorksites({
//       organizationEntitySetId: orgESID, organizationEntityKeyIds: orgEKIDs
//     }));
//
//     yield put(getOrganizations.success(id, organizations));
//   }
//   catch (error) {
//     LOG.error('caught exception in getOrganizationsWorker()', error);
//     yield put(getOrganizations.failure(id, error));
//   }
//   finally {
//     yield put(getOrganizations.finally(id));
//   }
// }
//
// function* getOrganizationsWatcher() :Generator<*, *, *> {
//
//   yield takeEvery(GET_ORGANIZATIONS, getOrganizationsWorker);
// }

export {
  getWorksitePlansWatcher,
  getWorksitePlansWorker,
  getWorksitesWatcher,
  getWorksitesWorker,
};
