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
  getPropertyTypeIdFromEdm,
  sortEntitiesByDateProperty,
} from '../../utils/DataUtils';
import { getWorksiteScheduleFromFormData, getWorksiteScheduleFromEntities } from '../../utils/ScheduleUtils';
import { isDefined } from '../../utils/LangUtils';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import {
  APP_TYPE_FQNS,
  CONTACT_INFO_FQNS,
  ENTITY_KEY_ID,
  INCIDENT_START_DATETIME,
  WORKSITE_PLAN_FQNS
} from '../../core/edm/constants/FullyQualifiedNames';
import {
  ADD_ORGANIZATION,
  ADD_WORKSITE,
  ADD_WORKSITE_CONTACT_AND_ADDRESS,
  CREATE_WORKSITE_SCHEDULE,
  EDIT_WORKSITE,
  EDIT_WORKSITE_CONTACT_AND_ADDRESS,
  GET_ORGANIZATIONS,
  GET_WORKSITE,
  GET_WORKSITES,
  GET_WORKSITES_BY_ORG,
  GET_WORKSITE_ADDRESS,
  GET_WORKSITE_CONTACT,
  GET_WORKSITE_PLANS,
  GET_WORKSITE_SCHEDULE,
  addOrganization,
  addWorksite,
  addWorksiteContactAndAddress,
  createWorksiteSchedule,
  editWorksite,
  editWorksiteContactAndAddress,
  getOrganizations,
  getWorksite,
  getWorksiteAddress,
  getWorksiteContact,
  getWorksitePlans,
  getWorksiteSchedule,
  getWorksites,
  getWorksitesByOrg,
} from './WorksitesActions';
import { submitDataGraph, submitPartialReplace } from '../../core/sagas/data/DataActions';
import { submitDataGraphWorker, submitPartialReplaceWorker } from '../../core/sagas/data/DataSagas';

const { PAST, SCHEDULED, TOTAL_HOURS } = WORKSITE_INFO_CONSTS;
const {
  ADDRESS,
  APPOINTMENT,
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
const { getEntityData, getEntitySetData } = DataApiActions;
const { getEntityDataWorker, getEntitySetDataWorker } = DataApiSagas;

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
 * WorksitesActions.addWorksiteContactAndAddress()
 *
 */

function* addWorksiteContactAndAddressWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let worksiteAddress :Map = Map();
  let contactPerson :Map = Map();
  let contactPhone :Map = Map();
  let contactEmail :Map = Map();

  try {
    yield put(addWorksiteContactAndAddress.request(id, value));

    response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) {
      throw response.error;
    }
    const { data } :Object = response;
    const { entityKeyIds } :Object = data;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);

    const contactInfoESID :UUID = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
    const staffESID :UUID = getEntitySetIdFromApp(app, STAFF);
    const addressESID :UUID = getEntitySetIdFromApp(app, ADDRESS);

    const staffEKID :UUID = entityKeyIds[staffESID][0];
    const addressEKID :UUID = entityKeyIds[addressESID][0];

    const { entityData } :Object = value;

    const storedAddressData :Map = fromJS(entityData[addressESID][0]);
    storedAddressData.forEach((addressValue, propertyTypeId) => {
      const propertyTypeFqn = getPropertyFqnFromEdm(edm, propertyTypeId);
      worksiteAddress = worksiteAddress.set(propertyTypeFqn, addressValue);
    });
    worksiteAddress = worksiteAddress.set(ENTITY_KEY_ID, addressEKID);

    const storedStaffData :Map = fromJS(entityData[staffESID][0]);
    storedStaffData.forEach((staffValue, propertyTypeId) => {
      const propertyTypeFqn = getPropertyFqnFromEdm(edm, propertyTypeId);
      contactPerson = contactPerson.set(propertyTypeFqn, staffValue);
    });
    contactPerson = contactPerson.set(ENTITY_KEY_ID, staffEKID);

    const storedContactData :List = fromJS(entityData[contactInfoESID]);
    storedContactData.forEach((contactEntity :Map, index :number) => {

      contactEntity.forEach((contactValue, propertyTypeId) => {

        if (propertyTypeId === getPropertyTypeIdFromEdm(edm, PHONE_NUMBER)) {
          contactPhone = contactPhone.set(PHONE_NUMBER, contactValue);
          contactPhone = contactPhone.set(ENTITY_KEY_ID, entityKeyIds[contactInfoESID][index]);
        }
        if (propertyTypeId === getPropertyTypeIdFromEdm(edm, EMAIL)) {
          contactEmail = contactEmail.set(EMAIL, contactValue);
          contactEmail = contactEmail.set(ENTITY_KEY_ID, entityKeyIds[contactInfoESID][index]);
        }
      });
    });

    yield put(addWorksiteContactAndAddress.success(id, {
      contactEmail,
      contactPerson,
      contactPhone,
      worksiteAddress,
    }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in addWorksiteContactAndAddressWorker()', error);
    yield put(addWorksiteContactAndAddress.failure(id, error));
  }
  finally {
    yield put(addWorksiteContactAndAddress.finally(id));
  }
}

