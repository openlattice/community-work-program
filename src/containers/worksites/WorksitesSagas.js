/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import {
  all,
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import {
  DataApiActions,
  DataApiSagas,
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
  getNeighborDetails,
  getNeighborESID,
  getPropertyFqnFromEdm,
} from '../../utils/DataUtils';
import { isDefined } from '../../utils/LangUtils';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS, CONTACT_INFO_FQNS, WORKSITE_PLAN_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import {
  ADD_ORGANIZATION,
  ADD_WORKSITE,
  EDIT_WORKSITE,
  GET_ORGANIZATIONS,
  GET_WORKSITE,
  GET_WORKSITES,
  GET_WORKSITES_BY_ORG,
  GET_WORKSITE_ADDRESS,
  GET_WORKSITE_CONTACT,
  GET_WORKSITE_PLANS,
  addOrganization,
  addWorksite,
  editWorksite,
  getOrganizations,
  getWorksite,
  getWorksiteAddress,
  getWorksiteContact,
  getWorksitePlans,
  getWorksites,
  getWorksitesByOrg,
} from './WorksitesActions';
import { submitDataGraph, submitPartialReplace } from '../../core/sagas/data/DataActions';
import { submitDataGraphWorker, submitPartialReplaceWorker } from '../../core/sagas/data/DataSagas';

const { PAST, SCHEDULED, TOTAL_HOURS } = WORKSITE_INFO_CONSTS;
const {
  ADDRESS,
  CONTACT_INFORMATION,
  EMPLOYEE,
  ORGANIZATION,
  STAFF,
  WORKSITE,
  WORKSITE_PLAN,
} = APP_TYPE_FQNS;
const { EMAIL, PHONE_NUMBER } = CONTACT_INFO_FQNS;
const { HOURS_WORKED, REQUIRED_HOURS } = WORKSITE_PLAN_FQNS;

const LOG = new Logger('WorksitesSagas');
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;

const getAppFromState = state => state.get(STATE.APP, Map());
const getEdmFromState = state => state.get(STATE.EDM, Map());

/*
 *
 * WorksitesActions.addWorksite()
 *
 */

function* addWorksiteWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};

  try {
    yield put(addWorksite.request(id, value));

    response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) {
      throw response.error;
    }
    const { data } :Object = response;
    const { entityKeyIds } :Object = data;

    const edm = yield select(getEdmFromState);
    const worksiteESID = Object.keys(entityKeyIds)[0];
    const worksiteEKID = Object.values(entityKeyIds)[0];

    yield put(addWorksite.success(id, { edm, worksiteEKID, worksiteESID }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in addWorksiteWorker()', error);
    yield put(addWorksite.failure(id, error));
  }
  finally {
    yield put(addWorksite.finally(id));
  }
}

function* addWorksiteWatcher() :Generator<*, *, *> {

  yield takeEvery(ADD_WORKSITE, addWorksiteWorker);
}

/*
 *
 * WorksitesActions.addOrganization()
 *
 */

function* addOrganizationWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};

  try {
    yield put(addOrganization.request(id, value));

    response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) {
      throw response.error;
    }
    const { data } :Object = response;
    const { entityKeyIds } :Object = data;

    const edm = yield select(getEdmFromState);
    const orgESID = Object.keys(entityKeyIds)[0];
    const orgEKID = Object.values(entityKeyIds)[0];

    yield put(addOrganization.success(id, { edm, orgEKID, orgESID }));
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
 * WorksitesActions.editWorksite()
 *
 */

function* editWorksiteWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};

  try {
    yield put(editWorksite.request(id, value));

    response = yield call(submitPartialReplaceWorker, submitPartialReplace(value));
    if (response.error) {
      throw response.error;
    }
    const { entityData } = value;
    const app = yield select(getAppFromState);
    const worksiteESID :UUID = getEntitySetIdFromApp(app, WORKSITE);
    const edm = yield select(getEdmFromState);

    const personEKID :UUID = Object.keys(entityData[worksiteESID])[0];
    const storedWorksiteData :Map = fromJS(entityData[worksiteESID][personEKID]);

    let newWorksiteData :Map = Map();
    storedWorksiteData.forEach((personValue, propertyTypeId) => {
      const propertyTypeFqn = getPropertyFqnFromEdm(edm, propertyTypeId);
      newWorksiteData = newWorksiteData.set(propertyTypeFqn, personValue);
    });
    yield put(editWorksite.success(id, { newWorksiteData }));
  }
  catch (error) {
    LOG.error('caught exception in editWorksiteWorker()', error);
    yield put(editWorksite.failure(id, error));
  }
  finally {
    yield put(editWorksite.finally(id));
  }
}

function* editWorksiteWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_WORKSITE, editWorksiteWorker);
}

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
          if (hoursWorked !== reqHours) {
            return total + 1;
          }
          return total;
        }, 0);
        const pastParticipants :number = worksitePlans.reduce((total, plan) => {
          const {
            [HOURS_WORKED]: hoursWorked,
            [REQUIRED_HOURS]: reqHours
          } = getEntityProperties(plan, [HOURS_WORKED, REQUIRED_HOURS]);
          if (hoursWorked === reqHours) {
            return total + 1;
          }
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
 * WorksitesActions.getWorksitesByOrg()
 *
 */

function* getWorksitesByOrgWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let worksitesByOrg :Map = Map();

  try {
    yield put(getWorksitesByOrg.request(id, value));
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

    yield put(getWorksitesByOrg.success(id, { worksitesByOrg }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getWorksitesByOrgWorker()', error);
    yield put(getWorksitesByOrg.failure(id, error));
  }
  finally {
    yield put(getWorksitesByOrg.finally(id));
  }
  return workerResponse;
}

function* getWorksitesByOrgWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_WORKSITES_BY_ORG, getWorksitesByOrgWorker);
}

/*
 *
 * WorksitesActions.getOrganizations()
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
      yield call(getWorksitesByOrgWorker, getWorksitesByOrg({ organizationEKIDs }));
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

/*
 *
 * WorksitesActions.getWorksites()
 *
 */

function* getWorksitesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id } = action;
  const workerResponse = {};
  let response :Object = {};
  let worksites :List = List();

  try {
    yield put(getWorksites.request(id));
    const app = yield select(getAppFromState);
    const worksiteESID = getEntitySetIdFromApp(app, WORKSITE);

    response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: worksiteESID }));
    if (response.error) {
      throw response.error;
    }
    worksites = fromJS(response.data);

    yield put(getWorksites.success(id, worksites));
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

/*
 *
 * WorksitesActions.getWorksiteAddress()
 *
 */

function* getWorksiteAddressWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let response :Object = {};
  let address :Map = Map();

  try {
    yield put(getWorksiteAddress.request(id));
    const { worksiteEKID } = value;
    const app = yield select(getAppFromState);
    const worksiteESID = getEntitySetIdFromApp(app, WORKSITE);
    const addressESID = getEntitySetIdFromApp(app, ADDRESS);

    const searchFilter :{} = {
      entityKeyIds: [worksiteEKID],
      destinationEntitySetIds: [addressESID],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: worksiteESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    const results :List = fromJS(response.data[worksiteEKID]);
    if (isDefined(results) && !results.isEmpty()) address = getNeighborDetails(results.get(0));

    yield put(getWorksiteAddress.success(id, address));
  }
  catch (error) {
    LOG.error('caught exception in getWorksiteAddressWorker()', error);
    yield put(getWorksiteAddress.failure(id, error));
  }
  finally {
    yield put(getWorksiteAddress.finally(id));
  }
}

function* getWorksiteAddressWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_WORKSITE_ADDRESS, getWorksiteAddressWorker);
}

/*
 *
 * WorksitesActions.getWorksiteContact()
 *
 */

function* getWorksiteContactWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let response :Object = {};
  let contactPerson :Map = Map();
  let contactEmail :Map = Map();
  let contactPhone :Map = Map();

  try {
    yield put(getWorksiteContact.request(id));
    const { worksiteEKID } = value;
    const app = yield select(getAppFromState);
    const worksiteESID :UUID = getEntitySetIdFromApp(app, WORKSITE);
    const employeeESID :UUID = getEntitySetIdFromApp(app, EMPLOYEE);

    let searchFilter :{} = {
      entityKeyIds: [worksiteEKID],
      destinationEntitySetIds: [],
      sourceEntitySetIds: [employeeESID],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: worksiteESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    let results :List = fromJS(response.data[worksiteEKID]);
    if (isDefined(results) && !results.isEmpty()) {

      const employee = getNeighborDetails(results.get(0));
      const employeeEKID :UUID = getEntityKeyId(employee);
      const staffESID :UUID = getEntitySetIdFromApp(app, STAFF);
      const contactInfoESID :UUID = getEntitySetIdFromApp(app, CONTACT_INFORMATION);

      searchFilter = {
        entityKeyIds: [employeeEKID],
        destinationEntitySetIds: [],
        sourceEntitySetIds: [staffESID, contactInfoESID],
      };
      results = fromJS(response.data[worksiteEKID]);
      results.foreach((result :Map) => {
        if (getNeighborESID(result) === staffESID) {
          contactPerson = getNeighborDetails(result);
        }
        if (getNeighborESID(result) === contactInfoESID) {
          const { [EMAIL]: emailFound, [PHONE_NUMBER]: phoneFound } = getEntityProperties(
            result, [EMAIL, PHONE_NUMBER]
          );
          if (isDefined(emailFound)) {
            contactEmail = getNeighborDetails(result);
          }
          if (isDefined(phoneFound)) {
            contactPhone = getNeighborDetails(result);
          }
        }
      });
    }

    yield put(getWorksiteContact.success(id, { contactEmail, contactPerson, contactPhone }));
  }
  catch (error) {
    LOG.error('caught exception in getWorksiteContactWorker()', error);
    yield put(getWorksiteContact.failure(id, error));
  }
  finally {
    yield put(getWorksiteContact.finally(id));
  }
}

function* getWorksiteContactWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_WORKSITE_CONTACT, getWorksiteContactWorker);
}

/*
 *
 * WorksitesActions.getWorksite()
 *
 */

function* getWorksiteWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let response :Object = {};
  let worksite :Map = Map();

  try {
    yield put(getWorksite.request(id));
    const { worksiteEKID } = value;

    const app = yield select(getAppFromState);
    const worksiteESID = getEntitySetIdFromApp(app, WORKSITE);

    response = yield call(getEntitySetDataWorker, getEntitySetData({
      entitySetId: worksiteESID,
      entityKeyId: worksiteEKID
    }));
    if (response.error) {
      throw response.error;
    }
    worksite = fromJS(response.data).get(0);

    yield all([
      call(getWorksiteAddressWorker, getWorksiteAddress({ worksiteEKID })),
      call(getWorksiteContactWorker, getWorksiteContact({ worksiteEKID })),
    ]);

    yield put(getWorksite.success(id, worksite));
  }
  catch (error) {
    LOG.error('caught exception in getWorksiteWorker()', error);
    yield put(getWorksite.failure(id, error));
  }
  finally {
    yield put(getWorksite.finally(id));
  }
}

function* getWorksiteWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_WORKSITE, getWorksiteWorker);
}

export {
  addOrganizationWatcher,
  addOrganizationWorker,
  addWorksiteWatcher,
  addWorksiteWorker,
  editWorksiteWatcher,
  editWorksiteWorker,
  getOrganizationsWatcher,
  getOrganizationsWorker,
  getWorksiteWatcher,
  getWorksiteWorker,
  getWorksiteAddressWatcher,
  getWorksiteAddressWorker,
  getWorksiteContactWatcher,
  getWorksiteContactWorker,
  getWorksitesWatcher,
  getWorksitesWorker,
  getWorksitePlansWatcher,
  getWorksitePlansWorker,
  getWorksitesByOrgWatcher,
  getWorksitesByOrgWorker,
};
