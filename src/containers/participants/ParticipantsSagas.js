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
import { Constants, Models } from 'lattice';
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
} from './ParticipantsActions';
import { getEntitySetIdFromApp, getPropertyTypeIdFromApp } from '../../utils/AppUtils';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS, ENROLLMENT_STATUS_FQNS, HAS_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { isDefined } from '../../utils/LangUtils';

const { createEntityAndAssociationData, getEntitySetData } = DataApiActions;
const { createEntityAndAssociationDataWorker, getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const { OPENLATTICE_ID_FQN } = Constants;
const { DataGraphBuilder } = Models;
const {
  ENROLLMENT_STATUS,
  HAS,
  INFRACTIONS,
  MANUAL_SENTENCES,
  PEOPLE,
  SENTENCES,
} = APP_TYPE_FQNS;
const { STATUS } = ENROLLMENT_STATUS_FQNS;
const { DATETIME_COMPLETED } = HAS_FQNS;

const getAppFromState = state => state.get(STATE.APP, Map());

const LOG = new Logger('StudySagas');

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
 * ParticipantsActions.getParticipants()
 *
 */

function* getParticipantsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id } = action;
  let response :Object = {};
  let participants :List = List();
  try {
    yield put(getParticipants.request(id));
    const app = yield select(getAppFromState);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE.toString());
    // console.log('peopleESID: ', peopleESID);
    // console.log('esid: ', getEntitySetIdFromApp(app, APP_TYPE_FQNS.INFRACTIONS.toString()));

    response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: peopleESID }));
    if (response.error) {
      throw response.error;
    }
    participants = fromJS(response.data);
    console.log('PARTICIPANTS: ', participants.toJS());

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

export {
  getEnrollmentStatusesWorker,
  getEnrollmentStatusesWatcher,
  getInfractionsWorker,
  getInfractionsWatcher,
  getParticipantsWatcher,
  getParticipantsWorker,
  getSentencesWorker,
  getSentencesWatcher,
};
