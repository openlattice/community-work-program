/*
 * @flow
 */

import { all, fork } from '@redux-saga/core/effects';
import { AuthSagas } from 'lattice-auth';
import { DataApiSagas, SearchApiSagas } from 'lattice-sagas';

import * as AppSagas from '../../containers/app/AppSagas';
import * as DataSagas from './data/DataSagas';
import * as EDMSagas from '../edm/EDMSagas';
import * as InfractionsSagas from '../../containers/participant/infractions/InfractionsSagas';
import * as ParticipantSagas from '../../containers/participant/ParticipantSagas';
import * as ParticipantScheduleSagas from '../../containers/participant/schedule/ParticipantScheduleSagas';
import * as ParticipantsSagas from '../../containers/participants/ParticipantsSagas';
import * as RoutingSagas from '../router/RoutingSagas';
import * as WorkScheduleSagas from '../../containers/workschedule/WorkScheduleSagas';
import * as WorksitePlanSagas from '../../containers/participant/assignedworksites/WorksitePlanSagas';
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
    fork(DataSagas.createOrReplaceAssociationWatcher),
    fork(DataSagas.deleteEntitiesWatcher),
    fork(DataSagas.submitDataGraphWatcher),
    fork(DataSagas.submitPartialReplaceWatcher),

    // EDMSagas
    fork(EDMSagas.getEntityDataModelTypesWatcher),

    // InfractionsSagas
    fork(InfractionsSagas.addInfractionWatcher),
    fork(InfractionsSagas.getInfractionTypesWatcher),
    fork(InfractionsSagas.getParticipantInfractionsWatcher),

    // ParticipantSagas
    fork(ParticipantSagas.addChargesToCaseWatcher),
    fork(ParticipantSagas.addNewDiversionPlanStatusWatcher),
    fork(ParticipantSagas.addNewParticipantContactsWatcher),
    fork(ParticipantSagas.addToAvailableChargesWatcher),
    fork(ParticipantSagas.editEnrollmentDatesWatcher),
    fork(ParticipantSagas.editParticipantContactsWatcher),
    fork(ParticipantSagas.editPersonCaseWatcher),
    fork(ParticipantSagas.editPersonDetailsWatcher),
    fork(ParticipantSagas.editPersonNotesWatcher),
    fork(ParticipantSagas.editPlanNotesWatcher),
    fork(ParticipantSagas.editRequiredHoursWatcher),
    fork(ParticipantSagas.getAllParticipantInfoWatcher),
    fork(ParticipantSagas.getCaseInfoWatcher),
    fork(ParticipantSagas.getChargesWatcher),
    fork(ParticipantSagas.getChargesForCaseWatcher),
    fork(ParticipantSagas.getContactInfoWatcher),
    fork(ParticipantSagas.getEnrollmentStatusWatcher),
    fork(ParticipantSagas.getInfoForEditCaseWatcher),
    fork(ParticipantSagas.getInfoForEditPersonWatcher),
    fork(ParticipantSagas.getJudgeForCaseWatcher),
    fork(ParticipantSagas.getJudgesWatcher),
    fork(ParticipantSagas.getParticipantAddressWatcher),
    fork(ParticipantSagas.getParticipantWatcher),
    fork(ParticipantSagas.getProgramOutcomeWatcher),
    fork(ParticipantSagas.markDiversionPlanAsCompleteWatcher),
    fork(ParticipantSagas.reassignJudgeWatcher),
    fork(ParticipantSagas.removeChargeFromCaseWatcher),

    // ParticipantScheduleSagas
    fork(ParticipantScheduleSagas.checkInForAppointmentWatcher),
    fork(ParticipantScheduleSagas.createWorkAppointmentsWatcher),
    fork(ParticipantScheduleSagas.deleteAppointmentWatcher),
    fork(ParticipantScheduleSagas.editAppointmentWatcher),
    fork(ParticipantScheduleSagas.getAppointmentCheckInsWatcher),
    fork(ParticipantScheduleSagas.getWorkAppointmentsWatcher),

    // ParticipantsSagas
    fork(ParticipantsSagas.addParticipantWatcher),
    fork(ParticipantsSagas.getCourtTypeWatcher),
    fork(ParticipantsSagas.getDiversionPlansWatcher),
    fork(ParticipantsSagas.getEnrollmentStatusesWatcher),
    fork(ParticipantsSagas.getHoursWorkedWatcher),
    fork(ParticipantsSagas.getInfractionsWatcher),
    fork(ParticipantsSagas.getParticipantsWatcher),

    // WorkScheduleSagas
    fork(WorkScheduleSagas.findAppointmentsWatcher),
    fork(WorkScheduleSagas.getWorksiteAndPersonNamesWatcher),

    // WorksitesSagas
    fork(WorksitesSagas.addOrganizationWatcher),
    fork(WorksitesSagas.addWorksiteWatcher),
    fork(WorksitesSagas.getOrganizationsWatcher),
    fork(WorksitesSagas.getWorksitesWatcher),
    fork(WorksitesSagas.getWorksitePlansWatcher),
    fork(WorksitesSagas.getWorksitesByOrgWatcher),

    // WorksitePlanSagas
    fork(WorksitePlanSagas.addWorksitePlanWatcher),
    fork(WorksitePlanSagas.editWorksitePlanWatcher),
    fork(WorksitePlanSagas.getWorksiteByWorksitePlanWatcher),
    fork(WorksitePlanSagas.getWorksitePlansWatcher),
    fork(WorksitePlanSagas.getWorksitePlanStatusesWatcher),
    fork(WorksitePlanSagas.updateHoursWorkedWatcher),

    // RoutingSagas
    fork(RoutingSagas.goToRootWatcher),
    fork(RoutingSagas.goToRouteWatcher),
  ]);
}
