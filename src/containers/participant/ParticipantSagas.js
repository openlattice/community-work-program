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
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import { DateTime } from 'luxon';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import {
  GET_CASE_INFO,
  GET_CONTACT_INFO,
  GET_ENROLLMENT_STATUS,
  GET_PARTICIPANT,
  GET_PARTICIPANT_ADDRESS,
  GET_PARTICIPANT_INFRACTIONS,
  GET_REQUIRED_HOURS,
  GET_SENTENCE_TERM,
  getCaseInfo,
  getContactInfo,
  getEnrollmentStatus,
  getParticipant,
  getParticipantAddress,
  getParticipantInfractions,
  getRequiredHours,
  getSentenceTerm,
} from './ParticipantActions';
import { isDefined } from '../../utils/LangUtils';
import {
  getEntityProperties,
  getEntitySetIdFromApp,
  getNeighborDetails,
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
import { ENROLLMENT_STATUSES, INFRACTIONS_CONSTS } from '../../core/edm/constants/DataModelConsts';

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
} = APP_TYPE_FQNS;
const {
  EMAIL,
  PHONE_NUMBER,
  PREFERRED,
} = CONTACT_INFO_FQNS;
const { COMPLETED, REQUIRED_HOURS } = DIVERSION_PLAN_FQNS;
const { EFFECTIVE_DATE, STATUS } = ENROLLMENT_STATUS_FQNS;
const { TYPE } = INFRACTION_FQNS;
const { UNPARSED_ADDRESS } = LOCATION_FQNS;
const { DATETIME_START } = SENTENCE_TERM_FQNS;

const getAppFromState = state => state.get(STATE.APP, Map());

const LOG = new Logger('ParticipantSagas');

const { CASE_NUMBER_TEXT } = CASE_FQNS;

/*
 *
 * ParticipantsActions.getParticipant()
 *
 */

function* getParticipantWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (value === null || value === undefined) {
    yield put(getParticipant.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }
  let response :Object = {};
  let participant :Map = Map();

  try {
    yield put(getParticipant.request(id));
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
    LOG.error('caught exception in getParticipantWorker()', error);
    yield put(getParticipant.failure(id, error));
  }
  finally {
    yield put(getParticipant.finally(id));
  }
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
  if (value === null || value === undefined) {
    yield put(getCaseInfo.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }
  let response :Object = {};
  let caseNumber :string = '';

  try {
    yield put(getCaseInfo.request(id));
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
    LOG.error('caught exception in getCaseInfoWorker()', error);
    yield put(getCaseInfo.failure(id, error));
  }
  finally {
    yield put(getCaseInfo.finally(id));
  }
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
  if (value === null || value === undefined) {
    yield put(getContactInfo.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }
  let response :Object = {};
  const contactInfo :Object = {
    email: '',
    phone: ''
  };

  try {
    yield put(getContactInfo.request(id));
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
    if (response.data[personEKID]) {
      email = fromJS(response.data[personEKID])
        .map((contactInfoNeighbor :Map) => getNeighborDetails(contactInfoNeighbor))
        .filter((contact :Map) => {
          const { [EMAIL]: emailFound, [PREFERRED]: preferred } = getEntityProperties(contact, [EMAIL, PREFERRED]);
          return emailFound && preferred;
        })
        .getIn([0, EMAIL, 0]);
    }

    if (isDefined(email)) {
      contactInfo.email = email;
    }
    let phone = '';
    if (response.data[personEKID]) {
      phone = fromJS(response.data[personEKID])
        .map((contactInfoNeighbor :Map) => getNeighborDetails(contactInfoNeighbor))
        .filter((contact :Map) => {
          const { [PHONE_NUMBER]: phoneFound, [PREFERRED]: preferred } = getEntityProperties(
            contact, [PHONE_NUMBER, PREFERRED]
          );
          return phoneFound && preferred;
        })
        .getIn([0, PHONE_NUMBER, 0]);
    }

    if (isDefined(phone)) {
      contactInfo.phone = phone;
    }

    yield put(getContactInfo.success(id, contactInfo));
  }
  catch (error) {
    LOG.error('caught exception in getContactInfoWorker()', error);
    yield put(getContactInfo.failure(id, error));
  }
  finally {
    yield put(getContactInfo.finally(id));
  }
}

function* getContactInfoWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_CONTACT_INFO, getContactInfoWorker);
}

/*
 *
 * ParticipantsActions.getEnrollmentStatus()
 *
 */

function* getEnrollmentStatusWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (value === null || value === undefined) {
    yield put(getEnrollmentStatus.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }
  let response :Object = {};
  let enrollmentStatus :Map = Map();

  try {
    yield put(getEnrollmentStatus.request(id));
    const { personEKID } = value;
    const app = yield select(getAppFromState);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
    const enrollmentStatusESID = getEntitySetIdFromApp(app, ENROLLMENT_STATUS);

    const searchFilter :Object = {
      entityKeyIds: [personEKID],
      destinationEntitySetIds: [enrollmentStatusESID],
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
      enrollmentStatus = fromJS(response.data[personEKID]);
      const awaitingEnrollmentStatus = enrollmentStatus.find((status :Map) => status
        .getIn([STATUS, 0]) === ENROLLMENT_STATUSES.AWAITING_ENROLLMENT);
      if (isDefined(awaitingEnrollmentStatus)) {
        enrollmentStatus = awaitingEnrollmentStatus;
      }
      else {
        const mostRecentStatus = enrollmentStatus.sort((statusA :Map, statusB :Map) => {
          const dateA = DateTime.fromISO(statusA.getIn([EFFECTIVE_DATE, 0]));
          const dateB = DateTime.fromISO(statusB.getIn([EFFECTIVE_DATE, 0]));
          if (dateA.toISO() === dateB.toISO()) {
            return 0;
          }
          return dateA < dateB ? -1 : 1;
        });
        enrollmentStatus = getNeighborDetails(mostRecentStatus.last());
      }
    }

    yield put(getEnrollmentStatus.success(id, enrollmentStatus));
  }
  catch (error) {
    LOG.error('caught exception in getEnrollmentStatusWorker()', error);
    yield put(getEnrollmentStatus.failure(id, error));
  }
  finally {
    yield put(getEnrollmentStatus.finally(id));
  }
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
  if (value === null || value === undefined) {
    yield put(getParticipantAddress.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }
  let response :Object = {};
  let address :string = '';

  try {
    yield put(getParticipantAddress.request(id));
    const { personEKID } = value;
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
    LOG.error('caught exception in getParticipantAddressWorker()', error);
    yield put(getParticipantAddress.failure(id, error));
  }
  finally {
    yield put(getParticipantAddress.finally(id));
  }
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
  if (value === null || value === undefined) {
    yield put(getParticipantInfractions.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }
  let response :Object = {};
  let infractions :Map = Map().withMutations((map :Map) => {
    map.set(INFRACTIONS_CONSTS.VIOLATION, List());
    map.set(INFRACTIONS_CONSTS.WARNING, List());
  });

  try {
    yield put(getParticipantInfractions.request(id));
    const { personEKID } = value;
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
    LOG.error('caught exception in getParticipantInfractionsWorker()', error);
    yield put(getParticipantInfractions.failure(id, error));
  }
  finally {
    yield put(getParticipantInfractions.finally(id));
  }
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
  if (value === null || value === undefined) {
    yield put(getRequiredHours.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }
  let response :Object = {};
  let requiredHours :number = 0;

  try {
    yield put(getRequiredHours.request(id));
    const { personEKID } = value;
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
        .filter((planNeighbor :Map) => {
          const plan :Map = getNeighborDetails(planNeighbor);
          const { [COMPLETED]: completed } = getEntityProperties(plan, [COMPLETED]);
          return !completed;
        })
        .last();
      activeDiversionPlan = getNeighborDetails(activeDiversionPlan);
      requiredHours = activeDiversionPlan.getIn([REQUIRED_HOURS, 0], 0);
    }

    yield put(getRequiredHours.success(id, requiredHours));
  }
  catch (error) {
    LOG.error('caught exception in getRequiredHoursWorker()', error);
    yield put(getRequiredHours.failure(id, error));
  }
  finally {
    yield put(getRequiredHours.finally(id));
  }
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
  if (value === null || value === undefined) {
    yield put(getSentenceTerm.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }
  let response :Object = {};
  let sentenceTerm :Map = Map();

  try {
    yield put(getSentenceTerm.request(id));
    const { personEKID } = value;
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
    LOG.error('caught exception in getSentenceTermWorker()', error);
    yield put(getSentenceTerm.failure(id, error));
  }
  finally {
    yield put(getSentenceTerm.finally(id));
  }
}

function* getSentenceTermWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_SENTENCE_TERM, getSentenceTermWorker);
}

export {
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
};
