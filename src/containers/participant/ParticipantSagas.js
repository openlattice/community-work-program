/*
 * @flow
 */

import {
  List,
  Map,
  fromJS,
  getIn,
  has,
  setIn,
} from 'immutable';
import { DateTime } from 'luxon';
import toString from 'lodash/toString';
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
import type { SequenceAction } from 'redux-reqseq';
import type { FQN } from 'lattice';

import Logger from '../../utils/Logger';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import {
  ADD_NEW_DIVERSION_PLAN_STATUS,
  ADD_NEW_PARTICIPANT_CONTACTS,
  ADD_PERSON_PHOTO,
  CREATE_CASE,
  CREATE_NEW_ENROLLMENT,
  EDIT_ENROLLMENT_DATES,
  EDIT_PARTICIPANT_CONTACTS,
  EDIT_PERSON_CASE,
  EDIT_PERSON_DETAILS,
  EDIT_PERSON_NOTES,
  EDIT_PLAN_NOTES,
  EDIT_REQUIRED_HOURS,
  GET_ALL_PARTICIPANT_INFO,
  GET_CASE_INFO,
  GET_CONTACT_INFO,
  GET_DIVERSION_PLAN,
  GET_ENROLLMENT_HISTORY,
  GET_ENROLLMENT_FROM_DIVERSION_PLAN,
  GET_ENROLLMENT_STATUS,
  GET_INFO_FOR_ADD_PARTICIPANT,
  GET_INFO_FOR_EDIT_CASE,
  GET_INFO_FOR_EDIT_PERSON,
  GET_JUDGES,
  GET_JUDGE_FOR_CASE,
  GET_PARTICIPANT,
  GET_PARTICIPANT_ADDRESS,
  GET_PARTICIPANT_CASES,
  GET_PERSON_PHOTO,
  GET_PROGRAM_OUTCOME,
  MARK_DIVERSION_PLAN_AS_COMPLETE,
  REASSIGN_JUDGE,
  UPDATE_PERSON_PHOTO,
  addNewDiversionPlanStatus,
  addNewParticipantContacts,
  addPersonPhoto,
  createCase,
  createNewEnrollment,
  editEnrollmentDates,
  editParticipantContacts,
  editPersonCase,
  editPersonDetails,
  editPersonNotes,
  editPlanNotes,
  editRequiredHours,
  getAllParticipantInfo,
  getCaseInfo,
  getContactInfo,
  getDiversionPlan,
  getEnrollmentHistory,
  getEnrollmentFromDiversionPlan,
  getEnrollmentStatus,
  getInfoForAddParticipant,
  getInfoForEditCase,
  getInfoForEditPerson,
  getJudgeForCase,
  getJudges,
  getParticipant,
  getParticipantAddress,
  getParticipantCases,
  getPersonPhoto,
  getProgramOutcome,
  markDiversionPlanAsComplete,
  reassignJudge,
  updatePersonPhoto,
} from './ParticipantActions';
import {
  createOrReplaceAssociation,
  submitDataGraph,
  submitPartialReplace
} from '../../core/sagas/data/DataActions';
import {
  createOrReplaceAssociationWorker,
  submitDataGraphWorker,
  submitPartialReplaceWorker
} from '../../core/sagas/data/DataSagas';
import { getWorksites } from '../worksites/WorksitesActions';
import { getWorksitesWorker } from '../worksites/WorksitesSagas';
import { getInfractionTypes, getParticipantInfractions } from './infractions/InfractionsActions';
import { getInfractionTypesWorker, getParticipantInfractionsWorker } from './infractions/InfractionsSagas';
import { getWorksitePlans } from './assignedworksites/WorksitePlanActions';
import { getWorksitePlansWorker } from './assignedworksites/WorksitePlanSagas';
import {
  getArrestCasesAndChargesFromPSA,
  getArrestCharges,
  getArrestChargesLinkedToCWP,
  getCourtCharges,
  getCourtChargesForCase,
} from './charges/ChargesActions';
import {
  getArrestCasesAndChargesFromPSAWorker,
  getArrestChargesLinkedToCWPWorker,
  getArrestChargesWorker,
  getCourtChargesForCaseWorker,
  getCourtChargesWorker,
} from './charges/ChargesSagas';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getNeighborDetails,
  getPropertyFqnFromEdm,
  getPropertyTypeIdFromEdm,
  sortEntitiesByDateProperty,
} from '../../utils/DataUtils';
import { isDefined } from '../../utils/LangUtils';
import { isValidUUID } from '../../utils/ValidationUtils';
import { formatAsDate } from '../../utils/DateTimeUtils';
import { getCombinedDateTime } from '../../utils/ScheduleUtils';
import { enrollmentHeaderNames } from './ParticipantProfile';
import { EMPTY_FIELD } from '../participants/ParticipantsConstants';
import { PERSON, STATE } from '../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { CONTACT_METHODS } from '../../core/edm/constants/DataModelConsts';

