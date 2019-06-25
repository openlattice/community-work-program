/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { DateTime } from 'luxon';
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
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getFirstNeighborValue,
  getNeighborDetails,
  getPropertyTypeIdFromEdm
} from '../../utils/DataUtils';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import {
  APP_TYPE_FQNS,
  DIVERSION_PLAN_FQNS,
  ENROLLMENT_STATUS_FQNS,
  INFRACTION_FQNS,
  SENTENCE_FQNS,
  SENTENCE_TERM_FQNS,
  WORKSITE_PLAN_FQNS,
} from '../../core/edm/constants/FullyQualifiedNames';
import { isDefined } from '../../utils/LangUtils';
import {
  ENROLLMENT_STATUSES,
  INFRACTIONS_CONSTS,
  NEIGHBOR_ENTITY_SET,
} from '../../core/edm/constants/DataModelConsts';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter, searchEntitySetData } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker, searchEntitySetDataWorker } = SearchApiSagas;

const {
  DIVERSION_PLAN,
  ENROLLMENT_STATUS,
  INFRACTIONS,
  MANUAL_SENTENCES,
  PEOPLE,
  SENTENCES,
  SENTENCE_TERM,
  WORKSITE_PLAN,
} = APP_TYPE_FQNS;
const { SENTENCE_CONDITIONS } = SENTENCE_FQNS;
const { TYPE } = INFRACTION_FQNS;
const { COMPLETED } = DIVERSION_PLAN_FQNS;
const { HOURS_WORKED, REQUIRED_HOURS } = WORKSITE_PLAN_FQNS;
const { DATETIME_START } = SENTENCE_TERM_FQNS;
const { EFFECTIVE_DATE, STATUS } = ENROLLMENT_STATUS_FQNS;

const getAppFromState = state => state.get(STATE.APP, Map());
const getEdmFromState = state => state.get(STATE.EDM, Map());

