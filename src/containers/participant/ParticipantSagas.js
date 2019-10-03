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
  SearchApiSagas,
} from 'lattice-sagas';
import { Types } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';
import type { FQN } from 'lattice';

import Logger from '../../utils/Logger';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import {
  ADD_INFRACTION,
  ADD_NEW_DIVERSION_PLAN_STATUS,
  ADD_NEW_PARTICIPANT_CONTACTS,
  ADD_ORIENTATION_DATE,
  ADD_WORKSITE_PLAN,
  CHECK_IN_FOR_APPOINTMENT,
  CREATE_WORK_APPOINTMENTS,
  DELETE_APPOINTMENT,
  EDIT_CASE_AND_HOURS,
  EDIT_CHECK_IN_DATE,
  EDIT_PARTICIPANT_CONTACTS,
  EDIT_PERSON_DETAILS,
  EDIT_PERSON_NOTES,
  EDIT_PLAN_NOTES,
  EDIT_SENTENCE_DATE,
  EDIT_WORKSITE_PLAN,
  GET_ALL_PARTICIPANT_INFO,
  GET_APPOINTMENT_CHECK_INS,
  GET_CASE_INFO,
  GET_CONTACT_INFO,
  GET_ENROLLMENT_STATUS,
  GET_INFRACTION_TYPES,
  GET_PARTICIPANT,
  GET_PARTICIPANT_ADDRESS,
  GET_PARTICIPANT_INFRACTIONS,
  GET_PROGRAM_OUTCOME,
  GET_WORKSITE_BY_WORKSITE_PLAN,
  GET_WORKSITE_PLANS,
  GET_WORKSITE_PLAN_STATUSES,
  GET_WORK_APPOINTMENTS,
  MARK_DIVERSION_PLAN_AS_COMPLETE,
  UPDATE_HOURS_WORKED,
  addInfraction,
  addNewDiversionPlanStatus,
  addNewParticipantContacts,
  addOrientationDate,
  addWorksitePlan,
  checkInForAppointment,
  createWorkAppointments,
  deleteAppointment,
  editCaseAndHours,
  editCheckInDate,
  editParticipantContacts,
  editPersonDetails,
  editPersonNotes,
  editPlanNotes,
  editSentenceDate,
  editWorksitePlan,
  getAllParticipantInfo,
  getAppointmentCheckIns,
  getCaseInfo,
  getContactInfo,
  getEnrollmentStatus,
  getInfractionTypes,
  getParticipant,
  getParticipantAddress,
  getParticipantInfractions,
  getProgramOutcome,
  getWorkAppointments,
  getWorksiteByWorksitePlan,
  getWorksitePlanStatuses,
  getWorksitePlans,
  markDiversionPlanAsComplete,
  updateHoursWorked,
} from './ParticipantActions';
import { deleteEntities, submitDataGraph, submitPartialReplace } from '../../core/sagas/data/DataActions';
import {
  deleteEntitiesWorker,
  submitDataGraphWorker,
  submitPartialReplaceWorker
} from '../../core/sagas/data/DataSagas';
import { getWorksites } from '../worksites/WorksitesActions';
import { getWorksitesWorker } from '../worksites/WorksitesSagas';
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
import { isDefined } from '../../utils/LangUtils';
import { STATE, WORKSITES } from '../../utils/constants/ReduxStateConsts';
import {
  APP_TYPE_FQNS,
  CONTACT_INFO_FQNS,
  ENROLLMENT_STATUS_FQNS,
  ENTITY_KEY_ID,
  INFRACTION_EVENT_FQNS,
  INFRACTION_FQNS,
  WORKSITE_PLAN_FQNS,
} from '../../core/edm/constants/FullyQualifiedNames';
import { INFRACTIONS_CONSTS } from '../../core/edm/constants/DataModelConsts';

const { UpdateTypes } = Types;
const { getEntityData, getEntitySetData, updateEntityData } = DataApiActions;
const { getEntityDataWorker, getEntitySetDataWorker, updateEntityDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const {
  ADDRESS,
  ADDRESSES,
  APPOINTMENT,
  BASED_ON,
  CHECK_INS,
  CHECK_IN_DETAILS,
  CONTACT_INFORMATION,
  DIVERSION_PLAN,
  ENROLLMENT_STATUS,
  FULFILLS,
  INFRACTION_EVENT,
  INFRACTIONS,
  MANUAL_PRETRIAL_COURT_CASES,
  PEOPLE,
  PROGRAM_OUTCOME,
  REGISTERED_FOR,
  RESULTS_IN,
  WORKSITE,
  WORKSITE_PLAN,
} = APP_TYPE_FQNS;
const {
  EMAIL,
  PHONE_NUMBER,
  PREFERRED,
} = CONTACT_INFO_FQNS;
const { EFFECTIVE_DATE, STATUS } = ENROLLMENT_STATUS_FQNS;
const { CATEGORY } = INFRACTION_FQNS;
const { TYPE } = INFRACTION_EVENT_FQNS;
const { HOURS_WORKED } = WORKSITE_PLAN_FQNS;

const getAppFromState = state => state.get(STATE.APP, Map());
const getEdmFromState = state => state.get(STATE.EDM, Map());
const getWorksitesListFromState = state => state.getIn([STATE.WORKSITES, WORKSITES.WORKSITES_LIST], List());

const LOG = new Logger('ParticipantSagas');
/*
 *
 * ParticipantActions.addInfraction()
 *
 */

function* addInfractionWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};

  try {
    yield put(addInfraction.request(id, value));

    response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) {
      throw response.error;
    }
    const { data } :Object = response;
    const { entityKeyIds } :Object = data;
    const app = yield select(getAppFromState);
    const infractionEventESID = getEntitySetIdFromApp(app, INFRACTION_EVENT);
    const infractionEventEKID = entityKeyIds[infractionEventESID][0];

    const worksitePlanESID = getEntitySetIdFromApp(app, WORKSITE_PLAN);
    const registeredForESID = getEntitySetIdFromApp(app, REGISTERED_FOR);
    const resultsInESID = getEntitySetIdFromApp(app, RESULTS_IN);
    const enrollmentStatusESID = getEntitySetIdFromApp(app, ENROLLMENT_STATUS);
    const infractionESID = getEntitySetIdFromApp(app, INFRACTIONS);
    const edm = yield select(getEdmFromState);

    yield put(addInfraction.success(id, {
      edm,
      enrollmentStatusESID,
      infractionESID,
      infractionEventEKID,
      infractionEventESID,
      resultsInESID,
      registeredForESID,
      worksitePlanESID
    }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in addInfractionWorker()', error);
    yield put(addInfraction.failure(id, error));
  }
  finally {
    yield put(addInfraction.finally(id));
  }
}

function* addInfractionWatcher() :Generator<*, *, *> {

  yield takeEvery(ADD_INFRACTION, addInfractionWorker);
}

/*
 *
 * ParticipantActions.addNewDiversionPlanStatus()
 *
 */

function* addNewDiversionPlanStatusWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};

  try {
    yield put(addNewDiversionPlanStatus.request(id, value));

    response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) {
      throw response.error;
    }
    const { data } :Object = response;
    const { entityKeyIds } :Object = data;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const enrollmentStatusESID = getEntitySetIdFromApp(app, ENROLLMENT_STATUS);
    const programOutcomeESID = getEntitySetIdFromApp(app, PROGRAM_OUTCOME);
    const enrollmentStatusEKID = entityKeyIds[enrollmentStatusESID][0];
    const programOutcomeEKID = entityKeyIds[programOutcomeESID] ? entityKeyIds[programOutcomeESID][0] : '';

    yield put(addNewDiversionPlanStatus.success(id, {
      edm,
      enrollmentStatusEKID,
      enrollmentStatusESID,
      programOutcomeEKID,
      programOutcomeESID,
    }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in addNewDiversionPlanStatusWorker()', error);
    yield put(addNewDiversionPlanStatus.failure(id, error));
  }
  finally {
    yield put(addNewDiversionPlanStatus.finally(id));
  }
}

function* addNewDiversionPlanStatusWatcher() :Generator<*, *, *> {

  yield takeEvery(ADD_NEW_DIVERSION_PLAN_STATUS, addNewDiversionPlanStatusWorker);
}

/*
 *
 * ParticipantActions.addOrientationDate()
 *
 */

function* addOrientationDateWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};

  try {
    yield put(addOrientationDate.request(id, value));

    response = yield call(submitPartialReplaceWorker, submitPartialReplace(value));
    if (response.error) {
      throw response.error;
    }
    const app = yield select(getAppFromState);
    const diversionPlanESID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
    const edm = yield select(getEdmFromState);

    yield put(addOrientationDate.success(id, {
      diversionPlanESID,
      edm,
    }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in addOrientationDateWorker()', error);
    yield put(addOrientationDate.failure(id, error));
  }
  finally {
    yield put(addOrientationDate.finally(id));
  }
}

function* addOrientationDateWatcher() :Generator<*, *, *> {

  yield takeEvery(ADD_ORIENTATION_DATE, addOrientationDateWorker);
}

/*
 *
 * ParticipantActions.editCaseAndHours()
 *
 */

function* editCaseAndHoursWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;

  try {
    yield put(editCaseAndHours.request(id, value));

    const response = yield call(submitPartialReplaceWorker, submitPartialReplace(value));
    if (response.error) {
      throw response.error;
    }
    const app = yield select(getAppFromState);
    const caseESID = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
    const diversionPlanESID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
    const edm = yield select(getEdmFromState);

    yield put(editCaseAndHours.success(id, {
      caseESID,
      diversionPlanESID,
      edm,
    }));
  }
  catch (error) {
    LOG.error('caught exception in editCaseAndHoursWorker()', error);
    yield put(editCaseAndHours.failure(id, error));
  }
  finally {
    yield put(editCaseAndHours.finally(id));
  }
}

function* editCaseAndHoursWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_CASE_AND_HOURS, editCaseAndHoursWorker);
}

/*
 *
 * ParticipantActions.editPlanNotes()
 *
 */

function* editPlanNotesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};

  try {
    yield put(editPlanNotes.request(id, value));

    response = yield call(submitPartialReplaceWorker, submitPartialReplace(value));
    if (response.error) {
      throw response.error;
    }
    const app = yield select(getAppFromState);
    const diversionPlanESID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
    const edm = yield select(getEdmFromState);

    yield put(editPlanNotes.success(id, { diversionPlanESID, edm }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in editPlanNotesWorker()', error);
    yield put(editPlanNotes.failure(id, error));
  }
  finally {
    yield put(editPlanNotes.finally(id));
  }
}

function* editPlanNotesWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_PLAN_NOTES, editPlanNotesWorker);
}

/*
 *
 * ParticipantActions.editPersonNotes()
 *
 */

function* editPersonNotesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};

  try {
    yield put(editPersonNotes.request(id, value));

    response = yield call(submitPartialReplaceWorker, submitPartialReplace(value));
    if (response.error) {
      throw response.error;
    }
    const app = yield select(getAppFromState);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
    const edm = yield select(getEdmFromState);

    yield put(editPersonNotes.success(id, { edm, peopleESID }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in editPersonNotesWorker()', error);
    yield put(editPersonNotes.failure(id, error));
  }
  finally {
    yield put(editPersonNotes.finally(id));
  }
}

function* editPersonNotesWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_PERSON_NOTES, editPersonNotesWorker);
}

/*
 *
 * ParticipantActions.addNewParticipantContacts()
 *
 */

function* addNewParticipantContactsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};

  try {
    yield put(addNewParticipantContacts.request(id, value));

    response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) {
      throw response.error;
    }

    const { entityData } = value;
    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const contactInfoESID = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
    const addressESID = getEntitySetIdFromApp(app, ADDRESS);

    const storedAddressData = fromJS(entityData[addressESID][0]);
    let newAddress :Map = Map();
    storedAddressData.forEach((addressValue, propertyTypeId) => {
      const propertyTypeFqn :FQN = getPropertyFqnFromEdm(edm, propertyTypeId);
      newAddress = newAddress.set(propertyTypeFqn, addressValue);
    });

    const storedContactData = fromJS(entityData[contactInfoESID]);

    let newPhone :Map = Map();
    let newEmail :Map = Map();
    storedContactData.forEach((contactEntity :Map) => {
      contactEntity.forEach((entityValue, propertyTypeId) => {
        if (propertyTypeId === getPropertyTypeIdFromEdm(edm, PHONE_NUMBER)) {
          newPhone = newPhone.set(PHONE_NUMBER, entityValue);
        }
        else if (propertyTypeId === getPropertyTypeIdFromEdm(edm, EMAIL)) {
          newEmail = newEmail.set(EMAIL, entityValue);
        }
        else {
          return false;
        }
        return true;
      });
    });
    if (!newPhone.isEmpty()) newPhone = newPhone.set(PREFERRED, true);
    if (!newEmail.isEmpty()) newEmail = newEmail.set(PREFERRED, true);

    yield put(addNewParticipantContacts.success(id, { newAddress, newPhone, newEmail }));
  }
  catch (error) {
    LOG.error('caught exception in addNewParticipantContactsWorker()', error);
    yield put(addNewParticipantContacts.failure(id, error));
  }
  finally {
    yield put(addNewParticipantContacts.finally(id));
  }
}

function* addNewParticipantContactsWatcher() :Generator<*, *, *> {

  yield takeEvery(ADD_NEW_PARTICIPANT_CONTACTS, addNewParticipantContactsWorker);
}

/*
 *
 * ParticipantActions.editPersonDetails()
 *
 */

function* editPersonDetailsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};

  try {
    yield put(editPersonDetails.request(id, value));

    response = yield call(submitPartialReplaceWorker, submitPartialReplace(value));
    if (response.error) {
      throw response.error;
    }
    const { entityData } = value;
    const app = yield select(getAppFromState);
    const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);
    const edm = yield select(getEdmFromState);

    const personEKID :UUID = Object.keys(entityData[peopleESID])[0];
    const storedPersonData :Map = fromJS(entityData[peopleESID][personEKID]);
    let newPersonData :Map = Map();
    storedPersonData.forEach((personValue, propertyTypeId) => {
      const propertyTypeFqn = getPropertyFqnFromEdm(edm, propertyTypeId);
      newPersonData = newPersonData.set(propertyTypeFqn, personValue);
    });
    yield put(editPersonDetails.success(id, { newPersonData }));
  }
  catch (error) {
    LOG.error('caught exception in editPersonDetailsWorker()', error);
    yield put(editPersonDetails.failure(id, error));
  }
  finally {
    yield put(editPersonDetails.finally(id));
  }
}

function* editPersonDetailsWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_PERSON_DETAILS, editPersonDetailsWorker);
}

/*
 *
 * ParticipantActions.editParticipantContacts()
 *
 */

function* editParticipantContactsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};

  try {
    yield put(editParticipantContacts.request(id, value));

    response = yield call(submitPartialReplaceWorker, submitPartialReplace(value));
    if (response.error) {
      throw response.error;
    }
    const { entityData } = value;
    const app = yield select(getAppFromState);
    const contactInfoESID :UUID = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
    const addressESID :UUID = getEntitySetIdFromApp(app, ADDRESS);
    const edm = yield select(getEdmFromState);

    const addressEKID :UUID = entityData[addressESID] ? Object.keys(entityData[addressESID])[0] : '';
    let newAddressData :Map = Map();
    if (addressEKID) {
      const storedAddressData :Map = fromJS(entityData[addressESID][addressEKID]);
      storedAddressData.forEach((personValue, propertyTypeId) => {
        const propertyTypeFqn = getPropertyFqnFromEdm(edm, propertyTypeId);
        newAddressData = newAddressData.set(propertyTypeFqn, personValue);
      });
    }

    const storedContactData :Map = entityData[contactInfoESID] ? fromJS(entityData[contactInfoESID]) : Map();
    let newPhoneData :Map = Map();
    let newEmailData :Map = Map();
    if (!storedContactData.isEmpty()) {
      storedContactData.forEach((valueMap :Map, ekid :UUID) => {
        valueMap.forEach((entityValue, propertyTypeId) => {
          if (propertyTypeId === getPropertyTypeIdFromEdm(edm, PHONE_NUMBER)) {
            newPhoneData = newPhoneData.set(PHONE_NUMBER, entityValue);
            newPhoneData = newPhoneData.set(ENTITY_KEY_ID, ekid);
          }
          else if (propertyTypeId === getPropertyTypeIdFromEdm(edm, EMAIL)) {
            newEmailData = newEmailData.set(EMAIL, entityValue);
            newEmailData = newEmailData.set(ENTITY_KEY_ID, ekid);
          }
          else {
            return false;
          }
          return true;
        });
      });
    }

    yield put(editParticipantContacts.success(id, { newAddressData, newEmailData, newPhoneData }));
  }
  catch (error) {
    LOG.error('caught exception in editParticipantContactsWorker()', error);
    yield put(editParticipantContacts.failure(id, error));
  }
  finally {
    yield put(editParticipantContacts.finally(id));
  }
}

function* editParticipantContactsWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_PARTICIPANT_CONTACTS, editParticipantContactsWorker);
}

/*
 *
 * ParticipantActions.editSentenceDate()
 *
 */

function* editSentenceDateWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};

  try {
    yield put(editSentenceDate.request(id, value));

    response = yield call(submitPartialReplaceWorker, submitPartialReplace(value));
    if (response.error) {
      throw response.error;
    }
    const app = yield select(getAppFromState);
    const diversionPlanESID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
    const edm = yield select(getEdmFromState);

    yield put(editSentenceDate.success(id, {
      diversionPlanESID,
      edm,
    }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in editSentenceDateWorker()', error);
    yield put(editSentenceDate.failure(id, error));
  }
  finally {
    yield put(editSentenceDate.finally(id));
  }
}

function* editSentenceDateWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_SENTENCE_DATE, editSentenceDateWorker);
}

/*
 *
 * ParticipantActions.editCheckInDate()
 *
 */

function* editCheckInDateWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};

  try {
    yield put(editCheckInDate.request(id, value));

    response = yield call(submitPartialReplaceWorker, submitPartialReplace(value));
    if (response.error) {
      throw response.error;
    }
    const app = yield select(getAppFromState);
    const diversionPlanESID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
    const edm = yield select(getEdmFromState);

    yield put(editCheckInDate.success(id, {
      diversionPlanESID,
      edm,
    }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in editCheckInDateWorker()', error);
    yield put(editCheckInDate.failure(id, error));
  }
  finally {
    yield put(editCheckInDate.finally(id));
  }
}

function* editCheckInDateWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_CHECK_IN_DATE, editCheckInDateWorker);
}

function* editWorksitePlanWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};
  let worksitePlanStatusEKID :string[] = [''];

  try {
    yield put(editWorksitePlan.request(id, value));

    const {
      statusEntityData,
      statusAssociationData,
      worksitePlanEKID,
      worksitePlanDataToEdit
    } = value;

    if (Object.keys(statusEntityData).length) {

      response = yield call(submitDataGraphWorker, submitDataGraph({
        entityData: statusEntityData,
        associationEntityData: statusAssociationData
      }));
      if (response.error) {
        throw response.error;
      }
      const { data } :Object = response;
      const { entityKeyIds } :Object = data;
      worksitePlanStatusEKID = Object.values(entityKeyIds)[0];
    }

    const app = yield select(getAppFromState);
    const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);

    if (Object.keys(worksitePlanDataToEdit[worksitePlanESID][worksitePlanEKID]).length) {

      response = yield call(submitPartialReplaceWorker, submitPartialReplace({ entityData: worksitePlanDataToEdit }));
      if (response.error) {
        throw response.error;
      }
    }

    const enrollmentStatusESID :UUID = getEntitySetIdFromApp(app, ENROLLMENT_STATUS);
    const edm = yield select(getEdmFromState);

    yield put(editWorksitePlan.success(id, {
      edm,
      enrollmentStatusESID,
      worksitePlanEKID,
      worksitePlanESID,
      worksitePlanStatusEKID,
    }));
  }
  catch (error) {
    LOG.error('caught exception in editWorksitePlanWorker()', error);
    yield put(editWorksitePlan.failure(id, error));
  }
  finally {
    yield put(editWorksitePlan.finally(id));
  }
}

function* editWorksitePlanWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_WORKSITE_PLAN, editWorksitePlanWorker);
}

/*
 *
 * ParticipantActions.addWorksitePlan()
 *
 */

function* addWorksitePlanWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};

  try {
    yield put(addWorksitePlan.request(id, value));

    response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) {
      throw response.error;
    }
    const { data } :Object = response;
    const { entityKeyIds } :Object = data;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const worksitePlanESID = Object.keys(entityKeyIds)[0];
    const worksitePlanEKID = Object.values(entityKeyIds)[0];
    const basedOnESID = getEntitySetIdFromApp(app, BASED_ON);
    const worksitesList = yield select(getWorksitesListFromState);

    yield put(addWorksitePlan.success(id, {
      basedOnESID,
      edm,
      worksitePlanEKID,
      worksitePlanESID,
      worksitesList
    }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in addWorksitePlanWorker()', error);
    yield put(addWorksitePlan.failure(id, error));
  }
  finally {
    yield put(addWorksitePlan.finally(id));
  }
}