const { getEntityData, getEntitySetData } = DataApiActions;
const { getEntityDataWorker, getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const {
  ADDRESS,
  CONTACT_INFORMATION,
  DIVERSION_PLAN,
  ENROLLMENT_STATUS,
  IMAGE,
  JUDGES,
  MANUAL_PRETRIAL_COURT_CASES,
  PEOPLE,
  PRESIDES_OVER,
  PROGRAM_OUTCOME,
} = APP_TYPE_FQNS;
const {
  DATETIME_COMPLETED,
  DATETIME_RECEIVED,
  EFFECTIVE_DATE,
  EMAIL,
  ENTITY_KEY_ID,
  HOURS_WORKED,
  ORIENTATION_DATETIME,
  PERSON_NOTES,
  PHONE_NUMBER,
  PREFERRED,
  REQUIRED_HOURS,
  STATUS,
} = PROPERTY_TYPE_FQNS;

const getAppFromState = (state) => state.get(STATE.APP, Map());
const getEdmFromState = (state) => state.get(STATE.EDM, Map());
const getPersonFromState = (state) => state.get(STATE.PERSON, Map());
const LOG = new Logger('ParticipantSagas');

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
 * ParticipantActions.addPersonPhoto()
 *
 */

function* addPersonPhotoWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};

  try {
    yield put(addPersonPhoto.request(id, value));

    response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) throw response.error;

    yield put(addPersonPhoto.success(id));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in addPersonPhotoWorker()', error);
    yield put(addPersonPhoto.failure(id, error));
  }
  finally {
    yield put(addPersonPhoto.finally(id));
  }
}

function* addPersonPhotoWatcher() :Generator<*, *, *> {

  yield takeEvery(ADD_PERSON_PHOTO, addPersonPhotoWorker);
}

/*
 *
 * ParticipantActions.updatePersonPhoto()
 *
 */

function* updatePersonPhotoWorker(action :SequenceAction) :Generator<any, any, any> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let response :Object = {};

  try {
    yield put(updatePersonPhoto.request(id, value));

    response = yield call(submitPartialReplaceWorker, submitPartialReplace(value));
    if (response.error) throw response.error;

    yield put(updatePersonPhoto.success(id));
  }
  catch (error) {
    LOG.error('updatePersonPhotoWorker', error);
    yield put(updatePersonPhoto.failure(id, error));
  }
}

function* updatePersonPhotoWatcher() :Generator<any, any, any> {

  yield takeEvery(UPDATE_PERSON_PHOTO, updatePersonPhotoWorker);
}

/*
 *
 * ParticipantActions.createCase()
 *
 */

function* createCaseWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};

  try {
    yield put(createCase.request(id, value));

    response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) throw response.error;
    const { data } :Object = response;
    const { entityKeyIds } :Object = data;

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const caseESID :UUID = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
    const caseEKID = entityKeyIds[caseESID][0];

    const { entityData } = value;
    let newCase :Map = Map();
    newCase = newCase.set(ENTITY_KEY_ID, caseEKID);
    fromJS(entityData[caseESID][0]).forEach((caseValue, ptid) => {
      const propertyTypeFqn :FQN = getPropertyFqnFromEdm(edm, ptid);
      newCase = newCase.set(propertyTypeFqn, caseValue);
    });

    yield put(createCase.success(id, { newCase }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in createCaseWorker()', error);
    yield put(createCase.failure(id, error));
  }
  finally {
    yield put(createCase.finally(id));
  }
}

function* createCaseWatcher() :Generator<*, *, *> {

  yield takeEvery(CREATE_CASE, createCaseWorker);
}

/*
 *
 * ParticipantActions.createNewEnrollment()
 *
 */

function* createNewEnrollmentWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};

  try {
    yield put(createNewEnrollment.request(id, value));

    response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) {
      throw response.error;
    }

    yield put(createNewEnrollment.success(id));
  }
  catch (error) {
    LOG.error('caught exception in createNewEnrollmentWorker()', error);
    yield put(createNewEnrollment.failure(id, error));
  }
  finally {
    yield put(createNewEnrollment.finally(id));
  }
}

function* createNewEnrollmentWatcher() :Generator<*, *, *> {

  yield takeEvery(CREATE_NEW_ENROLLMENT, createNewEnrollmentWorker);
}

/*
 *
 * ParticipantsActions.getDiversionPlan()
 *
 */

function* getDiversionPlanWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  const workerResponse = {};
  let response :Object = {};
  let diversionPlan :Map = Map();

  try {
    yield put(getDiversionPlan.request(id));
    const { diversionPlanEKID } = value;
    const app = yield select(getAppFromState);
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);

    response = yield call(
      getEntityDataWorker,
      getEntityData({ entitySetId: diversionPlanESID, entityKeyId: diversionPlanEKID })
    );
    if (response.error) {
      throw response.error;
    }
    diversionPlan = fromJS(response.data);

    yield put(getDiversionPlan.success(id, diversionPlan));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error(action.type, error);
    yield put(getDiversionPlan.failure(id, error));
  }
  finally {
    yield put(getDiversionPlan.finally(id));
  }
  return workerResponse;
}

function* getDiversionPlanWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_DIVERSION_PLAN, getDiversionPlanWorker);
}

/*
 *
 * ParticipantActions.editEnrollmentDates()
 *
 */

function* editEnrollmentDatesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let newDiversionPlanData :Map = Map();

  try {
    yield put(editEnrollmentDates.request(id, value));

    const app = yield select(getAppFromState);
    const diversionPlanESID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
    const edm = yield select(getEdmFromState);

    let { entityData } = value;
    const diversionPlanEKID = Object.keys(entityData[diversionPlanESID])[0];
    newDiversionPlanData = fromJS(getIn(entityData, [diversionPlanESID, diversionPlanEKID]));

    newDiversionPlanData.forEach((dateValue, propertyTypeId :UUID) => {
      let dateAsDateTime = dateValue.get(0);
      const currentTime = DateTime.local().toLocaleString(DateTime.TIME_24_SIMPLE);
      dateAsDateTime = getCombinedDateTime(dateAsDateTime, currentTime);
      entityData = setIn(entityData, [diversionPlanESID, diversionPlanEKID, propertyTypeId], [dateAsDateTime]);
    });

    const response = yield call(submitPartialReplaceWorker, submitPartialReplace({ entityData }));
    if (response.error) {
      throw response.error;
    }

    yield put(editEnrollmentDates.success(id, { edm, newDiversionPlanData }));
  }
  catch (error) {
    LOG.error('caught exception in editEnrollmentDatesWorker()', error);
    yield put(editEnrollmentDates.failure(id, error));
  }
  finally {
    yield put(editEnrollmentDates.finally(id));
  }
}

function* editEnrollmentDatesWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_ENROLLMENT_DATES, editEnrollmentDatesWorker);
}

/*
 *
 * ParticipantActions.editPersonCase()
 *
 */

function* editPersonCaseWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let newCaseData :Map = Map();

  try {
    yield put(editPersonCase.request(id, value));

    const response = yield call(submitPartialReplaceWorker, submitPartialReplace(value));
    if (response.error) {
      throw response.error;
    }
    const app = yield select(getAppFromState);
    const caseESID = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
    const edm = yield select(getEdmFromState);

    const { entityData } = value;
    const caseEKID = Object.keys(entityData[caseESID])[0];
    newCaseData = fromJS(getIn(entityData, [caseESID, caseEKID]));

    yield put(editPersonCase.success(id, { edm, newCaseData }));
  }
  catch (error) {
    LOG.error('caught exception in editPersonCaseWorker()', error);
    yield put(editPersonCase.failure(id, error));
  }
  finally {
    yield put(editPersonCase.finally(id));
  }
}

function* editPersonCaseWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_PERSON_CASE, editPersonCaseWorker);
}

/*
 *
 * ParticipantActions.editRequiredHours()
 *
 */

function* editRequiredHoursWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let requiredHours = null;

  try {
    yield put(editRequiredHours.request(id, value));

    const response = yield call(submitPartialReplaceWorker, submitPartialReplace(value));
    if (response.error) {
      throw response.error;
    }
    const app = yield select(getAppFromState);
    const diversionPlanESID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
    const edm = yield select(getEdmFromState);

    const { entityData } = value;
    const diversionPlanEKID = Object.keys(entityData[diversionPlanESID])[0];
    const requiredHoursPTID :UUID = getPropertyTypeIdFromEdm(edm, REQUIRED_HOURS);
    requiredHours = getIn(entityData, [diversionPlanESID, diversionPlanEKID, requiredHoursPTID, 0]);

    yield put(editRequiredHours.success(id, requiredHours));
  }
  catch (error) {
    LOG.error('caught exception in editRequiredHoursWorker()', error);
    yield put(editRequiredHours.failure(id, error));
  }
  finally {
    yield put(editRequiredHours.finally(id));
  }
}

function* editRequiredHoursWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_REQUIRED_HOURS, editRequiredHoursWorker);
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
    const notesPTID = getPropertyTypeIdFromEdm(edm, PERSON_NOTES);

    yield put(editPersonNotes.success(id, { edm, notesPTID, peopleESID }));
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
    const { data } = response;
    const { entityKeyIds } = data;

    const { entityData } = value;
    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const contactInfoESID = getEntitySetIdFromApp(app, CONTACT_INFORMATION);
    const addressESID = getEntitySetIdFromApp(app, ADDRESS);
    const addressEKID :UUID = entityKeyIds[addressESID][0];

    const storedAddressData = fromJS(entityData[addressESID][0]);
    let newAddress :Map = Map();
    storedAddressData.forEach((addressValue, propertyTypeId) => {
      const propertyTypeFqn :FQN = getPropertyFqnFromEdm(edm, propertyTypeId);
      newAddress = newAddress.set(propertyTypeFqn, addressValue);
    });
    newAddress = newAddress.set(ENTITY_KEY_ID, addressEKID);

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
    newPhone = newPhone.set(ENTITY_KEY_ID, entityKeyIds[contactInfoESID][0]);
    newEmail = newEmail.set(ENTITY_KEY_ID, entityKeyIds[contactInfoESID][1]);
    newPhone = newPhone.set(PREFERRED, true);
    newEmail = newEmail.set(PREFERRED, true);

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
 * ParticipantActions.reassignJudge()
 *
 */

function* reassignJudgeWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;

  try {
    yield put(reassignJudge.request(id, value));

    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const judgesESID :UUID = getEntitySetIdFromApp(app, JUDGES);
    const presidesOverESID :UUID = getEntitySetIdFromApp(app, PRESIDES_OVER);

    const { associationEntityData } = value;
    let associations :Object = associationEntityData;
    const associationsToDelete = [];

    const { entityData } = value;
    if (has(entityData, judgesESID)) {

      const judgeEKID :UUID = getIn(entityData, [judgesESID, 0, getPropertyTypeIdFromEdm(edm, ENTITY_KEY_ID), 0]);
      const person = yield select(getPersonFromState);
      const caseEKID :UUID = getEntityKeyId(person.getIn([PERSON.PERSON_CASE]));
      const caseESID :UUID = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
      const diversionPlanEKID :UUID = getEntityKeyId(person.getIn([PERSON.DIVERSION_PLAN]));
      const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);

      const existingAssociationsResponse = yield call(
        getEntitySetDataWorker,
        getEntitySetData({ entitySetId: presidesOverESID })
      );
      if (existingAssociationsResponse.error) throw existingAssociationsResponse.error;
      if (existingAssociationsResponse.data) {

        fromJS(existingAssociationsResponse.data)
          .forEach((associationEntity :Map) => {
            associationsToDelete.push({
              entitySetId: presidesOverESID,
              entityKeyId: getEntityKeyId(associationEntity)
            });
          });
      }

      associations = {
        [presidesOverESID]: [
          {
            data: {},
            dst: {
              entitySetId: caseESID,
              entityKeyId: caseEKID
            },
            src: {
              entitySetId: judgesESID,
              entityKeyId: judgeEKID
            }
          },
          {
            data: {},
            dst: {
              entitySetId: diversionPlanESID,
              entityKeyId: diversionPlanEKID
            },
            src: {
              entitySetId: judgesESID,
              entityKeyId: judgeEKID
            }
          }
        ]
      };
    }

    const associationResponse = yield call(
      createOrReplaceAssociationWorker,
      createOrReplaceAssociation({
        associations,
        associationsToDelete,
      })
    );
    if (associationResponse.error) throw associationResponse.error;

    yield put(reassignJudge.success(id, { edm, judgesESID, presidesOverESID }));
  }
  catch (error) {
    LOG.error('caught exception in reassignJudgeWorker()', error);
    yield put(reassignJudge.failure(id, error));
  }
  finally {
    yield put(reassignJudge.finally(id));
  }
}

