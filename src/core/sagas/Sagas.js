/*
 * @flow
 */

import { all, fork } from '@redux-saga/core/effects';
import { AuthSagas } from 'lattice-auth';
import { DataApiSagas, SearchApiSagas } from 'lattice-sagas';

import * as AppSagas from '../../containers/app/AppSagas';
import * as DataSagas from './data/DataSagas';
import * as EDMSagas from '../edm/EDMSagas';
import * as ParticipantSagas from '../../containers/participant/ParticipantSagas';
import * as ParticipantsSagas from '../../containers/participants/ParticipantsSagas';
import * as RoutingSagas from '../router/RoutingSagas';
import * as WorksitesSagas from '../../containers/worksites/WorksitesSagas';

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
    fork(DataApiSagas.getEntitySetDataWatcher),
    fork(SearchApiSagas.searchEntityNeighborsWithFilterWatcher),
    fork(SearchApiSagas.searchEntitySetDataWatcher),

    // AppSagas
    fork(AppSagas.initializeApplicationWatcher),
    fork(AppSagas.switchOrganizationWatcher),

    // DataSagas
    fork(DataSagas.deleteEntitiesWatcher),
    fork(DataSagas.submitDataGraphWatcher),
    fork(DataSagas.submitPartialReplaceWatcher),

    // EDMSagas
    fork(EDMSagas.getEntityDataModelTypesWatcher),

    // ParticipantSagas
    fork(ParticipantSagas.addInfractionWatcher),
    fork(ParticipantSagas.addNewDiversionPlanStatusWatcher),
    fork(ParticipantSagas.addOrientationDateWatcher),
    fork(ParticipantSagas.addWorksitePlanWatcher),
    fork(ParticipantSagas.checkInForAppointmentWatcher),
    fork(ParticipantSagas.createWorkAppointmentsWatcher),
    fork(ParticipantSagas.deleteAppointmentWatcher),
    fork(ParticipantSagas.editCaseAndHoursWatcher),
    fork(ParticipantSagas.editCheckInDateWatcher),
    fork(ParticipantSagas.editPersonNotesWatcher),
    fork(ParticipantSagas.editPlanNotesWatcher),
    fork(ParticipantSagas.editSentenceDateWatcher),
    fork(ParticipantSagas.editWorksitePlanWatcher),
    fork(ParticipantSagas.getAppointmentCheckInsWatcher),
    fork(ParticipantSagas.getAllParticipantInfoWatcher),
    fork(ParticipantSagas.getCaseInfoWatcher),
    fork(ParticipantSagas.getContactInfoWatcher),
    fork(ParticipantSagas.getEnrollmentStatusWatcher),
    fork(ParticipantSagas.getInfractionTypesWatcher),
    // fork(ParticipantSagas.getParticipantAddressWatcher),
    fork(ParticipantSagas.getParticipantInfractionsWatcher),
    fork(ParticipantSagas.getParticipantWatcher),
    fork(ParticipantSagas.getWorkAppointmentsWatcher),
    fork(ParticipantSagas.getWorksiteByWorksitePlanWatcher),
    fork(ParticipantSagas.getWorksitePlansWatcher),
    fork(ParticipantSagas.getWorksitePlanStatusesWatcher),
    fork(ParticipantSagas.getProgramOutcomeWatcher),
    fork(ParticipantSagas.markDiversionPlanAsCompleteWatcher),

    // ParticipantsSagas
    fork(ParticipantsSagas.addParticipantWatcher),
    fork(ParticipantsSagas.getCourtTypeWatcher),
    fork(ParticipantsSagas.getDiversionPlansWatcher),
    fork(ParticipantsSagas.getEnrollmentStatusesWatcher),
    fork(ParticipantsSagas.getHoursWorkedWatcher),
    fork(ParticipantsSagas.getInfractionsWatcher),
    fork(ParticipantsSagas.getParticipantsWatcher),

    // WorksitesSagas
    fork(WorksitesSagas.addOrganizationWatcher),
    fork(WorksitesSagas.addWorksiteWatcher),
    fork(WorksitesSagas.getOrganizationsWatcher),
    fork(WorksitesSagas.getWorksitesWatcher),
    fork(WorksitesSagas.getWorksitePlansWatcher),
    fork(WorksitesSagas.getWorksitesByOrgWatcher),

    // RoutingSagas
    fork(RoutingSagas.goToRootWatcher),
    fork(RoutingSagas.goToRouteWatcher),
  ]);
}
