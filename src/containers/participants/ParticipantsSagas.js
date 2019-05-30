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
  GET_INFRACTIONS,
  getInfractions,
  GET_PARTICIPANTS,
  getParticipants,
  GET_SENTENCES,
  getSentences,
  FIND_COMMUNITY_SERVICE_SENTENCES,
  findCommunityServiceSentences,
} from './ParticipantsActions';
import { getEntitySetIdFromApp, getPropertyTypeIdFromApp } from '../../utils/AppUtils';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import {
  APP_TYPE_FQNS,
  ENROLLMENT_STATUS_FQNS,
  HAS_FQNS,
  SENTENCE_FQNS
} from '../../core/edm/constants/FullyQualifiedNames';
import { isDefined } from '../../utils/LangUtils';

const { createEntityAndAssociationData, getEntitySetData } = DataApiActions;
const { createEntityAndAssociationDataWorker, getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter, searchEntitySetData } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker, searchEntitySetDataWorker } = SearchApiSagas;
const { OPENLATTICE_ID_FQN } = Constants;

const {
  ENROLLMENT_STATUS,
  HAS,
  INFRACTIONS,
  MANUAL_SENTENCES,
  PEOPLE,
  SENTENCES,
} = APP_TYPE_FQNS;
const { STATUS } = ENROLLMENT_STATUS_FQNS;
const { SENTENCE_CONDITIONS } = SENTENCE_FQNS;

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
    console.log('participantEKIDs: ', participantEKIDs);
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
    console.log('first enrollmentMap ', enrollmentMap.toJS());

    /*
     * 3. For each participant without an enrollment status, create one. These are "new", unenrolled participants.
     */
    const hasESID :string = getEntitySetIdFromApp(app, HAS.toString());
    const participantsWithoutEnrollmentStatus :string[] = participantEKIDs
      .filter(ekid => !isDefined(enrollmentMap.get(ekid)));
    console.log('participantsWithoutEnrollmentStatus: ', participantsWithoutEnrollmentStatus);

    const statusTypeId = getPropertyTypeIdFromApp(app, ENROLLMENT_STATUS.toString(), STATUS.toString());
    console.log('statusTypeId: ', statusTypeId);

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
            [statusTypeId]: ['planned']
          }]
        }
      };
      console.log('enrollment: ', enrollment);
      return call(createEntityAndAssociationDataWorker, createEntityAndAssociationData(enrollment));
    }));
    if (response.error) {
      throw response.error;
    }

    console.log('response from createEntityAndAssociationData ', response);

    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: peopleESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }

    enrollmentMap = fromJS(response.data).map((status :Map) => status.getIn([0, 'neighborDetails']));
    console.log('second enrollmentMap ', enrollmentMap.toJS());

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

    // console.log('infractionsMap: ', infractionsMap.toJS());

    yield put(getInfractions.success(id, infractionsMap));
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
 * ParticipantsActions.getSentences()
 *
 */

function* getSentencesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (value === null || value === undefined) {
    yield put(getSentences.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }
  let response :Object = {};
  try {
    yield put(getSentences.request(id));

    const { participants, peopleESID } = value;
    const participantEKIDs = participants.map((participant :Map) => participant.getIn([OPENLATTICE_ID_FQN, 0])).toJS();

    const app = yield select(getAppFromState);
    const sentenceESID = getEntitySetIdFromApp(app, SENTENCES.toString());
    const manualSentenceESID = getEntitySetIdFromApp(app, MANUAL_SENTENCES.toString());

    const searchFilter = {
      entityKeyIds: participantEKIDs,
      destinationEntitySetIds: [sentenceESID, manualSentenceESID],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: peopleESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    const sentencesMap :Map = fromJS(response.data);
    // console.log('sentencesMap ', sentencesMap.toJS());

    yield put(getSentences.success(id, sentencesMap));
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
    const { sentences, sentenceESID } = value;
    const app = yield select(getAppFromState);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE.toString());
    // console.log('peopleESID: ', peopleESID)
    // console.log('esid: ', getEntitySetIdFromApp(app, APP_TYPE_FQNS.INFRACTIONS.toString()));

    // response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: peopleESID }));
    // if (response.error) {
    //   throw response.error;
    // }
    // participants = fromJS(response.data);
    // console.log('participants in getParticipants: ', participants.toJS());

    if (sentences.count() > 0) {
      const sentenceEKIDs :string[] = sentences.map((sentence :Map) => sentence.getIn([OPENLATTICE_ID_FQN, 0])).toJS();

      const searchFilter = {
        entityKeyIds: sentenceEKIDs,
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
      console.log('response in getParticipants: ', response);

      participants = fromJS(response.data);
    }

    if (participants.count() > 0) {
      yield call(getSentencesWorker, getSentences({ participants, peopleESID }));
      yield call(getEnrollmentStatusesWorker, getEnrollmentStatuses({ participants, peopleESID }));
      yield call(getInfractionsWorker, getInfractions({ participants, peopleESID }));
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

  return participants;
}

function* getParticipantsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PARTICIPANTS, getParticipantsWorker);
}

/*
 *
 * ParticipantsActions.getSentences()
 *
 */

function* findCommunityServiceSentencesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id } = action;
  let response :Object = {};
  try {
    yield put(findCommunityServiceSentences.request(id));

    /*
     * 1. Do advanced search for sentences with sentences conditions including "community service".
     */
    const app = yield select(getAppFromState);
    const sentenceESID = getEntitySetIdFromApp(app, SENTENCES.toString());

    response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: sentenceESID }));
    if (response.error) {
      throw response.error;
    }
    console.log('sentences: ', response);


    const sentenceConditionsPTID = getPropertyTypeIdFromApp(app, SENTENCES.toString(), SENTENCE_CONDITIONS.toString());
    const searchOptions = {
      searchFields: [{
        searchTerm: 'COMMUNITY SERVICE',
        property: sentenceConditionsPTID,
        exact: true,
      }],
      start: 0,
      maxHits: 10000,
    };
    response = yield call(searchEntitySetDataWorker, searchEntitySetData({ entitySetId: sentenceESID, searchOptions }));
    console.log('response in findCommunityServiceSentences: ', response);
    if (response.error) {
      throw response.error;
    }
    const sentences = fromJS(response.data.hits);

    /*
     * 2. Get all participants associated with sentences found.
     */
    yield call(getParticipantsWorker, getParticipants({ sentences, sentenceESID }));

    yield put(findCommunityServiceSentences.success(id, {}));
  }
  catch (error) {
    LOG.error('caught exception in findCommunityServiceSentencesWorker()', error);
    yield put(findCommunityServiceSentences.failure(id, error));
  }
  finally {
    yield put(findCommunityServiceSentences.finally(id));
  }
}

function* findCommunityServiceSentencesWatcher() :Generator<*, *, *> {

  yield takeEvery(FIND_COMMUNITY_SERVICE_SENTENCES, findCommunityServiceSentencesWorker);
}

export {
  findCommunityServiceSentencesWatcher,
  findCommunityServiceSentencesWorker,
  getEnrollmentStatusesWorker,
  getEnrollmentStatusesWatcher,
  getInfractionsWorker,
  getInfractionsWatcher,
  getParticipantsWatcher,
  getParticipantsWorker,
  getSentencesWorker,
  getSentencesWatcher,
};
