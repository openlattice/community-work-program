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
import { Constants } from 'lattice';
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
  GET_ENROLLMENT_STATUSES,
  GET_HOURS_WORKED,
  GET_INFRACTIONS,
  GET_PARTICIPANTS,
  GET_SENTENCES,
  GET_SENTENCE_TERMS,
  getEnrollmentStatuses,
  getHoursWorked,
  getInfractions,
  getParticipants,
  getSentenceTerms,
  getSentences,
} from './ParticipantsActions';
import { getEntityProperties, getFirstNeighborValue, getEntitySetIdFromApp, getPropertyTypeIdFromEdm } from '../../utils/DataUtils';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import {
  APP_TYPE_FQNS,
  ENTITY_KEY_ID,
  DIVERSION_PLAN_FQNS,
  INFRACTION_FQNS,
  SENTENCE_FQNS,
  SENTENCE_TERM_FQNS,
  WORKSITE_PLAN_FQNS,
} from '../../core/edm/constants/FullyQualifiedNames';
import { isDefined } from '../../utils/LangUtils';
import {
  INFRACTIONS_CONSTS,
  NEIGHBOR_DETAILS,
  NEIGHBOR_ENTITY_SET,
} from '../../core/edm/constants/DataModelConsts';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter, searchEntitySetData } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker, searchEntitySetDataWorker } = SearchApiSagas;
const { OPENLATTICE_ID_FQN } = Constants;

const {
  DIVERSION_PLAN,
  ENROLLMENT_STATUS,
  INFRACTIONS,
  MANUAL_SENTENCES,
  PEOPLE,
  SENTENCE_TERM,
  SENTENCES,
  WORKSITE_PLAN,
} = APP_TYPE_FQNS;
const { SENTENCE_CONDITIONS } = SENTENCE_FQNS;
const { TYPE } = INFRACTION_FQNS;
const { COMPLETED } = DIVERSION_PLAN_FQNS;
const { HOURS_WORKED, REQUIRED_HOURS } = WORKSITE_PLAN_FQNS;
const { DATETIME_START } = SENTENCE_TERM_FQNS;

const getAppFromState = state => state.get(STATE.APP, Map());
const getEdmFromState = state => state.get(STATE.EDM, Map());

const LOG = new Logger('StudySagas');

/*
 *
 * ParticipantsActions.getEnrollmentStatuses()
 *
 */

function* getEnrollmentStatusesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (value === null || value === undefined) {
    yield put(getEnrollmentStatuses.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }
  let response :Object = {};

  try {
    yield put(getEnrollmentStatuses.request(id));

    /*
     * 1. Get participant EKIDs and enrollment status ESID.
     */
    const { participants, peopleESID } = value;
    const participantEKIDs :UUID[] = participants
      .map((participant :Map) => {
        const { [ENTITY_KEY_ID]: personEKID } = getEntityProperties(participant, [ENTITY_KEY_ID]);
        return personEKID;
      })
      .toJS();
    const app = yield select(getAppFromState);
    const enrollmentStatusESID :UUID = getEntitySetIdFromApp(app, ENROLLMENT_STATUS);

    /*
     * 2. Find enrollment statuses for all participants, if any.
     */
    const searchFilter :Object = {
      entityKeyIds: participantEKIDs,
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
    let enrollmentMap :Map = fromJS(response.data).map((statuses :List) => statuses.map((status :Map) => {
      const { [NEIGHBOR_DETAILS]: neighborDetails } = getEntityProperties(status, [NEIGHBOR_DETAILS]);
      return fromJS(neighborDetails);
    }));
    const participantsWithoutEnrollmentStatus :UUID[] = participantEKIDs
      .filter(ekid => !isDefined(enrollmentMap.get(ekid)));
    participantsWithoutEnrollmentStatus.forEach((ekid :string) => {
      enrollmentMap = enrollmentMap.set(ekid, Map());
    });

    yield put(getEnrollmentStatuses.success(id, enrollmentMap));
  }
  catch (error) {
    LOG.error('caught exception in getEnrollmentStatusesWorker()', error);
    yield put(getEnrollmentStatuses.failure(id, error));
  }
  finally {
    yield put(getEnrollmentStatuses.finally(id));
  }
}

function* getEnrollmentStatusesWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_ENROLLMENT_STATUSES, getEnrollmentStatusesWorker);
}