function* addWorksiteContactAndAddressWatcher() :Generator<*, *, *> {

  yield takeEvery(ADD_WORKSITE_CONTACT_AND_ADDRESS, addWorksiteContactAndAddressWorker);
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
 * WorksitesActions.createWorksiteSchedule()
 *
 */

function* createWorksiteScheduleWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let scheduleForForm :Map = Map();

  try {
    yield put(createWorksiteSchedule.request(id, value));

    response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) throw response.error;

    const app = yield select(getAppFromState);
    const appointmentESID :UUID = getEntitySetIdFromApp(app, APPOINTMENT);
    const edm = yield select(getEdmFromState);
    const { entityData } = value;

    let entities :List = fromJS(entityData[appointmentESID])
      .map((appointment :Map) => {
        let formattedAppointment :Map = Map();
        appointment.forEach((apptValue :string, propertyTypeId :string) => {
          const propertyTypeFqn = getPropertyFqnFromEdm(edm, propertyTypeId);
          formattedAppointment = formattedAppointment.set(propertyTypeFqn, apptValue);
        });
        return formattedAppointment;
      });

    entities = sortEntitiesByDateProperty(entities, [INCIDENT_START_DATETIME]);
    scheduleForForm = fromJS(getWorksiteScheduleFromEntities(entities));

    yield put(createWorksiteSchedule.success(id, scheduleForForm));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in createWorksiteScheduleWorker()', error);
    yield put(createWorksiteSchedule.failure(id, error));
  }
  finally {
    yield put(createWorksiteSchedule.finally(id));
  }
}

function* createWorksiteScheduleWatcher() :Generator<*, *, *> {

  yield takeEvery(CREATE_WORKSITE_SCHEDULE, createWorksiteScheduleWorker);
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
    storedWorksiteData.forEach((worksiteValue, propertyTypeId) => {
      const propertyTypeFqn = getPropertyFqnFromEdm(edm, propertyTypeId);
      newWorksiteData = newWorksiteData.set(propertyTypeFqn, worksiteValue);
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
 * WorksitesActions.editWorksiteContactAndAddress()
 *
 */

function* editWorksiteContactAndAddressWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};
  let newPersonData :Map = Map();
  let newPhoneData :Map = Map();
  let newEmailData :Map = Map();
  let newAddressData :Map = Map();

  try {
    yield put(editWorksiteContactAndAddress.request(id, value));

    response = yield call(submitPartialReplaceWorker, submitPartialReplace(value));
    if (response.error) {
      throw response.error;
    }
    const { entityData } = value;
    const app = yield select(getAppFromState);
    const contactInfoESID :UUID = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
    const staffESID :UUID = getEntitySetIdFromApp(app, STAFF);
    const addressESID :UUID = getEntitySetIdFromApp(app, ADDRESS);
    const edm = yield select(getEdmFromState);

    const storedEntities :Map = fromJS(entityData);
    storedEntities.forEach((entities :Map, entitySetId :UUID) => {

      if (entitySetId === staffESID) {
        entities.forEach((addressValue, propertyTypeId) => {
          const propertyTypeFqn = getPropertyFqnFromEdm(edm, propertyTypeId);
          newPersonData = newPersonData.set(propertyTypeFqn, addressValue);
        });
      }

      if (entitySetId === contactInfoESID) {
        entities.forEach((contactEntity :Map) => {
          contactEntity.forEach((contactValue, propertyTypeId) => {
            if (propertyTypeId === getPropertyTypeIdFromEdm(edm, PHONE_NUMBER)) {
              newPhoneData = newPhoneData.set(PHONE_NUMBER, contactValue);
            }
            if (propertyTypeId === getPropertyTypeIdFromEdm(edm, EMAIL)) {
              newEmailData = newEmailData.set(EMAIL, contactValue);
            }
          });
        });
      }

      if (entitySetId === addressESID) {
        entities.forEach((addressValue, propertyTypeId) => {
          const propertyTypeFqn = getPropertyFqnFromEdm(edm, propertyTypeId);
          newAddressData = newAddressData.set(propertyTypeFqn, addressValue);
        });
      }
    });

    yield put(editWorksiteContactAndAddress.success(id, {
      newAddressData,
      newEmailData,
      newPersonData,
      newPhoneData,
    }));
  }
  catch (error) {
    LOG.error('caught exception in editWorksiteContactAndAddressWorker()', error);
    yield put(editWorksiteContactAndAddress.failure(id, error));
  }
  finally {
    yield put(editWorksiteContactAndAddress.finally(id));
  }
}

function* editWorksiteContactAndAddressWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_WORKSITE_CONTACT_AND_ADDRESS, editWorksiteContactAndAddressWorker);
}

/*
 *
 * WorksitesActions.editWorksiteContactAndAddress()
 *
 */

