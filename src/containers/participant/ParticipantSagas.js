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
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import {
  ADD_INFRACTION,
  ADD_NEW_DIVERSION_PLAN_STATUS,
  ADD_WORKSITE_PLAN,
  CREATE_WORK_APPOINTMENTS,
  GET_ALL_PARTICIPANT_INFO,
  GET_CASE_INFO,
  GET_CONTACT_INFO,
  GET_ENROLLMENT_STATUS,
  GET_INFRACTION_TYPES,
  GET_PARTICIPANT,
  GET_PARTICIPANT_ADDRESS,
  GET_PARTICIPANT_INFRACTIONS,
  GET_REQUIRED_HOURS,
  GET_SENTENCE_TERM,
  GET_WORKSITE_BY_WORKSITE_PLAN,
  GET_WORKSITE_PLANS,
  GET_WORK_APPOINTMENTS,
  addInfraction,
  addNewDiversionPlanStatus,
  addWorksitePlan,
  createWorkAppointments,
  getAllParticipantInfo,
  getCaseInfo,
  getContactInfo,
  getEnrollmentStatus,
  getInfractionTypes,
  getParticipant,
  getParticipantAddress,
  getParticipantInfractions,
  getRequiredHours,
  getSentenceTerm,
  getWorkAppointments,
  getWorksiteByWorksitePlan,
  getWorksitePlans,
} from './ParticipantActions';
import { submitDataGraph } from '../../core/sagas/data/DataActions';
import { submitDataGraphWorker } from '../../core/sagas/data/DataSagas';
import { getWorksites } from '../worksites/WorksitesActions';
import { getWorksitesWorker } from '../worksites/WorksitesSagas';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getNeighborDetails,
  getNeighborESID,
  sortEntitiesByDateProperty,
} from '../../utils/DataUtils';
import { STATE, WORKSITES } from '../../utils/constants/ReduxStateConsts';
import {
  APP_TYPE_FQNS,
  CASE_FQNS,
  CONTACT_INFO_FQNS,
  DATETIME_START,
  DIVERSION_PLAN_FQNS,
  ENROLLMENT_STATUS_FQNS,
  INFRACTION_EVENT_FQNS,
  INFRACTION_FQNS,
  LOCATION_FQNS,
} from '../../core/edm/constants/FullyQualifiedNames';
import { INFRACTIONS_CONSTS } from '../../core/edm/constants/DataModelConsts';