function* addWorksitePlanWatcher() :Generator<*, *, *> {

  yield takeEvery(ADD_WORKSITE_PLAN, addWorksitePlanWorker);
}

/*
 *
 * ParticipantActions.markDiversionPlanAsComplete()
 *
 */

function* markDiversionPlanAsCompleteWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};

  try {
    yield put(markDiversionPlanAsComplete.request(id));

    response = yield call(submitPartialReplaceWorker, submitPartialReplace(value));
    if (response.error) {
      throw response.error;
    }

    yield put(markDiversionPlanAsComplete.success(id));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in markDiversionPlanAsCompleteWorker()', error);
    yield put(markDiversionPlanAsComplete.failure(id, error));
  }
  finally {
    yield put(markDiversionPlanAsComplete.finally(id));
  }
}

function* markDiversionPlanAsCompleteWatcher() :Generator<*, *, *> {

  yield takeEvery(MARK_DIVERSION_PLAN_AS_COMPLETE, markDiversionPlanAsCompleteWorker);
}

/*
 *
 * ParticipantActions.updateHoursWorked()
 *
 */

function* updateHoursWorkedWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let newWorksitePlan :Map = Map();

  try {
    yield put(updateHoursWorked.request(id, value));

    const { appointmentEKID, numberHoursWorked } = value;

    const app = yield select(getAppFromState);
    const appointmentESID :UUID = getEntitySetIdFromApp(app, APPOINTMENT);
    const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);

    const searchFilter :{} = {
      entityKeyIds: [appointmentEKID],
      destinationEntitySetIds: [worksitePlanESID],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: appointmentESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    if (response.data[appointmentEKID]) {

      const worksitePlan :Map = getNeighborDetails(fromJS(response.data[appointmentEKID][0]));
      const edm = yield select(getEdmFromState);
      const hoursWorkedPTID :UUID = getPropertyTypeIdFromEdm(edm, HOURS_WORKED);
      const worksitePlanEKID :UUID = getEntityKeyId(worksitePlan);
      const { [HOURS_WORKED]: hoursWorkedOld } = getEntityProperties(worksitePlan, [HOURS_WORKED]);
      const hoursWorkedToDate = hoursWorkedOld + numberHoursWorked;
      const worksitePlanDataToUpdate :{} = {
        [worksitePlanEKID]: {
          [hoursWorkedPTID]: [hoursWorkedToDate]
        }
      };

      response = yield call(updateEntityDataWorker, updateEntityData({
        entitySetId: worksitePlanESID,
        entities: worksitePlanDataToUpdate,
        updateType: UpdateTypes.PartialReplace,
      }));
      if (response.error) {
        throw response.error;
      }

      newWorksitePlan = worksitePlan;
      newWorksitePlan = newWorksitePlan.setIn([HOURS_WORKED, 0], hoursWorkedToDate);
    }

    yield put(updateHoursWorked.success(id, newWorksitePlan));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in updateHoursWorkedWorker()', error);
    yield put(updateHoursWorked.failure(id, error));
  }
  finally {
    yield put(updateHoursWorked.finally(id));
  }
  return workerResponse;
}

function* updateHoursWorkedWatcher() :Generator<*, *, *> {

  yield takeEvery(UPDATE_HOURS_WORKED, updateHoursWorkedWorker);
}

/*
 *
 * ParticipantActions.checkInForAppointment()
 *
 */

function* checkInForAppointmentWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};

  try {
    yield put(checkInForAppointment.request(id, value));

    response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) {
      throw response.error;
    }
    const { data } = response;
    const { entityKeyIds } = data;
    const app = yield select(getAppFromState);
    const checkInESID :UUID = getEntitySetIdFromApp(app, CHECK_INS);
    const checkInEKID :UUID = entityKeyIds[checkInESID][0];

    if (response.data) {

      const edm = yield select(getEdmFromState);
      const checkInDetailsESID :UUID = getEntitySetIdFromApp(app, CHECK_IN_DETAILS);
      const hoursWorkedPTID :UUID = getPropertyTypeIdFromEdm(edm, HOURS_WORKED);
      const { entityData } = value;
      const numberHoursWorked :number = entityData[checkInDetailsESID][0][hoursWorkedPTID][0];

      const { associationEntityData } = value;
      const fulfillsESID :UUID = getEntitySetIdFromApp(app, FULFILLS);
      const appointmentEKID :UUID = associationEntityData[fulfillsESID][0].dstEntityKeyId;

      response = yield call(updateHoursWorkedWorker, updateHoursWorked({ appointmentEKID, numberHoursWorked }));
      if (response.error) {
        throw response.error;
      }

      response = {
        appointmentEKID,
        checkInDetailsESID,
        checkInEKID,
        checkInESID,
        edm,
      };
    }

    yield put(checkInForAppointment.success(id, response));
  }
  catch (error) {
    LOG.error('caught exception in checkInForAppointmentWorker()', error);
    yield put(checkInForAppointment.failure(id, error));
  }
  finally {
    yield put(checkInForAppointment.finally(id));
  }
}

function* checkInForAppointmentWatcher() :Generator<*, *, *> {

  yield takeEvery(CHECK_IN_FOR_APPOINTMENT, checkInForAppointmentWorker);
}

/*
 *
 * ParticipantActions.createWorkAppointments()
 *
 */

function* createWorkAppointmentsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};

  try {
    yield put(createWorkAppointments.request(id, value));

    response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) {
      throw response.error;
    }
    const { data } :Object = response;
    const { entityKeyIds } :Object = data;

    const app = yield select(getAppFromState);
    const addressesESID :UUID = getEntitySetIdFromApp(app, ADDRESSES);
    const appointmentESID :UUID = getEntitySetIdFromApp(app, APPOINTMENT);
    const appointmentEKIDs :UUID[] = entityKeyIds[appointmentESID];
    const edm = yield select(getEdmFromState);

    yield put(createWorkAppointments.success(id, {
      addressesESID,
      appointmentEKIDs,
      appointmentESID,
      edm,
    }));
  }
  catch (error) {
    LOG.error('caught exception in createWorkAppointmentsWorker()', error);
    yield put(createWorkAppointments.failure(id, error));
  }
  finally {
    yield put(createWorkAppointments.finally(id));
  }
}

function* createWorkAppointmentsWatcher() :Generator<*, *, *> {

  yield takeEvery(CREATE_WORK_APPOINTMENTS, createWorkAppointmentsWorker);
}

/*
 *
 * ParticipantActions.deleteAppointment()
 *
 */

function* deleteAppointmentWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;

  try {
    yield put(deleteAppointment.request(id, value));

    const response :Object = yield call(deleteEntitiesWorker, deleteEntities(value));
    if (response.error) {
      throw response.error;
    }

    yield put(deleteAppointment.success(id));
  }
  catch (error) {
    LOG.error('caught exception in deleteAppointmentWorker()', error);
    yield put(deleteAppointment.failure(id, error));
  }
  finally {
    yield put(deleteAppointment.finally(id));
  }
}