// function* editWorksiteAddressWorker(action :SequenceAction) :Generator<*, *, *> {
//
//   const { id, value } = action;
//   let response :Object = {};
//   let newAddressData :Map = Map();
//
//   try {
//     yield put(editWorksiteAddress.request(id, value));
//
//     response = yield call(submitPartialReplaceWorker, submitPartialReplace(value));
//     if (response.error) {
//       throw response.error;
//     }
//     const { entityData } = value;
//     const app = yield select(getAppFromState);
//     const addressESID :UUID = getEntitySetIdFromApp(app, ADDRESS);
//     const edm = yield select(getEdmFromState);
//
//     const storedEntities :Map = fromJS(entityData[addressESID]);
//     storedEntities.forEach((addressValue, propertyTypeId) => {
//       const propertyTypeFqn = getPropertyFqnFromEdm(edm, propertyTypeId);
//       newAddressData = newAddressData.set(propertyTypeFqn, addressValue);
//     });
//
//     yield put(editWorksiteAddress.success(id, { newAddressData }));
//   }
//   catch (error) {
//     LOG.error('caught exception in editWorksiteAddressWorker()', error);
//     yield put(editWorksiteAddress.failure(id, error));
//   }
//   finally {
//     yield put(editWorksiteAddress.finally(id));
//   }
// }
//
// function* editWorksiteAddressWatcher() :Generator<*, *, *> {
//
//   yield takeEvery(EDIT_WORKSITE_ADDRESS, editWorksiteAddressWorker);
// }

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
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: employeeESID, filter: searchFilter })
      );
      if (response.error) {
        throw response.error;
      }
      results = fromJS(response.data[employeeEKID]);
      if (isDefined(results) && !results.isEmpty()) {

        results.forEach((result :Map) => {
          if (getNeighborESID(result) === staffESID) {
            contactPerson = getNeighborDetails(result);
          }
          if (getNeighborESID(result) === contactInfoESID) {
            const { [EMAIL]: emailFound, [PHONE_NUMBER]: phoneFound } = getEntityProperties(
              result, [EMAIL, PHONE_NUMBER]
            );
            if (emailFound) {
              contactEmail = getNeighborDetails(result);
            }
            if (phoneFound) {
              contactPhone = getNeighborDetails(result);
            }
          }
        });
      }
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
 * WorksitesActions.getWorksiteSchedule()
 *
 */

function* getWorksiteScheduleWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let response :Object = {};
  let scheduleForForm :Map = Map();
  let scheduleByWeekday :Map = Map();

  try {
    yield put(getWorksiteSchedule.request(id));
    const { worksiteEKID } = value;
    const app = yield select(getAppFromState);
    const worksiteESID = getEntitySetIdFromApp(app, WORKSITE);
    const appointmentESID = getEntitySetIdFromApp(app, APPOINTMENT);

    const searchFilter :{} = {
      entityKeyIds: [worksiteEKID],
      destinationEntitySetIds: [appointmentESID],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: worksiteESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    let appointmentResults :List = fromJS(response.data[worksiteEKID]);
    if (isDefined(appointmentResults) && !appointmentResults.isEmpty()) {
      appointmentResults = appointmentResults.map((result :Map) => getNeighborDetails(result));
      appointmentResults = sortEntitiesByDateProperty(appointmentResults, [INCIDENT_START_DATETIME]);
      scheduleForForm = fromJS(getWorksiteScheduleFromEntities(appointmentResults));
      scheduleByWeekday = getWorksiteScheduleFromFormData(scheduleForForm);
    }

    yield put(getWorksiteSchedule.success(id, { scheduleByWeekday, scheduleForForm }));
  }
  catch (error) {
    LOG.error('caught exception in getWorksiteScheduleWorker()', error);
    yield put(getWorksiteSchedule.failure(id, error));
  }
  finally {
    yield put(getWorksiteSchedule.finally(id));
  }
}

function* getWorksiteScheduleWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_WORKSITE_SCHEDULE, getWorksiteScheduleWorker);
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

    response = yield call(getEntityDataWorker, getEntityData({
      entitySetId: worksiteESID,
      entityKeyId: worksiteEKID
    }));
    if (response.error) {
      throw response.error;
    }
    worksite = fromJS(response.data);

    yield all([
      call(getWorksiteAddressWorker, getWorksiteAddress({ worksiteEKID })),
      call(getWorksiteContactWorker, getWorksiteContact({ worksiteEKID })),
      call(getWorksiteScheduleWorker, getWorksiteSchedule({ worksiteEKID })),
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
  addWorksiteContactAndAddressWatcher,
  addWorksiteContactAndAddressWorker,
  createWorksiteScheduleWatcher,
  createWorksiteScheduleWorker,
  editWorksiteWatcher,
  editWorksiteWorker,
  editWorksiteContactAndAddressWatcher,
  editWorksiteContactAndAddressWorker,
  getOrganizationsWatcher,
  getOrganizationsWorker,
  getWorksiteWatcher,
  getWorksiteWorker,
  getWorksiteAddressWatcher,
  getWorksiteAddressWorker,
  getWorksiteContactWatcher,
  getWorksiteContactWorker,
  getWorksiteScheduleWatcher,
  getWorksiteScheduleWorker,
  getWorksitesWatcher,
  getWorksitesWorker,
  getWorksitePlansWatcher,
  getWorksitePlansWorker,
  getWorksitesByOrgWatcher,
  getWorksitesByOrgWorker,
};