const LOG = new Logger('ParticipantsSagas');

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
      .map((participant :Map) => getEntityKeyId(participant))
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
    let enrollmentMap :Map = fromJS(response.data)
      .map((statuses :List) => statuses
        .map((status :Map) => getNeighborDetails(status)));
    /*
     * 3. If no enrollment status for a person exists, set enrollment to empty List().
     */
    const participantsWithoutEnrollmentStatus :UUID[] = participantEKIDs
      .filter(ekid => !isDefined(enrollmentMap.get(ekid)));
    participantsWithoutEnrollmentStatus.forEach((ekid :string) => {
      enrollmentMap = enrollmentMap.set(ekid, List());
    });

    /*
     * 4. Get most current enrollment status for each participant.
     */

    enrollmentMap = enrollmentMap.map((personStatusList :List) => {

      let newStatus :Map = Map();
      if (personStatusList.count() > 0) {

        // NOTE: if someone is signed up to work at multiple worksites, but they haven't yet started working,
        // they could have multiple enrollmentstatus entities labeled 'Awaiting enrollment'
        const hasAwaitingEnrollmentStatus = personStatusList.find((status :Map) => status
          .getIn([STATUS, 0]) === ENROLLMENT_STATUSES.AWAITING_ENROLLMENT);

        if (isDefined(hasAwaitingEnrollmentStatus)) {
          newStatus = hasAwaitingEnrollmentStatus;
        }
        else {
          // find status with most recent effective date
          const mostRecentStatus = personStatusList.sort((statusA :Map, statusB :Map) => {
            const dateA = DateTime.fromISO(statusA.getIn([EFFECTIVE_DATE, 0]));
            const dateB = DateTime.fromISO(statusB.getIn([EFFECTIVE_DATE, 0]));
            if (dateA.toISO() === dateB.toISO()) {
              return 0;
            }
            return dateA < dateB ? -1 : 1;
          });
          newStatus = mostRecentStatus.last();
        }
      }
      return newStatus;
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
      .map((participant :Map) => getEntityKeyId(participant))
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
      .map((planArray :List) => planArray.map((plan :Map) => getNeighborDetails(plan)));
    const activeDiversionPlans = diversionPlansByParticipant
      .filter((planArray :List) => planArray
        .filter((plan :Map) => {
          const { [COMPLETED]: completed } = getEntityProperties(plan, [COMPLETED]);
          return fromJS(!completed);
        }));
    const activeDiversionPlanEKIDs = activeDiversionPlans.map((plans :List) => plans
      .map((plan :Map) => getEntityKeyId(plan)))
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

      const person :UUID = plan.find((neighbor :Map) => neighbor
        .getIn([NEIGHBOR_ENTITY_SET, 'name']).includes(PEOPLE.toString().split('.')[1]));
      const personEKID = getEntityKeyId(getNeighborDetails(person));
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
      .map((participant :Map) => getEntityKeyId(participant))
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
        .map((infraction :Map) => getNeighborDetails(infraction)));

    const infractionCountMap :Map = infractionsMap.map((infractions :List) => {
      const infractionCount = { [INFRACTIONS_CONSTS.WARNING]: 0, [INFRACTIONS_CONSTS.VIOLATION]: 0 };
      infractions.forEach((infraction :Map) => {
        const { [TYPE]: type } = getEntityProperties(infraction, [TYPE]);
        if (type === INFRACTIONS_CONSTS.WARNING) {
          infractionCount[INFRACTIONS_CONSTS.WARNING] += 1;
        }
        if (type === INFRACTIONS_CONSTS.VIOLATION) {
          infractionCount[INFRACTIONS_CONSTS.VIOLATION] += 1;
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
      .map((participant :Map) => getEntityKeyId(participant))
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
        .map((term :Map) => getNeighborDetails(term))
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
  let participants :List = List();

  try {
    yield put(getParticipants.request(id));
    const { manualSentenceESID, sentences, sentenceESID } = value;
    const app = yield select(getAppFromState);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);

    if (sentences.count() > 0) {

      const integratedSentencesEKIDs :UUID[] = sentences
        .map((sentence :Map) => getEntityKeyId(sentence))
        .toJS();

      const manualSentencesEKIDs :UUID[] = sentences
        .map((sentence :Map) => getEntityKeyId(sentence))
        .toJS();

      const integratedSearchFilter = {
        entityKeyIds: integratedSentencesEKIDs,
        destinationEntitySetIds: [],
        sourceEntitySetIds: [peopleESID],
      };
      const manualSearchFilter = {
        entityKeyIds: manualSentencesEKIDs,
        destinationEntitySetIds: [],
        sourceEntitySetIds: [peopleESID],
      };

      const [integrated, manual] = yield all([
        call(
          searchEntityNeighborsWithFilterWorker,
          searchEntityNeighborsWithFilter({ entitySetId: sentenceESID, filter: integratedSearchFilter })
        ),
        call(
          searchEntityNeighborsWithFilterWorker,
          searchEntityNeighborsWithFilter({ entitySetId: manualSentenceESID, filter: manualSearchFilter })
        )
      ]);
      if (integrated.error) {
        throw integrated.error;
      }
      if (manual.error) {
        throw manual.error;
      }
      // get participants from each request result
      const integratedImmutable = fromJS(integrated.data);
      const manualImmutable = fromJS(manual.data);
      participants = integratedImmutable.toIndexedSeq()
        .map(personList => personList.get(0))
        .map((person :Map) => getNeighborDetails(person))
        .toList();
      const moreParticipants = manualImmutable.toIndexedSeq()
        .map(personList => personList.get(0))
        .map((person :Map) => getNeighborDetails(person))
        .toList();
      participants = participants.concat(moreParticipants);
    }

    if (participants.count() > 0) {
      const params = { participants, peopleESID };
      yield all([
        call(getSentenceTermsWorker, getSentenceTerms(params)),
        call(getEnrollmentStatusesWorker, getEnrollmentStatuses(params)),
        call(getInfractionsWorker, getInfractions(params)),
        call(getHoursWorkedWorker, getHoursWorked(params))
      ]);
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

    yield call(getParticipantsWorker, getParticipants({ manualSentenceESID, sentenceESID, sentences }));

    yield put(getSentences.success(id));
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