function* deleteAppointmentWatcher() :Generator<*, *, *> {

  yield takeEvery(DELETE_APPOINTMENT, deleteAppointmentWorker);
}

/*
 *
 * ParticipantsActions.getParticipant()
 *
 */

function* getParticipantWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let participant :Map = Map();

  try {
    yield put(getParticipant.request(id));
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const { personEKID } = value;
    const app = yield select(getAppFromState);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);

    response = yield call(getEntityDataWorker, getEntityData({ entitySetId: peopleESID, entityKeyId: personEKID }));
    if (response.error) {
      throw response.error;
    }
    participant = fromJS(response.data);

    yield put(getParticipant.success(id, participant));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getParticipantWorker()', error);
    yield put(getParticipant.failure(id, error));
  }
  finally {
    yield put(getParticipant.finally(id));
  }
  return workerResponse;
}

function* getParticipantWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PARTICIPANT, getParticipantWorker);
}

/*
 *
 * ParticipantsActions.getCaseInfo()
 *
 */

function* getCaseInfoWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let personCase :Map = Map();

  try {
    yield put(getCaseInfo.request(id));
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const { personEKID } = value;
    const app = yield select(getAppFromState);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
    const manualCourtCases = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);

    const searchFilter :Object = {
      entityKeyIds: [personEKID],
      destinationEntitySetIds: [manualCourtCases],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: peopleESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    if (response.data[personEKID]) {
      const caseResult :Map = fromJS(response.data[personEKID][0]);
      personCase = getNeighborDetails(caseResult);
    }

    yield put(getCaseInfo.success(id, personCase));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getCaseInfoWorker()', error);
    yield put(getCaseInfo.failure(id, error));
  }
  finally {
    yield put(getCaseInfo.finally(id));
  }
  return workerResponse;
}

function* getCaseInfoWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_CASE_INFO, getCaseInfoWorker);
}

/*
 *
 * ParticipantsActions.getContactInfo()
 *
 */

function* getContactInfoWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  const contactInfo :Object = {};

  try {
    yield put(getContactInfo.request(id));
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const { personEKID } = value;
    const app = yield select(getAppFromState);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
    const contactInfoESID = getEntitySetIdFromApp(app, CONTACT_INFORMATION);

    // two association entity types: person -> contacted via -> contact info,
    // contact info -> contact given for -> person
    const searchFilter :Object = {
      entityKeyIds: [personEKID],
      destinationEntitySetIds: [contactInfoESID],
      sourceEntitySetIds: [contactInfoESID],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: peopleESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    let email = Map();
    let phone = Map();
    if (response.data[personEKID]) {
      fromJS(response.data[personEKID])
        .map((contactInfoNeighbor :Map) => getNeighborDetails(contactInfoNeighbor))
        .forEach((contact :Map) => {
          const { [EMAIL]: emailFound, [PHONE_NUMBER]: phoneFound, [PREFERRED]: preferred } = getEntityProperties(
            contact, [EMAIL, PHONE_NUMBER, PREFERRED]
          );
          if (phoneFound && preferred) {
            phone = contact;
          }
          if (emailFound && preferred) {
            email = contact;
          }
        });
    }
    contactInfo.email = email;
    contactInfo.phone = phone;
    yield put(getContactInfo.success(id, contactInfo));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getContactInfoWorker()', error);
    yield put(getContactInfo.failure(id, error));
  }
  finally {
    yield put(getContactInfo.finally(id));
  }
  return workerResponse;
}

function* getContactInfoWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_CONTACT_INFO, getContactInfoWorker);
}

/*
 *
 * ParticipantActions.getWorksiteByWorksitePlan()
 *
 */
function* getWorksiteByWorksitePlanWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let worksitesByPlanEKID :Map = Map();

  try {
    yield put(getWorksiteByWorksitePlan.request(id));
    const { worksitePlans } = value;
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const worksitePlanEKIDs :UUID[] = [];
    worksitePlans.forEach((plan :Map) => worksitePlanEKIDs.push(getEntityKeyId(plan)));

    const app = yield select(getAppFromState);
    const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);
    const worksiteESID :UUID = getEntitySetIdFromApp(app, WORKSITE);

    const searchFilter :Object = {
      entityKeyIds: worksitePlanEKIDs,
      destinationEntitySetIds: [worksiteESID],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: worksitePlanESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }

    if (Object.keys(response.data).length > 0) {

      worksitesByPlanEKID = fromJS(response.data)
        .map((worksitesList :List) => getNeighborDetails(worksitesList.get(0)));
    }

    yield put(getWorksiteByWorksitePlan.success(id, worksitesByPlanEKID));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getWorksiteByWorksitePlanWorker()', error);
    yield put(getWorksiteByWorksitePlan.failure(id, error));
  }
  finally {
    yield put(getWorksiteByWorksitePlan.finally(id));
  }
  return workerResponse;
}

function* getWorksiteByWorksitePlanWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_WORKSITE_BY_WORKSITE_PLAN, getWorksiteByWorksitePlanWorker);
}

/*
 *
 * ParticipantActions.getAppointmentCheckIns()
 *
 */

function* getAppointmentCheckInsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};
  let checkInData :Map = Map();
  let checkInsByAppointment :Map = Map();

  try {
    yield put(getAppointmentCheckIns.request(id));
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const { workAppointmentEKIDs } = value;
    const app = yield select(getAppFromState);

    const appointmentESID :UUID = getEntitySetIdFromApp(app, APPOINTMENT);
    const checkInESID :UUID = getEntitySetIdFromApp(app, CHECK_INS);

    let searchFilter :Object = {
      entityKeyIds: workAppointmentEKIDs,
      destinationEntitySetIds: [],
      sourceEntitySetIds: [checkInESID],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: appointmentESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    if (Object.keys(response.data).length > 0) {
      checkInData = fromJS(response.data)
        .map((appointmentCheckIns :List) => appointmentCheckIns
          .map((checkIn :Map) => getNeighborDetails(checkIn)));

      const checkInEKIDs :UUID[] = [];
      checkInData
        .forEach((checkIns :List) => {
          checkIns.forEach((checkIn :Map) => {
            const checkInEKID :UUID = getEntityKeyId(checkIn);
            checkInEKIDs.push(checkInEKID);
          });
        });
      const checkInDetailsESID :UUID = getEntitySetIdFromApp(app, CHECK_IN_DETAILS);
      searchFilter = {
        entityKeyIds: checkInEKIDs,
        destinationEntitySetIds: [checkInDetailsESID],
        sourceEntitySetIds: [],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: checkInESID, filter: searchFilter })
      );
      if (response.error) {
        throw response.error;
      }
      const checkInDetailsByCheckIn :Map = fromJS(response.data)
        .map((checkInDetailsList :List) => checkInDetailsList.map((details :Map) => getNeighborDetails(details)));

      /* Store hours worked property from check-in details on check-in to save additional lookups */
      checkInData
        .forEach((checkInEntity :List, appointmentEKID :UUID) => {
          const checkInEKID :UUID = getEntityKeyId(checkInEntity.get(0));
          const checkInDetails = checkInDetailsByCheckIn.getIn([checkInEKID, 0]);

          let checkIn :Map = checkInEntity.get(0);
          if (isDefined(checkInDetails)) {
            const { [HOURS_WORKED]: hoursWorked } = getEntityProperties(checkInDetails, [HOURS_WORKED]);
            checkIn = checkIn.set(HOURS_WORKED, [hoursWorked]);
          }
          checkInsByAppointment = checkInsByAppointment.set(appointmentEKID, checkIn);
        });
    }

    yield put(getAppointmentCheckIns.success(id, checkInsByAppointment));
  }
  catch (error) {
    LOG.error('caught exception in getAppointmentCheckInsWorker()', error);
    yield put(getAppointmentCheckIns.failure(id, error));
  }
  finally {
    yield put(getAppointmentCheckIns.finally(id));
  }
}

function* getAppointmentCheckInsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_APPOINTMENT_CHECK_INS, getAppointmentCheckInsWorker);
}

/*
 *
 * ParticipantActions.getWorkAppointments()
 *
 */
function* getWorkAppointmentsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};
  let workAppointmentsByWorksitePlan :Map = Map();

  try {
    yield put(getWorkAppointments.request(id));
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const { worksitePlans } = value;
    const app = yield select(getAppFromState);
    const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);
    const appointmentESID :UUID = getEntitySetIdFromApp(app, APPOINTMENT);
    const worksitePlanEKIDs :string[] = [];
    worksitePlans.forEach((worksitePlan :Map) => {
      worksitePlanEKIDs.push(getEntityKeyId(worksitePlan));
    });

    const searchFilter :Object = {
      entityKeyIds: worksitePlanEKIDs,
      destinationEntitySetIds: [],
      sourceEntitySetIds: [appointmentESID],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: worksitePlanESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    if (Object.keys(response.data).length > 0) {
      workAppointmentsByWorksitePlan = fromJS(response.data)
        .map((appointmentsList :List) => appointmentsList.map((appt :Map) => getNeighborDetails(appt)));

      const workAppointmentEKIDs :UUID[] = [];
      workAppointmentsByWorksitePlan
        .forEach((appointmentsList :List) => {
          appointmentsList.forEach((appt :Map) => {
            const appointmentEKID :UUID = getEntityKeyId(appt);
            workAppointmentEKIDs.push(appointmentEKID);
          });
        });
      yield call(getAppointmentCheckInsWorker, getAppointmentCheckIns({ workAppointmentEKIDs }));
    }

    yield put(getWorkAppointments.success(id, workAppointmentsByWorksitePlan));
  }
  catch (error) {
    LOG.error('caught exception in getWorkAppointmentsWorker()', error);
    yield put(getWorkAppointments.failure(id, error));
  }
  finally {
    yield put(getWorkAppointments.finally(id));
  }
}

function* getWorkAppointmentsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_WORK_APPOINTMENTS, getWorkAppointmentsWorker);
}

/*
 *
 * ParticipantActions.getWorksitePlanStatuses()
 *
 */
function* getWorksitePlanStatusesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};
  let worksitePlanStatuses :List = List();

  try {
    yield put(getWorksitePlanStatuses.request(id));
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const { worksitePlans } = value;
    const app = yield select(getAppFromState);
    const enrollmentStatusESID :UUID = getEntitySetIdFromApp(app, ENROLLMENT_STATUS);
    const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);
    const worksitePlanEKIDs :string[] = [];
    worksitePlans.forEach((worksitePlan :Map) => {
      worksitePlanEKIDs.push(getEntityKeyId(worksitePlan));
    });

    const params :Object = {
      entitySetId: worksitePlanESID,
      filter: {
        entityKeyIds: worksitePlanEKIDs,
        destinationEntitySetIds: [enrollmentStatusESID],
        sourceEntitySetIds: [],
      }
    };
    response = yield call(searchEntityNeighborsWithFilterWorker, searchEntityNeighborsWithFilter(params));
    if (response.error) {
      throw response.error;
    }
    worksitePlanStatuses = fromJS(response.data);

    if (!worksitePlanStatuses.isEmpty()) {
      worksitePlanStatuses = worksitePlanStatuses
        .map((statusList :List) => statusList
          .map((status :Map) => getNeighborDetails(status)));

      // get most recent status for each work site plan:
      worksitePlanStatuses = worksitePlanStatuses
        .map((statusList :List) => {
          const sortedStatusList :List = sortEntitiesByDateProperty(statusList, EFFECTIVE_DATE);
          return sortedStatusList.last();
        });
    }

    yield put(getWorksitePlanStatuses.success(id, worksitePlanStatuses));
  }
  catch (error) {
    LOG.error('caught exception in getWorksitePlanStatusesWorker()', error);
    yield put(getWorksitePlanStatuses.failure(id, error));
  }
  finally {
    yield put(getWorksitePlanStatuses.finally(id));
  }
}

function* getWorksitePlanStatusesWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_WORKSITE_PLAN_STATUSES, getWorksitePlanStatusesWorker);
}

/*
 *
 * ParticipantActions.getWorksitePlans()
 *
 */
function* getWorksitePlansWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let worksitePlans :List = List();

  try {
    yield put(getWorksitePlans.request(id));
    const { diversionPlan } = value;
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const app = yield select(getAppFromState);
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
    const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);
    const diversionPlanEKID :UUID = getEntityKeyId(diversionPlan);

    const searchFilter :Object = {
      entityKeyIds: [diversionPlanEKID],
      destinationEntitySetIds: [],
      sourceEntitySetIds: [worksitePlanESID],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }

    if (response.data[diversionPlanEKID]) {
      worksitePlans = fromJS(response.data[diversionPlanEKID])
        .map((worksitePlan :Map) => getNeighborDetails(worksitePlan));

      yield all([
        call(getWorksiteByWorksitePlanWorker, getWorksiteByWorksitePlan({ worksitePlans })),
        call(getWorkAppointmentsWorker, getWorkAppointments({ worksitePlans })),
        call(getWorksitePlanStatusesWorker, getWorksitePlanStatuses({ worksitePlans })),
      ]);
    }

    yield put(getWorksitePlans.success(id, worksitePlans));
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
 * ParticipantsActions.getProgramOutcome()
 *
 */

function* getProgramOutcomeWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};
  let programOutcome :Map = Map();

  try {
    yield put(getProgramOutcome.request(id));
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const { diversionPlan } = value;
    const app = yield select(getAppFromState);
    const diversionPlanEKID :UUID = getEntityKeyId(diversionPlan);
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
    const programOutcomeESID :UUID = getEntitySetIdFromApp(app, PROGRAM_OUTCOME);

    const searchFilter :Object = {
      entityKeyIds: [diversionPlanEKID],
      destinationEntitySetIds: [programOutcomeESID],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    if (Object.keys(response.data).length > 0) {
      programOutcome = getNeighborDetails(fromJS(response.data[diversionPlanEKID][0]));
    }

    yield put(getProgramOutcome.success(id, programOutcome));
  }
  catch (error) {
    LOG.error('caught exception in getProgramOutcomeWorker()', error);
    yield put(getProgramOutcome.failure(id, error));
  }
  finally {
    yield put(getProgramOutcome.finally(id));
  }
}

function* getProgramOutcomeWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PROGRAM_OUTCOME, getProgramOutcomeWorker);
}

/*
 *
 * ParticipantsActions.getEnrollmentStatus()
 *
 */

function* getEnrollmentStatusWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let enrollmentStatus :Map = Map();
  let diversionPlan :Map = Map();

  try {
    yield put(getEnrollmentStatus.request(id));
    const { personEKID } = value;
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }

    /*
     * 1. Find all diversion plans for participant.
     */
    const app = yield select(getAppFromState);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
    const diversionPlanESID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
    const enrollmentStatusESID = getEntitySetIdFromApp(app, ENROLLMENT_STATUS);

    const diversionPlanFilter :Object = {
      entityKeyIds: [personEKID],
      destinationEntitySetIds: [diversionPlanESID],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: peopleESID, filter: diversionPlanFilter })
    );
    if (response.error) {
      throw response.error;
    }
    const diversionPlans :Map = fromJS(response.data)
      .map((planList :List) => planList.map((plan :Map) => getNeighborDetails(plan)));

    if (diversionPlans.count() > 0) {

      /*
       * 2. Find all enrollment statuses for each diversion plan found.
       */
      const diversionPlanEKIDs :UUID[] = [];
      diversionPlans.get(personEKID).forEach((plan :Map) => {
        diversionPlanEKIDs.push(getEntityKeyId(plan));
      });

      const enrollmentFilter :Object = {
        entityKeyIds: diversionPlanEKIDs,
        destinationEntitySetIds: [],
        sourceEntitySetIds: [enrollmentStatusESID],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter: enrollmentFilter })
      );
      if (response.error) {
        throw response.error;
      }
      const enrollmentStatusesByDiversionPlan :Map = fromJS(response.data)
        .map((enrollmentList :List) => enrollmentList.map((enrollment :Map) => getNeighborDetails(enrollment)));

      /*
       * 3. Find most recent enrollment status, if any exist.
       */
      if (enrollmentStatusesByDiversionPlan.count() > 0) {

        const mostRecentEnrollmentStatusesByDiversionPlan :Map = enrollmentStatusesByDiversionPlan
          .map((statusList :List) => {
            const sortedStatusList :List = sortEntitiesByDateProperty(statusList, EFFECTIVE_DATE);
            return sortedStatusList.last();
          });
        enrollmentStatus = sortEntitiesByDateProperty(
          mostRecentEnrollmentStatusesByDiversionPlan, EFFECTIVE_DATE
        ).last();
        /*
         * 4. Additionally, return relevant diversion plan.
         */
        const diversionPlanEKID :UUID = mostRecentEnrollmentStatusesByDiversionPlan
          .findKey((status :Map) => getEntityKeyId(status) === getEntityKeyId(enrollmentStatus));
        diversionPlan = diversionPlans.get(personEKID).find((plan :Map) => getEntityKeyId(plan) === diversionPlanEKID);
      }

      // some integrated people won't have enrollment statuses but will have a diversion plan:
      if (diversionPlan.isEmpty()) diversionPlan = diversionPlans.getIn([personEKID, 0]);

      /* Call getWorksitePlans() to find all worksite plans for current diversion plan */
      yield all([
        call(getWorksitePlansWorker, getWorksitePlans({ diversionPlan })),
        call(getProgramOutcomeWorker, getProgramOutcome({ diversionPlan })),
      ]);
    }

    yield put(getEnrollmentStatus.success(id, { diversionPlan, enrollmentStatus }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getEnrollmentStatusWorker()', error);
    yield put(getEnrollmentStatus.failure(id, error));
  }
  finally {
    yield put(getEnrollmentStatus.finally(id));
  }
  return workerResponse;
}

function* getEnrollmentStatusWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_ENROLLMENT_STATUS, getEnrollmentStatusWorker);
}

/*
 *
 * ParticipantsActions.getParticipantAddress()
 *
 */

function* getParticipantAddressWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let address :Map = Map();

  try {
    yield put(getParticipantAddress.request(id));
    const { personEKID } = value;
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const app = yield select(getAppFromState);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
    const addressESID = getEntitySetIdFromApp(app, ADDRESS);

    const searchFilter :Object = {
      entityKeyIds: [personEKID],
      destinationEntitySetIds: [addressESID],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: peopleESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    // TODO: handle case of having multiple addresses for a person
    if (response.data[personEKID]) {
      const addressNeighbor = fromJS(response.data[personEKID][0]);
      address = getNeighborDetails(addressNeighbor);
    }

    yield put(getParticipantAddress.success(id, address));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getParticipantAddressWorker()', error);
    yield put(getParticipantAddress.failure(id, error));
  }
  finally {
    yield put(getParticipantAddress.finally(id));
  }
  return workerResponse;
}

function* getParticipantAddressWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PARTICIPANT_ADDRESS, getParticipantAddressWorker);
}

/*
 *
 * ParticipantsActions.getInfractionTypes()
 *
 */

function* getInfractionTypesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let infractionTypes :List = List();

  try {
    yield put(getInfractionTypes.request(id, value));

    const app = yield select(getAppFromState);
    const infractionsESID :UUID = getEntitySetIdFromApp(app, INFRACTIONS);

    response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: infractionsESID }));
    if (response.error) {
      throw response.error;
    }
    infractionTypes = fromJS(response.data);
    yield put(getInfractionTypes.success(id, infractionTypes));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getInfractionTypesWorker()', error);
    yield put(getInfractionTypes.failure(id, error));
  }
  finally {
    yield put(getInfractionTypes.finally(id));
  }
  return workerResponse;
}

function* getInfractionTypesWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_INFRACTION_TYPES, getInfractionTypesWorker);
}

/*
 *
 * ParticipantsActions.getParticipantInfractions()
 *
 */

function* getParticipantInfractionsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let infractionsMap :Map = Map().withMutations((map :Map) => {
    map.set(INFRACTIONS_CONSTS.VIOLATION, List());
    map.set(INFRACTIONS_CONSTS.WARNING, List());
  });
  let infractionsList :List = List();
  let infractionInfoMap :Map = Map();

  try {
    yield put(getParticipantInfractions.request(id));
    const { personEKID } = value;
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const app = yield select(getAppFromState);
    const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);
    const infractionEventESID :UUID = getEntitySetIdFromApp(app, INFRACTION_EVENT);

    let searchFilter = {
      entityKeyIds: [personEKID],
      destinationEntitySetIds: [infractionEventESID],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: peopleESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }

    if (response.data[personEKID]) {
      infractionsList = fromJS(response.data[personEKID])
        .map((infraction :Map) => getNeighborDetails(infraction));
      infractionsList.forEach((infraction :Map) => {
        const { [TYPE]: type } = getEntityProperties(infraction, [TYPE]);
        if (type === INFRACTIONS_CONSTS.WARNING) {
          let warnings = infractionsMap.get(INFRACTIONS_CONSTS.WARNING);
          warnings = warnings.push(infraction);
          infractionsMap = infractionsMap.set(INFRACTIONS_CONSTS.WARNING, warnings);
        }
        if (type === INFRACTIONS_CONSTS.VIOLATION) {
          let violations = infractionsMap.get(INFRACTIONS_CONSTS.VIOLATION);
          violations = violations.push(infraction);
          infractionsMap = infractionsMap.set(INFRACTIONS_CONSTS.VIOLATION, violations);
        }
      });

      const infractionEventEKIDs :UUID[] = [];
      infractionsList
        .forEach((infraction :Map) => {
          infractionEventEKIDs.push(getEntityKeyId(infraction));
        });
      const infractionsESID :UUID = getEntitySetIdFromApp(app, INFRACTIONS);
      const enrollmentStatusESID :UUID = getEntitySetIdFromApp(app, ENROLLMENT_STATUS);
      const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);
      searchFilter = {
        entityKeyIds: infractionEventEKIDs,
        destinationEntitySetIds: [enrollmentStatusESID, infractionsESID],
        sourceEntitySetIds: [worksitePlanESID],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: infractionEventESID, filter: searchFilter })
      );
      if (response.error) {
        throw response.error;
      }
      const infractionEventNeighbors :Map = fromJS(response.data);

      if (!infractionEventNeighbors.isEmpty()) {

        infractionEventNeighbors.forEach((neighborList :List, infractionEventEKID :UUID) => {
          neighborList.forEach((neighbor :Map) => {
            const neighborESID = getNeighborESID(neighbor);
            const entity :Map = getNeighborDetails(neighbor);
            let infractionEventMap :Map = infractionInfoMap.get(infractionEventEKID, Map());

            if (neighborESID === infractionsESID) {
              const { [CATEGORY]: violationCategory } = getEntityProperties(entity, [CATEGORY]);
              infractionEventMap = infractionEventMap.set(CATEGORY, violationCategory);
              infractionInfoMap = infractionInfoMap.set(infractionEventEKID, infractionEventMap);
            }
            else if (neighborESID === enrollmentStatusESID) {
              const { [STATUS]: enrollmentStatus } = getEntityProperties(entity, [STATUS]);
              infractionEventMap = infractionEventMap.set(STATUS, enrollmentStatus);
              infractionInfoMap = infractionInfoMap.set(infractionEventEKID, infractionEventMap);
            }
            else if (neighborESID === worksitePlanESID) {
              const worksitePlanEKID :UUID = getEntityKeyId(entity);
              infractionEventMap = infractionEventMap.set(WORKSITE_PLAN, worksitePlanEKID);
              infractionInfoMap = infractionInfoMap.set(infractionEventEKID, infractionEventMap);
            }

          });
        });
      }
    }

    yield put(getParticipantInfractions.success(id, { infractionInfoMap, infractionsMap }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getParticipantInfractionsWorker()', error);
    yield put(getParticipantInfractions.failure(id, error));
  }
  finally {
    yield put(getParticipantInfractions.finally(id));
  }
  return workerResponse;
}

function* getParticipantInfractionsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PARTICIPANT_INFRACTIONS, getParticipantInfractionsWorker);
}

/*
 *
 * ParticipantsActions.getAllParticipantInfo()
 *
 */

function* getAllParticipantInfoWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (value === null || value === undefined) {
    yield put(getAllParticipantInfo.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }

  try {
    yield put(getAllParticipantInfo.request(id));
    const { personEKID } = value;

    const workerResponses = yield all([
      call(getCaseInfoWorker, getCaseInfo({ personEKID })),
      call(getContactInfoWorker, getContactInfo({ personEKID })),
      call(getEnrollmentStatusWorker, getEnrollmentStatus({ personEKID })),
      call(getInfractionTypesWorker, getInfractionTypes()),
      call(getParticipantAddressWorker, getParticipantAddress({ personEKID })),
      call(getParticipantInfractionsWorker, getParticipantInfractions({ personEKID })),
      call(getParticipantWorker, getParticipant({ personEKID })),
      call(getWorksitesWorker, getWorksites()),
    ]);
    const responseError = workerResponses.reduce(
      (error, workerResponse) => (error ? error : workerResponse.error),
      undefined,
    );
    if (responseError) {
      throw responseError;
    }
    yield put(getAllParticipantInfo.success(id));
  }
  catch (error) {
    LOG.error('caught exception in getAllParticipantInfoWorker()', error);
    yield put(getAllParticipantInfo.failure(id, error));
  }
  finally {
    yield put(getAllParticipantInfo.finally(id));
  }
}

function* getAllParticipantInfoWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_ALL_PARTICIPANT_INFO, getAllParticipantInfoWorker);
}

export {
  addInfractionWatcher,
  addInfractionWorker,
  addNewDiversionPlanStatusWatcher,
  addNewDiversionPlanStatusWorker,
  addNewParticipantContactsWatcher,
  addNewParticipantContactsWorker,
  addOrientationDateWatcher,
  addOrientationDateWorker,
  addWorksitePlanWatcher,
  addWorksitePlanWorker,
  checkInForAppointmentWatcher,
  checkInForAppointmentWorker,
  createWorkAppointmentsWatcher,
  createWorkAppointmentsWorker,
  deleteAppointmentWatcher,
  deleteAppointmentWorker,
  editCaseAndHoursWatcher,
  editCaseAndHoursWorker,
  editCheckInDateWatcher,
  editCheckInDateWorker,
  editParticipantContactsWatcher,
  editParticipantContactsWorker,
  editPersonDetailsWatcher,
  editPersonDetailsWorker,
  editPersonNotesWatcher,
  editPersonNotesWorker,
  editPlanNotesWatcher,
  editPlanNotesWorker,
  editSentenceDateWatcher,
  editSentenceDateWorker,
  editWorksitePlanWatcher,
  editWorksitePlanWorker,
  getAppointmentCheckInsWatcher,
  getAppointmentCheckInsWorker,
  getAllParticipantInfoWatcher,
  getAllParticipantInfoWorker,
  getCaseInfoWatcher,
  getCaseInfoWorker,
  getContactInfoWatcher,
  getContactInfoWorker,
  getEnrollmentStatusWatcher,
  getEnrollmentStatusWorker,
  getInfractionTypesWatcher,
  getInfractionTypesWorker,
  getParticipantAddressWatcher,
  getParticipantAddressWorker,
  getParticipantInfractionsWatcher,
  getParticipantInfractionsWorker,
  getParticipantWatcher,
  getParticipantWorker,
  getProgramOutcomeWatcher,
  getProgramOutcomeWorker,
  getWorkAppointmentsWatcher,
  getWorkAppointmentsWorker,
  getWorksiteByWorksitePlanWatcher,
  getWorksiteByWorksitePlanWorker,
  getWorksitePlansWatcher,
  getWorksitePlansWorker,
  getWorksitePlanStatusesWatcher,
  getWorksitePlanStatusesWorker,
  markDiversionPlanAsCompleteWatcher,
  markDiversionPlanAsCompleteWorker,
  updateHoursWorkedWatcher,
  updateHoursWorkedWorker,
};
