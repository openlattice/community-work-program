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
  ADD_NEW_DIVERSION_PLAN_STATUS,
  GET_ALL_PARTICIPANT_INFO,
  GET_CASE_INFO,
  GET_CONTACT_INFO,
  GET_ENROLLMENT_STATUS,
  GET_PARTICIPANT,
  GET_PARTICIPANT_ADDRESS,
  GET_PARTICIPANT_INFRACTIONS,
  GET_REQUIRED_HOURS,
  GET_SENTENCE_TERM,
  GET_WORKSITE_BY_WORKSITE_PLAN,
  GET_WORKSITE_PLANS,
  addNewDiversionPlanStatus,
  getAllParticipantInfo,
  getCaseInfo,
  getContactInfo,
  getEnrollmentStatus,
  getParticipant,
  getParticipantAddress,
  getParticipantInfractions,
  getRequiredHours,
  getSentenceTerm,
  getWorksiteByWorksitePlan,
  getWorksitePlans,
} from './ParticipantActions';
import { submitDataGraph } from '../../core/sagas/data/DataActions';
import { submitDataGraphWorker } from '../../core/sagas/data/DataSagas';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getNeighborDetails,
  sortEntitiesByDateProperty,
} from '../../utils/DataUtils';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import {
  APP_TYPE_FQNS,
  CASE_FQNS,
  CONTACT_INFO_FQNS,
  DIVERSION_PLAN_FQNS,
  ENROLLMENT_STATUS_FQNS,
  INFRACTION_FQNS,
  LOCATION_FQNS,
  SENTENCE_TERM_FQNS,
} from '../../core/edm/constants/FullyQualifiedNames';
import { INFRACTIONS_CONSTS } from '../../core/edm/constants/DataModelConsts';

const { getEntityData } = DataApiActions;
const { getEntityDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const {
  CONTACT_INFORMATION,
  COURT_PRETRIAL_CASES,
  DIVERSION_PLAN,
  ENROLLMENT_STATUS,
  INFRACTIONS,
  LOCATION,
  MANUAL_PRETRIAL_CASES,
  PEOPLE,
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
const { EFFECTIVE_DATE } = ENROLLMENT_STATUS_FQNS;
const { TYPE } = INFRACTION_FQNS;
const { UNPARSED_ADDRESS } = LOCATION_FQNS;
const { DATETIME_START } = SENTENCE_TERM_FQNS;

const getAppFromState = state => state.get(STATE.APP, Map());

const LOG = new Logger('ParticipantSagas');

const { CASE_NUMBER_TEXT } = CASE_FQNS;
const getEdmFromState = state => state.get(STATE.EDM, Map());

/*
 *
 * WorksitesActions.addNewDiversionPlanStatus()
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
 * WorksitesActions.getWorksiteByWorksitePlan()
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
 * WorksitesActions.getWorksitePlans()
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

    if (response.data[diversionPlanESID]) {
      worksitePlans = fromJS(response.data[diversionPlanESID])
        .map((worksitePlan :Map) => getNeighborDetails(worksitePlan));

      yield call(getWorksiteByWorksitePlanWorker, getWorksiteByWorksitePlan({ worksitePlans }));
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

/*
 *
 * ParticipantsActions.getParticipantInfractions()
 *
 */

function* getParticipantInfractionsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let infractions :Map = Map().withMutations((map :Map) => {
    map.set(INFRACTIONS_CONSTS.VIOLATION, List());
    map.set(INFRACTIONS_CONSTS.WARNING, List());
  });

  try {
    yield put(getParticipantInfractions.request(id));
    const { personEKID } = value;
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const app = yield select(getAppFromState);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
    const infractionsESID = getEntitySetIdFromApp(app, INFRACTIONS);

    const searchFilter = {
      entityKeyIds: [personEKID],
      destinationEntitySetIds: [infractionsESID],
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
      const infractionsFound :List = fromJS(response.data[personEKID])
        .map((infraction :Map) => getNeighborDetails(infraction));
      infractionsFound.forEach((infraction :Map) => {
        const { [TYPE]: type } = getEntityProperties(infraction, [TYPE]);
        if (type === INFRACTIONS_CONSTS.WARNING) {
          let warnings = infractions.get(INFRACTIONS_CONSTS.WARNING);
          warnings = warnings.push(infraction);
          infractions = infractions.set(INFRACTIONS_CONSTS.WARNING, warnings);
        }
        if (type === INFRACTIONS_CONSTS.VIOLATION) {
          let violations = infractions.get(INFRACTIONS_CONSTS.VIOLATION);
          violations = violations.push(infraction);
          infractions = infractions.set(INFRACTIONS_CONSTS.VIOLATION, violations);
        }
      });
    }

    yield put(getParticipantInfractions.success(id, infractions));
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
  addNewDiversionPlanStatusWatcher,
  addNewDiversionPlanStatusWorker,
  getAllParticipantInfoWatcher,
  getAllParticipantInfoWorker,
  getCaseInfoWatcher,
  getCaseInfoWorker,
  getContactInfoWatcher,
  getContactInfoWorker,
  getEnrollmentStatusWatcher,
  getEnrollmentStatusWorker,
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
  getWorksiteByWorksitePlanWatcher,
  getWorksiteByWorksitePlanWorker,
  getWorksitePlansWatcher,
  getWorksitePlansWorker,
};
