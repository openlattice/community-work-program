// @flow
import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import {
  List,
  Map,
  fromJS,
} from 'immutable';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import { LangUtils, Logger } from 'lattice-utils';
import type { SequenceAction } from 'redux-reqseq';

import {
  ADD_PERSON_ADDRESS,
  ADD_PERSON_EMAIL,
  ADD_PERSON_PHONE,
  EDIT_PERSON_ADDRESS,
  EDIT_PERSON_EMAIL,
  EDIT_PERSON_PHONE,
  GET_PERSON_ADDRESS,
  GET_PERSON_CONTACT_INFO,
  addPersonAddress,
  addPersonEmail,
  addPersonPhone,
  editPersonAddress,
  editPersonEmail,
  editPersonPhone,
  getPersonAddress,
  getPersonContactInfo,
} from './PersonContactsActions';

import { CONTACT_METHODS } from '../../../core/edm/constants/DataModelConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { submitDataGraph, submitPartialReplace } from '../../../core/sagas/data/DataActions';
import { submitDataGraphWorker, submitPartialReplaceWorker } from '../../../core/sagas/data/DataSagas';
import {
  getEntityProperties,
  getEntitySetIdFromApp,
  getNeighborDetails,
  getPropertyFqnFromEdm,
} from '../../../utils/DataUtils';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';
import { STATE } from '../../../utils/constants/ReduxStateConsts';

const { isDefined } = LangUtils;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const { ADDRESS, CONTACT_INFORMATION, PEOPLE } = APP_TYPE_FQNS;
const {
  EMAIL,
  ENTITY_KEY_ID,
  PHONE_NUMBER,
  PREFERRED,
} = PROPERTY_TYPE_FQNS;
const getAppFromState = (state) => state.get(STATE.APP, Map());
const getEdmFromState = (state) => state.get(STATE.EDM, Map());
const LOG = new Logger('PersonContactsSagas');

/*
 *
 * PersonContactsActions.addPersonAddress()
 *
 */

function* addPersonAddressWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};

  try {
    yield put(addPersonAddress.request(id, value));
    response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) throw response.error;
    const { entityData } = value;
    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const addressESID :UUID = getEntitySetIdFromApp(app, ADDRESS);
    const addressEKID :UUID = Object.keys(entityData[addressESID])[0];
    const storedAddressData :Map = fromJS(entityData[addressESID][addressEKID]);
    const newAddress :Map = Map().withMutations((mutator :Map) => {
      storedAddressData.forEach((personValue, propertyTypeId) => {
        const propertyTypeFqn = getPropertyFqnFromEdm(edm, propertyTypeId);
        mutator.set(propertyTypeFqn, personValue);
      });
    });
    yield put(addPersonAddress.success(id, newAddress));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(addPersonAddress.failure(id, error));
  }
  finally {
    yield put(addPersonAddress.finally(id));
  }
}

function* addPersonAddressWatcher() :Generator<*, *, *> {

  yield takeEvery(ADD_PERSON_ADDRESS, addPersonAddressWorker);
}

/*
 *
 * PersonContactsActions.addPersonEmail()
 *
 */

function* addPersonEmailWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};

  try {
    yield put(addPersonEmail.request(id, value));
    response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) throw response.error;
    const { entityData } = value;
    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const contactInfoESID = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
    const emailEKID :UUID = Object.keys(entityData[contactInfoESID])[0];
    const storedEmailData :Map = fromJS(entityData[contactInfoESID][emailEKID]);
    const newEmail :Map = Map().withMutations((mutator :Map) => {
      storedEmailData.forEach((personValue, propertyTypeId) => {
        const propertyTypeFqn = getPropertyFqnFromEdm(edm, propertyTypeId);
        mutator.set(propertyTypeFqn, personValue);
      });
    });
    yield put(addPersonEmail.success(id, newEmail));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(addPersonEmail.failure(id, error));
  }
  finally {
    yield put(addPersonEmail.finally(id));
  }
}

function* addPersonEmailWatcher() :Generator<*, *, *> {

  yield takeEvery(ADD_PERSON_EMAIL, addPersonEmailWorker);
}

/*
 *
 * PersonContactsActions.addPersonPhone()
 *
 */

function* addPersonPhoneWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};

  try {
    yield put(addPersonPhone.request(id, value));
    response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) throw response.error;
    const { entityData } = value;
    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const contactInfoESID = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
    const phoneEKID :UUID = Object.keys(entityData[contactInfoESID])[0];
    const storedPhoneData :Map = fromJS(entityData[contactInfoESID][phoneEKID]);
    const newPhone :Map = Map().withMutations((mutator :Map) => {
      storedPhoneData.forEach((personValue, propertyTypeId) => {
        const propertyTypeFqn = getPropertyFqnFromEdm(edm, propertyTypeId);
        mutator.set(propertyTypeFqn, personValue);
      });
    });
    yield put(addPersonPhone.success(id, newPhone));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(addPersonPhone.failure(id, error));
  }
  finally {
    yield put(addPersonPhone.finally(id));
  }
}

function* addPersonPhoneWatcher() :Generator<*, *, *> {

  yield takeEvery(ADD_PERSON_PHONE, addPersonPhoneWorker);
}

/*
 *
 * PersonContactsActions.editPersonAddress()
 *
 */

function* editPersonAddressWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id } = action;
  try {
    yield put(editPersonAddress.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const { entityData } = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const addressESID :UUID = getEntitySetIdFromApp(app, ADDRESS);

    let editedAddressData :Map = Map();

    if (Object.values(entityData).length) {
      const response :Object = yield call(submitPartialReplaceWorker, submitPartialReplace({ entityData }));
      if (response.error) throw response.error;

      if (entityData[addressESID]) {
        const data = Object.values(entityData[addressESID])[0];
        const addressEKID = Object.keys(entityData[addressESID])[0];
        editedAddressData = Map().withMutations((map :Map) => {
          fromJS(data).forEach((propertyValue :any, ptid :string) => {
            const fqn = getPropertyFqnFromEdm(edm, ptid);
            map.set(fqn, propertyValue);
          });
          map.set(ENTITY_KEY_ID, List([addressEKID]));
        });
      }
    }
    yield put(editPersonAddress.success(id, editedAddressData));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(editPersonAddress.failure(id, error));
  }
  finally {
    yield put(editPersonAddress.finally(id));
  }
}

function* editPersonAddressWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_PERSON_ADDRESS, editPersonAddressWorker);
}

/*
 *
 * PersonContactsActions.editPersonEmail()
 *
 */

function* editPersonEmailWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id } = action;
  try {
    yield put(editPersonEmail.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const { entityData } = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const contactInfoESID :UUID = getEntitySetIdFromApp(app, CONTACT_INFORMATION);

    let editedEmailData :Map = Map();

    if (Object.values(entityData).length) {
      const response :Object = yield call(submitPartialReplaceWorker, submitPartialReplace({ entityData }));
      if (response.error) throw response.error;

      if (entityData[contactInfoESID]) {
        const data = Object.values(entityData[contactInfoESID])[0];
        const emailEKID = Object.keys(entityData[contactInfoESID])[0];
        editedEmailData = Map().withMutations((map :Map) => {
          fromJS(data).forEach((propertyValue :any, ptid :string) => {
            const fqn = getPropertyFqnFromEdm(edm, ptid);
            map.set(fqn, propertyValue);
          });
          map.set(ENTITY_KEY_ID, List([emailEKID]));
        });
      }
    }
    yield put(editPersonEmail.success(id, editedEmailData));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(editPersonEmail.failure(id, error));
  }
  finally {
    yield put(editPersonEmail.finally(id));
  }
}

function* editPersonEmailWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_PERSON_EMAIL, editPersonEmailWorker);
}

/*
 *
 * PersonContactsActions.editPersonPhone()
 *
 */

function* editPersonPhoneWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id } = action;
  try {
    yield put(editPersonPhone.request(id));
    const { value } = action;
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const { entityData } = value;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const contactInfoESID :UUID = getEntitySetIdFromApp(app, CONTACT_INFORMATION);

    let editedPhoneData :Map = Map();

    if (Object.values(entityData).length) {
      const response :Object = yield call(submitPartialReplaceWorker, submitPartialReplace({ entityData }));
      if (response.error) throw response.error;

      if (entityData[contactInfoESID]) {
        const data = Object.values(entityData[contactInfoESID])[0];
        const phoneEKID = Object.keys(entityData[contactInfoESID])[0];
        editedPhoneData = Map().withMutations((map :Map) => {
          fromJS(data).forEach((propertyValue :any, ptid :string) => {
            const fqn = getPropertyFqnFromEdm(edm, ptid);
            map.set(fqn, propertyValue);
          });
          map.set(ENTITY_KEY_ID, List([phoneEKID]));
        });
      }
    }
    yield put(editPersonPhone.success(id, editedPhoneData));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(editPersonPhone.failure(id, error));
  }
  finally {
    yield put(editPersonPhone.finally(id));
  }
}

function* editPersonPhoneWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_PERSON_PHONE, editPersonPhoneWorker);
}

/*
 *
 * PersonContactsActions.getPersonAddress()
 *
 */

function* getPersonAddressWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};

  try {
    yield put(getPersonAddress.request(id));
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const { personEKID } = value;
    const app = yield select(getAppFromState);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
    const addressESID = getEntitySetIdFromApp(app, ADDRESS);

    const filter :Object = {
      entityKeyIds: [personEKID],
      destinationEntitySetIds: [addressESID],
      sourceEntitySetIds: [],
    };
    const response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: peopleESID, filter })
    );
    if (response.error) throw response.error;
    let address :Map = Map();
    if (response.data[personEKID]) {
      const addressNeighbor = fromJS(response.data[personEKID][0]);
      address = getNeighborDetails(addressNeighbor);
    }
    yield put(getPersonAddress.success(id, address));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error(action.type, error);
    yield put(getPersonAddress.failure(id, error));
  }
  finally {
    yield put(getPersonAddress.finally(id));
  }
  return workerResponse;
}

function* getPersonAddressWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PERSON_ADDRESS, getPersonAddressWorker);
}

/*
 *
 * PersonContactsActions.getPersonContactInfo()
 *
 */

function* getPersonContactInfoWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};

  try {
    yield put(getPersonContactInfo.request(id));
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const { personEKID } = value;
    const app = yield select(getAppFromState);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
    const contactInfoESID = getEntitySetIdFromApp(app, CONTACT_INFORMATION);

    /* two association entity types:
       person -> contacted via -> contact info
       contact info -> contact given for -> person */
    const searchFilter :Object = {
      entityKeyIds: [personEKID],
      destinationEntitySetIds: [contactInfoESID],
      sourceEntitySetIds: [contactInfoESID],
    };
    const response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: peopleESID, filter: searchFilter })
    );
    if (response.error) throw response.error;

    const contactInfo :Map = Map().withMutations((mutator :Map) => {
      if (response.data[personEKID]) {
        fromJS(response.data[personEKID])
          .map((contactInfoNeighbor :Map) => getNeighborDetails(contactInfoNeighbor))
          .forEach((contact :Map) => {
            const { [PREFERRED]: preferred } = getEntityProperties(contact, [PREFERRED]);
            let email :Map = mutator.get(CONTACT_METHODS.EMAIL, Map());
            let phone :Map = mutator.get(CONTACT_METHODS.PHONE, Map());
            if (contact.get(PHONE_NUMBER) && preferred) {
              phone = contact;
            }
            if (contact.get(EMAIL) && preferred) {
              email = contact;
            }
            mutator.set(CONTACT_METHODS.EMAIL, email);
            mutator.set(CONTACT_METHODS.PHONE, phone);
          });
      }
    });
    yield put(getPersonContactInfo.success(id, contactInfo));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error(action.type, error);
    yield put(getPersonContactInfo.failure(id, error));
  }
  finally {
    yield put(getPersonContactInfo.finally(id));
  }
  return workerResponse;
}

function* getPersonContactInfoWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PERSON_CONTACT_INFO, getPersonContactInfoWorker);
}

export {
  addPersonAddressWatcher,
  addPersonAddressWorker,
  addPersonEmailWatcher,
  addPersonEmailWorker,
  addPersonPhoneWatcher,
  addPersonPhoneWorker,
  editPersonAddressWatcher,
  editPersonAddressWorker,
  editPersonEmailWatcher,
  editPersonEmailWorker,
  editPersonPhoneWatcher,
  editPersonPhoneWorker,
  getPersonAddressWatcher,
  getPersonAddressWorker,
  getPersonContactInfoWatcher,
  getPersonContactInfoWorker,
};