/*
 *
 * ParticipantsActions.getHoursWorked()
 *
 */

function* getHoursWorkedWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (value === null || value === undefined) {
    yield put(getHoursWorked.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }
  let response :Object = {};

  try {
    yield put(getHoursWorked.request(id));
    const { participants, peopleESID } = value;
    const participantEKIDs :UUID[] = participants
      .map((participant :Map) => {
        const { [ENTITY_KEY_ID]: personEKID } = getEntityProperties(participant, [ENTITY_KEY_ID]);
        return personEKID;
      })
      .toJS();

    /*
     * 1. Get diversion plans of participants given.
     */
    const app = yield select(getAppFromState);
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);


    let searchFilter = {
      entityKeyIds: participantEKIDs,
      destinationEntitySetIds: [diversionPlanESID],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: peopleESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    const diversionPlansByParticipant = fromJS(response.data)
      .map((planArray :List) => planArray.map((plan :Map) => {
        const { [NEIGHBOR_DETAILS]: neighborDetails } = getEntityProperties(plan, [NEIGHBOR_DETAILS]);
        return fromJS(neighborDetails);
      }));
    const activeDiversionPlans = diversionPlansByParticipant
      .filter((planArray :List) => planArray
        .filter((plan :Map) => {
          const { [COMPLETED]: completed } = getEntityProperties(plan, [COMPLETED]);
          return fromJS(!completed);
        }));
    const activeDiversionPlanEKIDs = activeDiversionPlans.map((plans :List) => plans
      .map((plan :Map) => {
        const { [ENTITY_KEY_ID]: planEntityKeyId } = getEntityProperties(plan, [ENTITY_KEY_ID]);
        return planEntityKeyId;
      }))
      .valueSeq()
      .toJS()
      .flat();

    const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);
    searchFilter = {
      entityKeyIds: activeDiversionPlanEKIDs,
      destinationEntitySetIds: [worksitePlanESID],
      sourceEntitySetIds: [peopleESID],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    const diversionPlanNeighbors = fromJS(response.data);

    let hoursWorkedMap :Map = Map();
    diversionPlanNeighbors.forEach((plan :Map) => {
      const personEKID :UUID = plan.find((neighbor :Map) => neighbor
        .getIn([NEIGHBOR_ENTITY_SET, 'name']).includes(PEOPLE.toString().split('.')[1]))
        .getIn([NEIGHBOR_DETAILS, OPENLATTICE_ID_FQN, 0]);
      const worksitePlan :Map = plan.find((neighbor :Map) => neighbor
        .getIn([NEIGHBOR_ENTITY_SET, 'name']).includes(WORKSITE_PLAN.toString().split('.')[1]));
      const hoursWorked :number = worksitePlan ? getFirstNeighborValue(worksitePlan, HOURS_WORKED) : 0;
      const reqHours :number = getFirstNeighborValue(worksitePlan, REQUIRED_HOURS);
      hoursWorkedMap = hoursWorkedMap.set(personEKID, Map({ worked: hoursWorked, required: reqHours }));
    });

    yield put(getHoursWorked.success(id, hoursWorkedMap));
  }
  catch (error) {
    LOG.error('caught exception in getHoursWorkedWorker()', error);
    yield put(getHoursWorked.failure(id, error));
  }
  finally {
    yield put(getHoursWorked.finally(id));
  }
}

function* getHoursWorkedWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_HOURS_WORKED, getHoursWorkedWorker);
}

/*
 *
 * ParticipantsActions.getInfractions()
 *
 */

function* getInfractionsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (value === null || value === undefined) {
    yield put(getEnrollmentStatuses.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }
  let response :Object = {};

  try {
    yield put(getInfractions.request(id));
    const { participants, peopleESID } = value;

    const participantEKIDs :UUID[] = participants
      .map((participant :Map) => {
        const { [ENTITY_KEY_ID]: personEKID } = getEntityProperties(participant, [ENTITY_KEY_ID]);
        return personEKID;
      })
      .toJS();
    const app = yield select(getAppFromState);
    const infractionsESID :UUID = getEntitySetIdFromApp(app, INFRACTIONS);

    const searchFilter = {
      entityKeyIds: participantEKIDs,
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

    const infractionsMap :Map = fromJS(response.data)
      .map((participant :Map) => participant
        .map((infraction :Map) => infraction.get(NEIGHBOR_DETAILS)));

    const infractionCountMap :Map = infractionsMap.map((infractions :List) => {
      const infractionCount = { warnings: 0, violations: 0 };
      infractions.forEach((infraction :Map) => {
        const { [TYPE]: type } = getEntityProperties(infraction, [TYPE]);
        if (type === INFRACTIONS_CONSTS.WARNING) {
          infractionCount.warnings += 1;
        }
        if (type === INFRACTIONS_CONSTS.VIOLATION) {
          infractionCount.violations += 1;
        }
      });
      return fromJS(infractionCount);
    });

    yield put(getInfractions.success(id, { infractionCountMap, infractionsMap }));
  }
  catch (error) {
    LOG.error('caught exception in getInfractionsWorker()', error);
    yield put(getInfractions.failure(id, error));
  }
  finally {
    yield put(getInfractions.finally(id));
  }
}

function* getInfractionsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_INFRACTIONS, getInfractionsWorker);
}

/*
 *
 * ParticipantsActions.getSentenceTerms()
 *
 */
function* getSentenceTermsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (value === null || value === undefined) {
    yield put(getHoursWorked.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }
  let response :Object = {};

  try {
    yield put(getSentenceTerms.request(id));
    const { participants, peopleESID } = value;

    const app = yield select(getAppFromState);
    const participantEKIDs :UUID[] = participants
      .map((participant :Map) => {
        const { [ENTITY_KEY_ID]: personEKID } = getEntityProperties(participant, [ENTITY_KEY_ID]);
        return personEKID;
      })
      .toJS();
    const sentenceTermESID :UUID = getEntitySetIdFromApp(app, SENTENCE_TERM);
    const searchFilter = {
      entityKeyIds: participantEKIDs,
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
    const sentenceTermsMap :Map = fromJS(response.data)
      .map((terms :List) => terms
        .map((term :Map) => {
          const { [NEIGHBOR_DETAILS]: neighborDetails } = getEntityProperties(term, [NEIGHBOR_DETAILS]);
          return fromJS(neighborDetails);
        })
        .sort((term1 :Map, term2 :Map) => term1.getIn([DATETIME_START, 0]) - term2.getIn([DATETIME_START, 0]))
        .last());

    yield put(getSentenceTerms.success(id, sentenceTermsMap));
  }
  catch (error) {
    LOG.error('caught exception in getSentenceTermsWorker()', error);
    yield put(getSentenceTerms.failure(id, error));
  }
  finally {
    yield put(getSentenceTerms.finally(id));
  }
}

function* getSentenceTermsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_SENTENCE_TERMS, getSentenceTermsWorker);
}

/*
 *
 * ParticipantsActions.getParticipants()
 *
 */

function* getParticipantsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (value === null || value === undefined) {
    yield put(getParticipants.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }
  let response :Object = {};
  let participants :List = List();

  try {
    yield put(getParticipants.request(id));
    const { manualSentenceESID, sentences, sentenceESID } = value;
    const app = yield select(getAppFromState);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);

    if (sentences.count() > 0) {

      const integratedSentencesEKIDs :UUID[] = sentences
        .map((sentence :Map) => {
          const { [ENTITY_KEY_ID]: sentenceEKID } = getEntityProperties(sentence, [ENTITY_KEY_ID]);
          return sentenceEKID;
        })
        .toJS();

      let searchFilter = {
        entityKeyIds: integratedSentencesEKIDs,
        destinationEntitySetIds: [],
        sourceEntitySetIds: [peopleESID],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: sentenceESID, filter: searchFilter })
      );
      if (response.error) {
        throw response.error;
      }

      participants = fromJS(response.data).toIndexedSeq()
        .map(personList => personList.get(0))
        .map((person :Map) => {
          const { [NEIGHBOR_DETAILS]: neighborDetails } = getEntityProperties(person, [NEIGHBOR_DETAILS]);
          return fromJS(neighborDetails);
        })
        .toList();

      const manualSentencesEKIDs :UUID[] = sentences
        .map((sentence :Map) => {
          const { [ENTITY_KEY_ID]: sentenceEKID } = getEntityProperties(sentence, [ENTITY_KEY_ID]);
          return sentenceEKID;
        })
        .toJS();

      searchFilter = {
        entityKeyIds: manualSentencesEKIDs,
        destinationEntitySetIds: [],
        sourceEntitySetIds: [peopleESID],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: manualSentenceESID, filter: searchFilter })
      );
      if (response.error) {
        throw response.error;
      }
      const moreParticipants = fromJS(response.data).toIndexedSeq()
        .map(personList => personList.get(0))
        .map((person :Map) => {
          const { [NEIGHBOR_DETAILS]: neighborDetails } = getEntityProperties(person, [NEIGHBOR_DETAILS]);
          return fromJS(neighborDetails);
        })
        .toList();

      participants = participants.concat(moreParticipants);
    }

    if (participants.count() > 0) {
      yield call(getSentenceTermsWorker, getSentenceTerms({ participants, peopleESID }));
      yield call(getEnrollmentStatusesWorker, getEnrollmentStatuses({ participants, peopleESID }));
      yield call(getInfractionsWorker, getInfractions({ participants, peopleESID }));
      yield call(getHoursWorkedWorker, getHoursWorked({ participants, peopleESID }));
    }

    yield put(getParticipants.success(id, participants));
  }
  catch (error) {
    LOG.error('caught exception in getParticipantsWorker()', error);
    yield put(getParticipants.failure(id, error));
  }
  finally {
    yield put(getParticipants.finally(id));
  }
}

function* getParticipantsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PARTICIPANTS, getParticipantsWorker);
}

/*
 *
 * ParticipantsActions.getSentences()
 *
 */

function* getSentencesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id } = action;
  let response :Object = {};
  try {
    yield put(getSentences.request(id));

    /*
     * 1. Do advanced search for integrated sentences with sentences conditions that include "community service".
     */
    const app = yield select(getAppFromState);
    const edm = yield select(getEdmFromState);
    const sentenceESID :UUID = getEntitySetIdFromApp(app, SENTENCES);
    const sentenceConditionsPTID :UUID = getPropertyTypeIdFromEdm(edm, SENTENCE_CONDITIONS);
    const searchOptions = {
      searchFields: [{
        searchTerm: '*COMMUNITY SERVICE*',
        property: sentenceConditionsPTID,
      }],
      start: 0,
      maxHits: 10000,
    };
    response = yield call(searchEntitySetDataWorker, searchEntitySetData({ entitySetId: sentenceESID, searchOptions }));
    if (response.error) {
      throw response.error;
    }
    let sentences = fromJS(response.data.hits);

    /*
     * 2. Get all manually created sentences.
     */

    const manualSentenceESID :UUID = getEntitySetIdFromApp(app, MANUAL_SENTENCES);
    response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: manualSentenceESID }));
    if (response.error) {
      throw response.error;
    }
    sentences = sentences.concat(fromJS(response.data));

    /*
     * 3. Call getParticipants for all participants associated with sentences found.
     */

    yield call(getParticipantsWorker, getParticipants({ manualSentenceESID, sentences, sentenceESID }));

    yield put(getSentences.success(id, sentences));
  }
  catch (error) {
    LOG.error('caught exception in getSentencesWorker()', error);
    yield put(getSentences.failure(id, error));
  }
  finally {
    yield put(getSentences.finally(id));
  }
}

function* getSentencesWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_SENTENCES, getSentencesWorker);
}

export {
  getEnrollmentStatusesWatcher,
  getEnrollmentStatusesWorker,
  getHoursWorkedWatcher,
  getHoursWorkedWorker,
  getInfractionsWatcher,
  getInfractionsWorker,
  getParticipantsWatcher,
  getParticipantsWorker,
  getSentencesWatcher,
  getSentencesWorker,
  getSentenceTermsWatcher,
  getSentenceTermsWorker,
};
