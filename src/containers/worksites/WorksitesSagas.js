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
import { WORKSITE_INFO_CONSTS } from './WorksitesConstants';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getNeighborDetails
} from '../../utils/DataUtils';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS, WORKSITE_PLAN_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import {
  GET_WORKSITES,
  GET_WORKSITE_PLANS,
  getWorksitePlans,
  getWorksites,
} from './WorksitesActions';

const { PAST, SCHEDULED, TOTAL_HOURS } = WORKSITE_INFO_CONSTS;
const { ORGANIZATION, WORKSITE, WORKSITE_PLAN } = APP_TYPE_FQNS;
const { HOURS_WORKED, REQUIRED_HOURS } = WORKSITE_PLAN_FQNS;

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
    /*
     * 1. For each worksite given, get all associated worksite plans.
     */
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

    /*
     * 2. For each worksite with worksite plans, calculate the number of scheduled and past participants,
          as well as total hours worked so far at the worksite.
     */
    const worksitePlanCount :number = worksitePlansByWorksite.count() ? worksitePlansByWorksite
      .reduce((totalCount, worksitePlanList) => (totalCount + worksitePlanList.count()), 0) : 0;

    let worksitePlanInfoMap :Map = Map();
    if (worksitePlanCount) {
      worksitePlansByWorksite.forEach((worksitePlans :List, worksiteEKID :UUID) => {

        const scheduledParticipants :number = worksitePlans.reduce((total, plan) => {
          const {
            [HOURS_WORKED]: hoursWorked,
            [REQUIRED_HOURS]: reqHours
          } = getEntityProperties(plan, [HOURS_WORKED, REQUIRED_HOURS]);
          if (!hoursWorked || !reqHours) return total;
          if (hoursWorked === reqHours) return total;
          if (hoursWorked !== reqHours) return total + 1;
          return total;
        }, 0);
        const pastParticipants :number = worksitePlans.reduce((total, plan) => {
          const {
            [HOURS_WORKED]: hoursWorked,
            [REQUIRED_HOURS]: reqHours
          } = getEntityProperties(plan, [HOURS_WORKED, REQUIRED_HOURS]);
          if (!hoursWorked || !reqHours) return total;
          if (hoursWorked === reqHours) return total + 1;
          if (hoursWorked !== reqHours) return total;
          return total;
        }, 0);
        const totalHoursWorkedAtWorksite :number = worksitePlans.reduce((total, plan) => {
          const { [HOURS_WORKED]: hoursWorked } = getEntityProperties(plan, [HOURS_WORKED]);
          if (!hoursWorked) return total;
          return total + hoursWorked;
        }, 0);
        const individualWorksiteInfo :Map = Map().withMutations((map) => {
          map.set(SCHEDULED, scheduledParticipants);
          map.set(PAST, pastParticipants);
          map.set(TOTAL_HOURS, totalHoursWorkedAtWorksite);
        });
        worksitePlanInfoMap = worksitePlanInfoMap.set(worksiteEKID, individualWorksiteInfo);
      });
    }

    yield put(getWorksitePlans.success(id, worksitePlanInfoMap));
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

    const worksiteCount :number = worksitesByOrg.count() ? worksitesByOrg
      .reduce((totalCount, worksiteList) => (totalCount + worksiteList.count()), 0) : 0;

    if (worksiteCount) {
      const worksiteEKIDs :string[] = worksitesByOrg
        .reduce((ekidArray, worksiteList) => {
          const innerEKIDs = worksiteList
            .reduce((innerEKIDArray, worksite) => (innerEKIDArray.concat([getEntityKeyId(worksite)])), []);
          return ekidArray.concat(innerEKIDs);
        }, []);
      yield call(getWorksitePlansWorker, getWorksitePlans({ worksiteEKIDs }));
    }

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

export {
  getWorksitePlansWatcher,
  getWorksitePlansWorker,
  getWorksitesWatcher,
  getWorksitesWorker,
};