function* reassignJudgeWatcher() :Generator<*, *, *> {

  yield takeEvery(REASSIGN_JUDGE, reassignJudgeWorker);
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
 * ParticipantsActions.getJudgeForCase()
 *
 */

function* getJudgeForCaseWorker(action :SequenceAction) :Generator<*, *, *> {

  /* judge -> presides over -> case */
  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let judge :Map = Map();
  let judgesByCase :Map = Map();

  try {
    yield put(getJudgeForCase.request(id));
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const { caseEKIDs } = value;
    const app = yield select(getAppFromState);
    const manualCourtCasesESID :UUID = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
    const judgesESID :UUID = getEntitySetIdFromApp(app, JUDGES);

    const searchFilter :Object = {
      entityKeyIds: caseEKIDs,
      destinationEntitySetIds: [],
      sourceEntitySetIds: [judgesESID],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: manualCourtCasesESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    const judgeResults = fromJS(response.data);
    if (!judgeResults.isEmpty()) {
      judgesByCase = judgeResults.map((result :Map) => getNeighborDetails(result.get(0)));
      judge = getNeighborDetails(judgeResults.getIn([caseEKIDs[0], 0]));
    }

    yield put(getJudgeForCase.success(id, { judge, judgesByCase }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getJudgeForCaseWorker()', error);
    yield put(getJudgeForCase.failure(id, error));
  }
  finally {
    yield put(getJudgeForCase.finally(id));
  }
  return workerResponse;
}

function* getJudgeForCaseWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_JUDGE_FOR_CASE, getJudgeForCaseWorker);
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
    const { diversionPlanEKID } = value;
    const app = yield select(getAppFromState);
    const diversionPlanESID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
    const manualCourtCases = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);

    const searchFilter :Object = {
      entityKeyIds: [diversionPlanEKID],
      destinationEntitySetIds: [manualCourtCases],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    if (response.data[diversionPlanEKID]) {
      const caseResult :Map = fromJS(response.data[diversionPlanEKID][0]);
      personCase = getNeighborDetails(caseResult);
    }

    const caseEKID :UUID = getEntityKeyId(personCase);
    yield call(getCourtChargesForCaseWorker, getCourtChargesForCase({ caseEKID }));
    yield call(getJudgeForCaseWorker, getJudgeForCase({ caseEKIDs: [caseEKID] }));

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
  let contactInfo :Map = Map();

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
    if (response.data[personEKID]) {
      fromJS(response.data[personEKID])
        .map((contactInfoNeighbor :Map) => getNeighborDetails(contactInfoNeighbor))
        .forEach((contact :Map) => {
          const { [PREFERRED]: preferred } = getEntityProperties(contact, [PREFERRED]);
          let email :Map = contactInfo.get(CONTACT_METHODS.EMAIL, Map());
          let phone :Map = contactInfo.get(CONTACT_METHODS.PHONE, Map());

          if (contact.get(PHONE_NUMBER) && preferred) {
            phone = contact;
          }
          if (contact.get(EMAIL) && preferred) {
            email = contact;
          }
          contactInfo = contactInfo.set(CONTACT_METHODS.EMAIL, email);
          contactInfo = contactInfo.set(CONTACT_METHODS.PHONE, phone);
        });
    }
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
 * ParticipantActions.getProgramOutcome()
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
    const { diversionPlanEKID } = value;
    const app = yield select(getAppFromState);
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
 * ParticipantActions.getEnrollmentHistory()
 *
 */

function* getEnrollmentHistoryWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  let response :Object = {};
  let programOutcomesByDiversionPlan :Map = Map();

  try {
    yield put(getEnrollmentHistory.request(id));
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const { allDiversionPlans, mostRecentEnrollmentStatusesByDiversionPlan } = value;
    const app = yield select(getAppFromState);
    const diversionPlanEKIDs :UUID[] = [];
    allDiversionPlans.forEach((diversionPlan :Map) => {
      diversionPlanEKIDs.push(getEntityKeyId(diversionPlan));
    });
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
    const programOutcomeESID :UUID = getEntitySetIdFromApp(app, PROGRAM_OUTCOME);

    const outcomeFilter :Object = {
      entityKeyIds: diversionPlanEKIDs,
      destinationEntitySetIds: [programOutcomeESID],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter: outcomeFilter })
    );
    if (response.error) {
      throw response.error;
    }
    const results :Map = fromJS(response.data);
    if (!results.isEmpty()) {
      programOutcomesByDiversionPlan = results.map((outcomeList :List) => getNeighborDetails(outcomeList.get(0)));
    }
    let enrollmentHistoryData = [];
    allDiversionPlans.forEach((diversionPlan :Map) => {
      const diversionPlanEKID :UUID = getEntityKeyId(diversionPlan);
      const {
        [DATETIME_RECEIVED]: sentenceDateTime,
        [ORIENTATION_DATETIME]: orientationDateTime
      } = getEntityProperties(diversionPlan, [DATETIME_RECEIVED, ORIENTATION_DATETIME]);
      const enrollmentStatus :Map = mostRecentEnrollmentStatusesByDiversionPlan.get(diversionPlanEKID);
      const { [STATUS]: status } = getEntityProperties(enrollmentStatus, [STATUS]);
      const outcome :Map = programOutcomesByDiversionPlan.get(diversionPlanEKID);
      const {
        [DATETIME_COMPLETED]: completionDateTime,
        [HOURS_WORKED]: totalHoursWorked
      } = getEntityProperties(outcome, [DATETIME_COMPLETED, HOURS_WORKED]);

      const sentenceDate :string = formatAsDate(sentenceDateTime);
      const orientationDate :string = formatAsDate(orientationDateTime);
      const completionDate :string = formatAsDate(completionDateTime);

      const diversionPlanObject :Object = {
        [enrollmentHeaderNames[0]]: status || EMPTY_FIELD,
        [enrollmentHeaderNames[1]]: sentenceDate,
        [enrollmentHeaderNames[2]]: orientationDate,
        [enrollmentHeaderNames[3]]: completionDate,
        [enrollmentHeaderNames[4]]: toString(totalHoursWorked) || EMPTY_FIELD,
        id: diversionPlanEKID
      };
      enrollmentHistoryData.push(diversionPlanObject);
    });
    enrollmentHistoryData = fromJS(enrollmentHistoryData).sortBy((
      enrollmentObj :Map
    ) => DateTime.fromISO(enrollmentObj.get(enrollmentHeaderNames[1])));
    yield put(getEnrollmentHistory.success(id, enrollmentHistoryData));
  }
  catch (error) {
    LOG.error('caught exception in getEnrollmentHistoryWorker()', error);
    yield put(getEnrollmentHistory.failure(id, error));
  }
  finally {
    yield put(getEnrollmentHistory.finally(id));
  }
}

function* getEnrollmentHistoryWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_ENROLLMENT_HISTORY, getEnrollmentHistoryWorker);
}

/*
 *
 * ParticipantActions.getEnrollmentStatus()
 *
 */

function* getEnrollmentStatusWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let enrollmentStatus :Map = Map();
  let diversionPlan :Map = Map();
  let allDiversionPlans :List = List();

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
    allDiversionPlans = fromJS(response.data[personEKID])
      .map((plan :List) => getNeighborDetails(plan));

    if (allDiversionPlans.count() > 0) {

      /*
       * 2. Find all enrollment statuses for each diversion plan found.
       */
      const diversionPlanEKIDs :UUID[] = [];
      allDiversionPlans.forEach((plan :Map) => {
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
      let mostRecentEnrollmentStatusesByDiversionPlan :Map = Map();
      if (enrollmentStatusesByDiversionPlan.count() > 0) {

        mostRecentEnrollmentStatusesByDiversionPlan = enrollmentStatusesByDiversionPlan
          .map((statusList :List) => {
            /* filter out enrollment statuses that have blank effective date values before sorting */
            const statusesWithEffectiveDates :List = statusList
              .filter((status :Map) => isDefined(status.get(EFFECTIVE_DATE)));
            const sortedStatusList :List = sortEntitiesByDateProperty(statusesWithEffectiveDates, [EFFECTIVE_DATE]);
            return sortedStatusList.last() || Map();
          });
        enrollmentStatus = sortEntitiesByDateProperty(
          mostRecentEnrollmentStatusesByDiversionPlan, [EFFECTIVE_DATE]
        ).last();
        /*
         * 4. Additionally, return relevant diversion plan.
         */
        const diversionPlanEKID :UUID = mostRecentEnrollmentStatusesByDiversionPlan
          .findKey((status :Map) => getEntityKeyId(status) === getEntityKeyId(enrollmentStatus));
        diversionPlan = allDiversionPlans.find((plan :Map) => getEntityKeyId(plan) === diversionPlanEKID);
      }

      // some integrated people won't have enrollment statuses but will have a diversion plan:
      if (diversionPlan.isEmpty()) diversionPlan = allDiversionPlans.get(0);
      const diversionPlanEKID :UUID = getEntityKeyId(diversionPlan);

      yield call(getCaseInfoWorker, getCaseInfo({ diversionPlanEKID }));
      yield call(getArrestChargesLinkedToCWPWorker, getArrestChargesLinkedToCWP({ diversionPlanEKID }));
      /* If populating profile, call getWorksitePlans() to find all worksite plans for current diversion plan */
      const { populateProfile } = value;
      if (populateProfile) {
        yield all([
          call(getWorksitePlansWorker, getWorksitePlans({ diversionPlanEKID })),
          call(getProgramOutcomeWorker, getProgramOutcome({ diversionPlanEKID })),
          call(getEnrollmentHistoryWorker, getEnrollmentHistory({
            allDiversionPlans,
            mostRecentEnrollmentStatusesByDiversionPlan
          })),
        ]);
      }
    }

    yield put(getEnrollmentStatus.success(id, { allDiversionPlans, diversionPlan, enrollmentStatus }));
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
 * ParticipantActions.getEnrollmentFromDiversionPlan()
 *
 */

function* getEnrollmentFromDiversionPlanWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let enrollmentStatus :Map = Map();

  try {
    yield put(getEnrollmentFromDiversionPlan.request(id));
    const { diversionPlan } = value;
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }

    const app = yield select(getAppFromState);
    const diversionPlanESID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
    const enrollmentStatusESID = getEntitySetIdFromApp(app, ENROLLMENT_STATUS);
    const diversionPlanEKID :UUID = getEntityKeyId(diversionPlan);

    const enrollmentFilter :Object = {
      entityKeyIds: [diversionPlanEKID],
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
    const enrollmentStatuses :Map = fromJS(response.data[diversionPlanEKID])
      .map((enrollment :List) => getNeighborDetails(enrollment));

    if (enrollmentStatuses.count() > 0) {
      enrollmentStatus = sortEntitiesByDateProperty(enrollmentStatuses, [EFFECTIVE_DATE])
        .last();
    }

    yield all([
      call(getCaseInfoWorker, getCaseInfo({ diversionPlanEKID })),
      call(getWorksitePlansWorker, getWorksitePlans({ diversionPlanEKID })),
      call(getProgramOutcomeWorker, getProgramOutcome({ diversionPlanEKID })),
    ]);

    yield put(getEnrollmentFromDiversionPlan.success(id, { diversionPlan, enrollmentStatus }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getEnrollmentFromDiversionPlanWorker()', error);
    yield put(getEnrollmentFromDiversionPlan.failure(id, error));
  }
  finally {
    yield put(getEnrollmentFromDiversionPlan.finally(id));
  }
  return workerResponse;
}

function* getEnrollmentFromDiversionPlanWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_ENROLLMENT_FROM_DIVERSION_PLAN, getEnrollmentFromDiversionPlanWorker);
}

/*
 *
 * ParticipantActions.getParticipantAddress()
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
 * ParticipantActions.getJudges()
 *
 */

function* getJudgesWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let judges :List = List();

  try {
    yield put(getJudges.request(id, value));

    const app = yield select(getAppFromState);
    const judgesESID :UUID = getEntitySetIdFromApp(app, JUDGES);

    response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: judgesESID }));
    if (response.error) {
      throw response.error;
    }
    judges = fromJS(response.data);
    yield put(getJudges.success(id, judges));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getJudgesWorker()', error);
    yield put(getJudges.failure(id, error));
  }
  finally {
    yield put(getJudges.finally(id));
  }
  return workerResponse;
}


function* getJudgesWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_JUDGES, getJudgesWorker);
}

/*
 *
 * ParticipantActions.getParticipantCases()
 *
 */

function* getParticipantCasesWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  const workerResponse = {};
  let response :Object = {};
  let allParticipantCases :List = List();

  try {
    yield put(getParticipantCases.request(id, value));
    const { personEKID } = value;

    const app = yield select(getAppFromState);
    const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);
    const manualPretrialCaseESID :UUID = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);

    const searchFilter = {
      entityKeyIds: [personEKID],
      destinationEntitySetIds: [manualPretrialCaseESID],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: peopleESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    const caseResults :List = fromJS(response.data[personEKID]);
    if (caseResults && !caseResults.isEmpty()) {
      allParticipantCases = caseResults.map((caseResult :Map) => getNeighborDetails(caseResult));

      const caseEKIDs :UUID[] = allParticipantCases.map((caseEntity :Map) => getEntityKeyId(caseEntity)).toJS();
      yield call(getJudgeForCaseWorker, getJudgeForCase({ caseEKIDs }));
    }
    yield put(getParticipantCases.success(id, allParticipantCases));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getParticipantCasesWorker()', error);
    yield put(getParticipantCases.failure(id, error));
  }
  finally {
    yield put(getParticipantCases.finally(id));
  }
  return workerResponse;
}


function* getParticipantCasesWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PARTICIPANT_CASES, getParticipantCasesWorker);
}

/*
 *
 * ParticipantActions.getPersonPhoto()
 *
 */

function* getPersonPhotoWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  const workerResponse :Object = {};
  let response :Object = {};
  let personPhoto :Map = Map();

  try {
    yield put(getPersonPhoto.request(id));
    const { personEKID } = value;

    const app = yield select(getAppFromState);
    const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);
    const imageESID :UUID = getEntitySetIdFromApp(app, IMAGE);

    const searchFilter = {
      entityKeyIds: [personEKID],
      destinationEntitySetIds: [],
      sourceEntitySetIds: [imageESID],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: peopleESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    const result = fromJS(response.data);
    if (!result.isEmpty()) {
      personPhoto = getNeighborDetails(result.getIn([personEKID, 0]));
    }

    yield put(getPersonPhoto.success(id, personPhoto));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getPersonPhotoWorker()', error);
    yield put(getPersonPhoto.failure(id, error));
  }
  finally {
    yield put(getPersonPhoto.finally(id));
  }
  return workerResponse;
}

function* getPersonPhotoWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PERSON_PHOTO, getPersonPhotoWorker);
}

/*
 *
 * ParticipantActions.getInfoForEditCase()
 *
 */

function* getInfoForEditCaseWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (value === null || value === undefined) {
    yield put(getInfoForEditCase.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }

  try {
    yield put(getInfoForEditCase.request(id));
    const { diversionPlanEKID, personEKID } = value;

    const workerResponses = yield all([
      call(getArrestCasesAndChargesFromPSAWorker, getArrestCasesAndChargesFromPSA({ personEKID })),
      call(getArrestChargesLinkedToCWPWorker, getArrestChargesLinkedToCWP({ diversionPlanEKID })),
      call(getArrestChargesWorker, getArrestCharges()),
      call(getCaseInfoWorker, getCaseInfo({ diversionPlanEKID })),
      call(getCourtChargesWorker, getCourtCharges()),
      call(getDiversionPlanWorker, getDiversionPlan({ diversionPlanEKID })),
      call(getJudgesWorker, getJudges()),
      call(getParticipantWorker, getParticipant({ personEKID })),
    ]);
    const responseError = workerResponses.reduce(
      (error, workerResponse) => error || workerResponse.error,
      undefined,
    );
    if (responseError) {
      throw responseError;
    }

    yield put(getInfoForEditCase.success(id));
  }
  catch (error) {
    LOG.error('caught exception in getInfoForEditCaseWorker()', error);
    yield put(getInfoForEditCase.failure(id, error));
  }
  finally {
    yield put(getInfoForEditCase.finally(id));
  }
}

function* getInfoForEditCaseWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_INFO_FOR_EDIT_CASE, getInfoForEditCaseWorker);
}

/*
 *
 * ParticipantActions.getInfoForAddParticipant()
 *
 */

function* getInfoForAddParticipantWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;

  try {
    yield put(getInfoForAddParticipant.request(id));

    const workerCalls = [
      call(getJudgesWorker, getJudges()),
      call(getArrestChargesWorker, getArrestCharges()),
    ];
    const { personEKID } = value;
    if (isValidUUID(personEKID)) {
      workerCalls.push(call(getParticipantWorker, getParticipant({ personEKID })));
      workerCalls.push(call(getArrestCasesAndChargesFromPSAWorker, getArrestCasesAndChargesFromPSA({ personEKID })));
    }

    const workerResponses = yield all(workerCalls);
    const responseError = workerResponses.reduce(
      (error, workerResponse) => error || workerResponse.error,
      undefined,
    );
    if (responseError) {
      throw responseError;
    }

    yield put(getInfoForAddParticipant.success(id));
  }
  catch (error) {
    LOG.error('caught exception in getInfoForAddParticipantWorker()', error);
    yield put(getInfoForAddParticipant.failure(id, error));
  }
  finally {
    yield put(getInfoForAddParticipant.finally(id));
  }
}

function* getInfoForAddParticipantWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_INFO_FOR_ADD_PARTICIPANT, getInfoForAddParticipantWorker);
}

/*
 *
 * ParticipantActions.getInfoForEditPerson()
 *
 */

function* getInfoForEditPersonWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (value === null || value === undefined) {
    yield put(getInfoForEditPerson.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }

  try {
    yield put(getInfoForEditPerson.request(id));
    const { personEKID } = value;

    const workerResponses = yield all([
      call(getContactInfoWorker, getContactInfo({ personEKID })),
      call(getParticipantWorker, getParticipant({ personEKID })),
      call(getParticipantAddressWorker, getParticipantAddress({ personEKID })),
    ]);
    const responseError = workerResponses.reduce(
      (error, workerResponse) => error || workerResponse.error,
      undefined,
    );
    if (responseError) {
      throw responseError;
    }

    yield put(getInfoForEditPerson.success(id));
  }
  catch (error) {
    LOG.error('caught exception in getInfoForEditPersonWorker()', error);
    yield put(getInfoForEditPerson.failure(id, error));
  }
  finally {
    yield put(getInfoForEditPerson.finally(id));
  }
}

function* getInfoForEditPersonWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_INFO_FOR_EDIT_PERSON, getInfoForEditPersonWorker);
}

/*
 *
 * ParticipantActions.getAllParticipantInfo()
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
      call(getContactInfoWorker, getContactInfo({ personEKID })),
      call(getEnrollmentStatusWorker, getEnrollmentStatus({ personEKID, populateProfile: true })),
      call(getInfractionTypesWorker, getInfractionTypes()),
      call(getParticipantAddressWorker, getParticipantAddress({ personEKID })),
      call(getParticipantInfractionsWorker, getParticipantInfractions({ personEKID })),
      call(getParticipantWorker, getParticipant({ personEKID })),
      call(getPersonPhotoWorker, getPersonPhoto({ personEKID })),
      call(getWorksitesWorker, getWorksites()),
    ]);
    const responseError = workerResponses.reduce(
      (error, workerResponse) => error || workerResponse.error,
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
  addNewDiversionPlanStatusWatcher,
  addNewDiversionPlanStatusWorker,
  addNewParticipantContactsWatcher,
  addNewParticipantContactsWorker,
  addPersonPhotoWatcher,
  addPersonPhotoWorker,
  createCaseWatcher,
  createCaseWorker,
  createNewEnrollmentWatcher,
  createNewEnrollmentWorker,
  editEnrollmentDatesWatcher,
  editEnrollmentDatesWorker,
  editParticipantContactsWatcher,
  editParticipantContactsWorker,
  editPersonCaseWatcher,
  editPersonCaseWorker,
  editPersonDetailsWatcher,
  editPersonDetailsWorker,
  editPersonNotesWatcher,
  editPersonNotesWorker,
  editPlanNotesWatcher,
  editPlanNotesWorker,
  editRequiredHoursWatcher,
  editRequiredHoursWorker,
  getAllParticipantInfoWatcher,
  getAllParticipantInfoWorker,
  getCaseInfoWatcher,
  getCaseInfoWorker,
  getContactInfoWatcher,
  getContactInfoWorker,
  getDiversionPlanWatcher,
  getDiversionPlanWorker,
  getEnrollmentHistoryWatcher,
  getEnrollmentHistoryWorker,
  getEnrollmentFromDiversionPlanWatcher,
  getEnrollmentFromDiversionPlanWorker,
  getEnrollmentStatusWatcher,
  getEnrollmentStatusWorker,
  getInfoForAddParticipantWatcher,
  getInfoForAddParticipantWorker,
  getInfoForEditCaseWatcher,
  getInfoForEditCaseWorker,
  getInfoForEditPersonWatcher,
  getInfoForEditPersonWorker,
  getJudgeForCaseWatcher,
  getJudgeForCaseWorker,
  getJudgesWatcher,
  getJudgesWorker,
  getParticipantAddressWatcher,
  getParticipantAddressWorker,
  getParticipantCasesWatcher,
  getParticipantCasesWorker,
  getParticipantWatcher,
  getParticipantWorker,
  getPersonPhotoWatcher,
  getPersonPhotoWorker,
  getProgramOutcomeWatcher,
  getProgramOutcomeWorker,
  markDiversionPlanAsCompleteWatcher,
  markDiversionPlanAsCompleteWorker,
  reassignJudgeWatcher,
  reassignJudgeWorker,
  updatePersonPhotoWatcher,
  updatePersonPhotoWorker,
};
