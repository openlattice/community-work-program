/*
 * @flow
 */

import { all, fork } from '@redux-saga/core/effects';
import { AuthSagas } from 'lattice-auth';
import { DataApiSagas, SearchApiSagas } from 'lattice-sagas';

import * as AppSagas from '../../containers/app/AppSagas';
import * as EDMSagas from '../edm/EDMSagas';
import * as ParticipantsSagas from '../../containers/participants/ParticipantsSagas';
import * as RoutingSagas from '../router/RoutingSagas';

export default function* sagas() :Generator<*, *, *> {

  yield all([
    // "lattice-auth" sagas
    fork(AuthSagas.watchAuthAttempt),
    fork(AuthSagas.watchAuthSuccess),
    fork(AuthSagas.watchAuthFailure),
    fork(AuthSagas.watchAuthExpired),
    fork(AuthSagas.watchLogout),

    // Lattice-Sagas
    fork(DataApiSagas.createEntityAndAssociationDataWatcher),
    fork(SearchApiSagas.searchEntityNeighborsWithFilterWatcher),

    // AppSagas
    fork(AppSagas.initializeApplicationWatcher),
    fork(AppSagas.loadAppWatcher),

    // EDMSagas
    fork(EDMSagas.getEntityDataModelTypesWatcher),
    fork(EDMSagas.getEntitySetIdsWatcher),

    // ParticipantsSagas
    fork(ParticipantsSagas.getEnrollmentStatusesWatcher),
    fork(ParticipantsSagas.findCommunityServiceSentencesWatcher),
    fork(ParticipantsSagas.getInfractionsWatcher),
    fork(ParticipantsSagas.getParticipantsWatcher),
    fork(ParticipantsSagas.getSentencesWatcher),

    // RoutingSagas
    fork(RoutingSagas.goToRootWatcher),
    fork(RoutingSagas.goToRouteWatcher),
  ]);
}
