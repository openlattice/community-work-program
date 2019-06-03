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
import { Constants } from 'lattice';
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
  GET_ENROLLMENT_STATUSES,
  getEnrollmentStatuses,
  GET_HOURS_WORKED,
  getHoursWorked,
  GET_INFRACTIONS,
  getInfractions,
  GET_PARTICIPANTS,
  getParticipants,
  GET_SENTENCES,
  getSentences,
  GET_SENTENCE_TERMS,
  getSentenceTerms,
} from './ParticipantsActions';
import { getEntitySetIdFromApp, getPropertyTypeIdFromApp } from '../../utils/AppUtils';
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
import { ENROLLMENT_STATUSES, INFRACTIONS_CONSTS } from '../../core/edm/constants/DataModelConsts';

const { createEntityAndAssociationData, getEntitySetData } = DataApiActions;
const { createEntityAndAssociationDataWorker, getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter, searchEntitySetData } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker, searchEntitySetDataWorker } = SearchApiSagas;
const { OPENLATTICE_ID_FQN } = Constants;

const {
  DIVERSION_PLAN,
  ENROLLMENT_STATUS,
  HAS,
  INFRACTIONS,
  MANUAL_SENTENCES,
  PEOPLE,
  SENTENCE_TERM,
  SENTENCES,
  WORKSITE_PLAN,
} = APP_TYPE_FQNS;
const { STATUS } = ENROLLMENT_STATUS_FQNS;
const { SENTENCE_CONDITIONS } = SENTENCE_FQNS;
const { TYPE } = INFRACTION_FQNS;
const { COMPLETED } = DIVERSION_PLAN_FQNS;
const { HOURS_WORKED, REQUIRED_HOURS } = WORKSITE_PLAN_FQNS;
const { DATETIME_START } = SENTENCE_TERM_FQNS;
const getAppFromState = state => state.get(STATE.APP, Map());

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
    const participantEKIDs :string[] = participants
      .map((participant :Map) => participant.getIn([OPENLATTICE_ID_FQN, 0]))
      .toJS();
    const app = yield select(getAppFromState);
    const enrollmentStatusESID :string = getEntitySetIdFromApp(app, ENROLLMENT_STATUS.toString());

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
    let enrollmentMap :Map = fromJS(response.data).map((status :Map) => status.getIn([0, 'neighborDetails']));

    /*
     * 3. For each participant without an enrollment status, create one.
     */
    const hasESID :string = getEntitySetIdFromApp(app, HAS.toString());
    const participantsWithoutEnrollmentStatus :string[] = participantEKIDs
      .filter(ekid => !isDefined(enrollmentMap.get(ekid)));

    const statusTypeId = getPropertyTypeIdFromApp(app, ENROLLMENT_STATUS.toString(), STATUS.toString());

    response = yield all(participantsWithoutEnrollmentStatus.map((ekid :string) => {
      const enrollment = {
        associations: {
          [hasESID]: [{
            data: {},
            srcEntityKeyId: ekid,
            srcEntitySetId: peopleESID,
            dstEntityIndex: 0,
            dstEntitySetId: enrollmentStatusESID,
          }]
        },
        entities: {
          [enrollmentStatusESID]: [{
            [statusTypeId]: [ENROLLMENT_STATUSES.PLANNED]
          }]
        }
      };
      return call(createEntityAndAssociationDataWorker, createEntityAndAssociationData(enrollment));
    }));
    if (response.error) {
      throw response.error;
    }

    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: peopleESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }

    enrollmentMap = fromJS(response.data).map((status :Map) => status.getIn([0, 'neighborDetails']));

    // const newParticipants = participantsWithoutEnrollmentStatus
    //   .map((ekid :string) => participants.getIn([OPENLATTICE_ID_FQN, 0]) === ekid);
    // console.log('newParticipants: ', newParticipants);

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
    const participantEKIDs = participants.map((participant :Map) => participant.getIn([OPENLATTICE_ID_FQN, 0])).toJS();

    /*
     * 1. Get diversion plans of participants given.
     */
    const app = yield select(getAppFromState);
    const diversionPlanESID :string = getEntitySetIdFromApp(app, DIVERSION_PLAN.toString());


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
      .map((planArray :List) => planArray.map((plan :Map) => plan
        .get('neighborDetails')));
    const activeDiversionPlans = diversionPlansByParticipant
      .filter((planArray :List) => planArray
        .filter((plan :Map) => !plan.getIn([COMPLETED, 0])));
    const activeDiversionPlanEKIDs = activeDiversionPlans.map((plans :List) => plans
      .map((plan :Map) => plan.getIn([OPENLATTICE_ID_FQN, 0])))
      .valueSeq().toJS().flat();

    const worksitePlanESID :string = getEntitySetIdFromApp(app, WORKSITE_PLAN.toString());
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
      const personEKID :string = plan.find((neighbor :Map) => neighbor
        .getIn(['neighborEntitySet', 'name']).includes(PEOPLE.toString().split('.')[1]))
        .getIn(['neighborDetails', OPENLATTICE_ID_FQN, 0]);
      const worksitePlan :Map = plan.find((neighbor :Map) => neighbor
        .getIn(['neighborEntitySet', 'name']).includes(WORKSITE_PLAN.toString().split('.')[1]));
      const hoursWorked :number = worksitePlan.getIn(['neighborDetails', HOURS_WORKED, 0]);
      const reqHours :number = worksitePlan.getIn(['neighborDetails', REQUIRED_HOURS, 0]);
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

    const participantEKIDs = participants.map((participant :Map) => participant.getIn([OPENLATTICE_ID_FQN, 0])).toJS();
    const app = yield select(getAppFromState);
    const infractionsESID = getEntitySetIdFromApp(app, INFRACTIONS.toString());

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
        .map((infraction :Map) => infraction.get('neighborDetails')));

    const infractionCountMap :Map = infractionsMap.map((infractions :List) => {
      const infractionCount = { warnings: 0, violations: 0 };
      infractions.forEach((infraction :Map) => {
        if (infraction.getIn([TYPE, 0]) === INFRACTIONS_CONSTS.WARNING) {
          infractionCount.warnings += 1;
        }
        if (infraction.getIn([TYPE, 0]) === INFRACTIONS_CONSTS.VIOLATION) {
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
    const participantEKIDs = participants.map((participant :Map) => participant.getIn([OPENLATTICE_ID_FQN, 0])).toJS();
    const sentenceTermESID = getEntitySetIdFromApp(app, SENTENCE_TERM.toString());
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
        .map((term :Map) => term.get('neighborDetails'))
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
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE.toString());

    if (sentences.count() > 0) {

      const integratedSentencesEKIDs :string[] = sentences
        .map((sentence :Map) => sentence
          .getIn([OPENLATTICE_ID_FQN, 0]))
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
        .map(person => person.get('neighborDetails'))
        .toList();

      const manualSentencesEKIDs :string[] = sentences
        .map((sentence :Map) => sentence
          .getIn([OPENLATTICE_ID_FQN, 0]))
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
        .map(person => person.get('neighborDetails'))
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
    const sentenceESID = getEntitySetIdFromApp(app, SENTENCES.toString());
    const sentenceConditionsPTID = getPropertyTypeIdFromApp(app, SENTENCES.toString(), SENTENCE_CONDITIONS.toString());
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

    const manualSentenceESID = getEntitySetIdFromApp(app, MANUAL_SENTENCES.toString());
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