const { getEntityData, getEntitySetData } = DataApiActions;
const { getEntityDataWorker, getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const {
  ADDRESSES,
  APPOINTMENT,
  BASED_ON,
  CONTACT_INFORMATION,
  COURT_PRETRIAL_CASES,
  DIVERSION_PLAN,
  ENROLLMENT_STATUS,
  INFRACTION_EVENT,
  INFRACTIONS,
  LOCATION,
  MANUAL_PRETRIAL_CASES,
  PEOPLE,
  REGISTERED_FOR,
  SENTENCE_TERM,
  WORKSITE,
  WORKSITE_PLAN,
} = APP_TYPE_FQNS;
const {
  EMAIL,
  PHONE_NUMBER,
  PREFERRED,
} = CONTACT_INFO_FQNS;
const { REQUIRED_HOURS } = DIVERSION_PLAN_FQNS;
const { EFFECTIVE_DATE, STATUS } = ENROLLMENT_STATUS_FQNS;
const { CATEGORY } = INFRACTION_FQNS;
const { TYPE } = INFRACTION_EVENT_FQNS;
const { UNPARSED_ADDRESS } = LOCATION_FQNS;

const getAppFromState = state => state.get(STATE.APP, Map());

const LOG = new Logger('ParticipantSagas');

const { CASE_NUMBER_TEXT } = CASE_FQNS;
const getEdmFromState = state => state.get(STATE.EDM, Map());
const getWorksitesListFromState = state => state.getIn([STATE.WORKSITES, WORKSITES.WORKSITES_LIST], List());

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
    const enrollmentStatusESID = getEntitySetIdFromApp(app, ENROLLMENT_STATUS);
    const infractionESID = getEntitySetIdFromApp(app, INFRACTIONS);
    const edm = yield select(getEdmFromState);

    yield put(addInfraction.success(id, {
      edm,
      enrollmentStatusESID,
      infractionESID,
      infractionEventEKID,
      infractionEventESID,
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

    const edm = yield select(getEdmFromState);
    const enrollmentStatusESID = Object.keys(entityKeyIds)[0];
    const enrollmentStatusEKID = Object.values(entityKeyIds)[0];

    yield put(addNewDiversionPlanStatus.success(id, { edm, enrollmentStatusEKID, enrollmentStatusESID }));
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
  let caseNumber :string = '';

  try {
    yield put(getCaseInfo.request(id));
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const { personEKID } = value;
    const app = yield select(getAppFromState);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
    const casesESID = getEntitySetIdFromApp(app, COURT_PRETRIAL_CASES);
    const manualCasesESID = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_CASES);

    const searchFilter :Object = {
      entityKeyIds: [personEKID],
      destinationEntitySetIds: [casesESID, manualCasesESID],
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
      caseNumber = fromJS(response.data[personEKID])
        .map((caseNeighbor :Map) => getNeighborDetails(caseNeighbor))
        .map((caseObj :Map) => {
          const { [CASE_NUMBER_TEXT]: caseNumberText } = getEntityProperties(caseObj, [CASE_NUMBER_TEXT]);
          return caseNumberText;
        })
        .get(0);
    }

    yield put(getCaseInfo.success(id, caseNumber));
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
  let contactInfo :Map = Map().withMutations((map :Map) => {
    map.set('email', '');
    map.set('phone', '');
  });
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
    let email = '';
    let phone = '';
    if (response.data[personEKID]) {
      fromJS(response.data[personEKID])
        .map((contactInfoNeighbor :Map) => getNeighborDetails(contactInfoNeighbor))
        .forEach((contact :Map) => {
          const { [EMAIL]: emailFound, [PHONE_NUMBER]: phoneFound, [PREFERRED]: preferred } = getEntityProperties(
            contact, [EMAIL, PHONE_NUMBER, PREFERRED]
          );
          if (phoneFound && preferred) {
            phone = phoneFound;
          }
          if (emailFound && preferred) {
            email = emailFound;
          }
        });
    }
    contactInfo = contactInfo.set('email', email);
    contactInfo = contactInfo.set('phone', phone);
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
      destinationEntitySetIds: [worksitePlanESID],
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
      worksitePlans = fromJS(response.data[diversionPlanEKID])
        .map((worksitePlan :Map) => getNeighborDetails(worksitePlan));

      yield all([
        call(getWorksiteByWorksitePlanWorker, getWorksiteByWorksitePlan({ worksitePlans })),
        call(getWorkAppointmentsWorker, getWorkAppointments({ worksitePlans })),
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
        destinationEntitySetIds: [enrollmentStatusESID],
        sourceEntitySetIds: [],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter: enrollmentFilter })
      );
      if (response.error) {
        throw response.error;
      }
      let enrollmentStatusesByDiversionPlan :Map = fromJS(response.data)
        .map((enrollmentList :List) => enrollmentList.map((enrollment :Map) => getNeighborDetails(enrollment)));

      /*
       * 3. Find most recent enrollment status, if any exist.
       */
      if (enrollmentStatusesByDiversionPlan.count() > 0) {

        enrollmentStatusesByDiversionPlan = enrollmentStatusesByDiversionPlan.map((statusList :List) => {
          const sortedStatusList :List = sortEntitiesByDateProperty(statusList, EFFECTIVE_DATE);
          return sortedStatusList.last();
        });
        enrollmentStatus = sortEntitiesByDateProperty(
          enrollmentStatusesByDiversionPlan, EFFECTIVE_DATE
        ).last();

        /*
         * 4. Additionally, return relevant diversion plan.
         */
        const diversionPlanEKID :UUID = enrollmentStatusesByDiversionPlan
          .findKey((status :Map) => status === enrollmentStatus);
        diversionPlan = diversionPlans.get(personEKID).find((plan :Map) => getEntityKeyId(plan) === diversionPlanEKID);

        /* Call getWorksitePlans() to find all worksite plans for current diversion plan */
        yield call(getWorksitePlansWorker, getWorksitePlans({ diversionPlan }));
      }
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
  let address :string = '';

  try {
    yield put(getParticipantAddress.request(id));
    const { personEKID } = value;
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const app = yield select(getAppFromState);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
    const locationESID = getEntitySetIdFromApp(app, LOCATION);

    const searchFilter :Object = {
      entityKeyIds: [personEKID],
      destinationEntitySetIds: [locationESID],
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
      address = fromJS(response.data[personEKID])
        .map((locationNeighbor :Map) => getNeighborDetails(locationNeighbor))
        .getIn([0, UNPARSED_ADDRESS, 0]);
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
 * ParticipantsActions.getRequiredHours()
 *
 */

function* getRequiredHoursWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let requiredHours :number = 0;

  try {
    yield put(getRequiredHours.request(id));
    const { personEKID } = value;
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const app = yield select(getAppFromState);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
    const diversionPlanESID = getEntitySetIdFromApp(app, DIVERSION_PLAN);

    const searchFilter :Object = {
      entityKeyIds: [personEKID],
      destinationEntitySetIds: [diversionPlanESID],
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
      let activeDiversionPlan :Map = fromJS(response.data[personEKID])
        .last();
      activeDiversionPlan = getNeighborDetails(activeDiversionPlan);
      requiredHours = activeDiversionPlan.getIn([REQUIRED_HOURS, 0], 0);
    }

    yield put(getRequiredHours.success(id, requiredHours));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getRequiredHoursWorker()', error);
    yield put(getRequiredHours.failure(id, error));
  }
  finally {
    yield put(getRequiredHours.finally(id));
  }
  return workerResponse;
}

function* getRequiredHoursWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_REQUIRED_HOURS, getRequiredHoursWorker);
}

/*
 *
 * ParticipantsActions.getSentenceTerm()
 *
 */

function* getSentenceTermWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let sentenceTerm :Map = Map();

  try {
    yield put(getSentenceTerm.request(id));
    const { personEKID } = value;
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const app = yield select(getAppFromState);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
    const sentenceTermESID = getEntitySetIdFromApp(app, SENTENCE_TERM);

    const searchFilter :Object = {
      entityKeyIds: [personEKID],
      destinationEntitySetIds: [sentenceTermESID],
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
      sentenceTerm = fromJS(response.data[personEKID])
        .map((term :Map) => getNeighborDetails(term))
        .sort((term1 :Map, term2 :Map) => term1.getIn([DATETIME_START, 0]) - term2.getIn([DATETIME_START, 0]))
        .last();
    }

    yield put(getSentenceTerm.success(id, sentenceTerm));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getSentenceTermWorker()', error);
    yield put(getSentenceTerm.failure(id, error));
  }
  finally {
    yield put(getSentenceTerm.finally(id));
  }
  return workerResponse;
}

function* getSentenceTermWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_SENTENCE_TERM, getSentenceTermWorker);
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
      call(getParticipantAddressWorker, getParticipantAddress({ personEKID })),
      call(getParticipantInfractionsWorker, getParticipantInfractions({ personEKID })),
      call(getParticipantWorker, getParticipant({ personEKID })),
      call(getRequiredHoursWorker, getRequiredHours({ personEKID })),
      call(getSentenceTermWorker, getSentenceTerm({ personEKID })),
      call(getWorksitesWorker, getWorksites()),
      call(getInfractionTypesWorker, getInfractionTypes()),
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
  addWorksitePlanWatcher,
  addWorksitePlanWorker,
  createWorkAppointmentsWatcher,
  createWorkAppointmentsWorker,
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
  getRequiredHoursWatcher,
  getRequiredHoursWorker,
  getSentenceTermWatcher,
  getSentenceTermWorker,
  getWorkAppointmentsWatcher,
  getWorkAppointmentsWorker,
  getWorksiteByWorksitePlanWatcher,
  getWorksiteByWorksitePlanWorker,
  getWorksitePlansWatcher,
  getWorksitePlansWorker,
};
