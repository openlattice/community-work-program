/*
 * @flow
 */

import { all, fork } from '@redux-saga/core/effects';
import { AuthSagas } from 'lattice-auth';
import { DataApiSagas, SearchApiSagas } from 'lattice-sagas';

import * as AppSagas from '../../containers/app/AppSagas';
import * as ChargesSagas from '../../containers/participant/charges/ChargesSagas';
import * as DataSagas from './data/DataSagas';
import * as EDMSagas from '../edm/EDMSagas';
import * as InfractionsSagas from '../../containers/participant/infractions/InfractionsSagas';
import * as ParticipantSagas from '../../containers/participant/ParticipantSagas';
import * as ParticipantsSagas from '../../containers/participants/ParticipantsSagas';
import * as PrintParticipantSagas from '../../containers/participant/print/PrintParticipantSagas';
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

    // ChargesSagas
    fork(ChargesSagas.addArrestChargesWatcher),
    fork(ChargesSagas.addCourtChargesToCaseWatcher),
    fork(ChargesSagas.addToAvailableArrestChargesWatcher),
    fork(ChargesSagas.addToAvailableCourtChargesWatcher),
    fork(ChargesSagas.getArrestCasesAndChargesFromPSAWatcher),
    fork(ChargesSagas.getArrestChargesLinkedToCWPWatcher),
    fork(ChargesSagas.getArrestChargesWatcher),
    fork(ChargesSagas.getCourtChargesForCaseWatcher),
    fork(ChargesSagas.getCourtChargesWatcher),
    fork(ChargesSagas.removeArrestChargeWatcher),
    fork(ChargesSagas.removeCourtChargeFromCaseWatcher),

    // DataSagas
    fork(DataSagas.createOrReplaceAssociationWatcher),
    fork(DataSagas.deleteEntitiesWatcher),
    fork(DataSagas.submitDataGraphWatcher),
    fork(DataSagas.submitPartialReplaceWatcher),

    // EDMSagas
    fork(EDMSagas.getEntityDataModelTypesWatcher),

    // InfractionsSagas
    fork(InfractionsSagas.addInfractionWatcher),
    fork(InfractionsSagas.deleteInfractionEventWatcher),
    fork(InfractionsSagas.editInfractionEventWatcher),
    fork(InfractionsSagas.getInfractionWatcher),
    fork(InfractionsSagas.getInfractionTypesWatcher),
    fork(InfractionsSagas.getParticipantInfractionsWatcher),

    // ParticipantSagas
    fork(ParticipantSagas.addNewDiversionPlanStatusWatcher),
    fork(ParticipantSagas.addNewParticipantContactsWatcher),
    fork(ParticipantSagas.addPersonPhotoWatcher),
    fork(ParticipantSagas.createCaseWatcher),
    fork(ParticipantSagas.createNewEnrollmentWatcher),
    fork(ParticipantSagas.editEnrollmentDatesWatcher),
    fork(ParticipantSagas.editParticipantContactsWatcher),
    fork(ParticipantSagas.editPersonCaseWatcher),
    fork(ParticipantSagas.editPersonDetailsWatcher),
    fork(ParticipantSagas.editPersonNotesWatcher),
    fork(ParticipantSagas.editPlanNotesWatcher),
    fork(ParticipantSagas.editRequiredHoursWatcher),
    fork(ParticipantSagas.getAllParticipantInfoWatcher),
    fork(ParticipantSagas.getCaseInfoWatcher),
    fork(ParticipantSagas.getContactInfoWatcher),
    fork(ParticipantSagas.getEnrollmentHistoryWatcher),
    fork(ParticipantSagas.getEnrollmentFromDiversionPlanWatcher),
    fork(ParticipantSagas.getEnrollmentStatusWatcher),
    fork(ParticipantSagas.getInfoForAddParticipantWatcher),
    fork(ParticipantSagas.getInfoForEditCaseWatcher),
    fork(ParticipantSagas.getInfoForEditPersonWatcher),
    fork(ParticipantSagas.getJudgeForCaseWatcher),
    fork(ParticipantSagas.getJudgesWatcher),
    fork(ParticipantSagas.getParticipantAddressWatcher),
    fork(ParticipantSagas.getParticipantWatcher),
    fork(ParticipantSagas.getProgramOutcomeWatcher),
    fork(ParticipantSagas.markDiversionPlanAsCompleteWatcher),
    fork(ParticipantSagas.reassignJudgeWatcher),
    fork(ParticipantSagas.updatePersonPhotoWatcher),

    // ParticipantsSagas
    fork(ParticipantsSagas.addParticipantWatcher),
    fork(ParticipantsSagas.getCourtTypeWatcher),
    fork(ParticipantsSagas.getDiversionPlansWatcher),
    fork(ParticipantsSagas.getEnrollmentStatusesWatcher),
    fork(ParticipantsSagas.getHoursWorkedWatcher),
    fork(ParticipantsSagas.getInfractionsWatcher),
    fork(ParticipantsSagas.getParticipantsWatcher),

    // PrintParticipantSagas
    fork(PrintParticipantSagas.getInfoForPrintInfractionWatcher),

    // WorkScheduleSagas
    fork(WorkScheduleSagas.findAppointmentsWatcher),
    fork(WorkScheduleSagas.getPersonCourtTypeWatcher),
    fork(WorkScheduleSagas.getWorksiteAndPersonNamesWatcher),

    // WorksitesSagas
    fork(WorksitesSagas.addOrganizationWatcher),
    fork(WorksitesSagas.addWorksiteWatcher),
    fork(WorksitesSagas.addWorksiteAddressWatcher),
    fork(WorksitesSagas.addWorksiteContactsWatcher),
    fork(WorksitesSagas.createWorksiteScheduleWatcher),
    fork(WorksitesSagas.deleteWorksiteContactWatcher),
    fork(WorksitesSagas.editWorksiteWatcher),
    fork(WorksitesSagas.editWorksiteAddressWatcher),
    fork(WorksitesSagas.editWorksiteContactWatcher),
    fork(WorksitesSagas.getOrganizationsWatcher),
    fork(WorksitesSagas.getWorksiteWatcher),
    fork(WorksitesSagas.getWorksiteAddressWatcher),
    fork(WorksitesSagas.getWorksiteContactsWatcher),
    fork(WorksitesSagas.getWorksiteScheduleWatcher),
    fork(WorksitesSagas.getWorksitesWatcher),
    fork(WorksitesSagas.getWorksitePlansWatcher),
    fork(WorksitesSagas.getWorksitesByOrgWatcher),

    // WorksitePlanSagas
    fork(WorksitePlanSagas.addWorksitePlanWatcher),
    fork(WorksitePlanSagas.checkInForAppointmentWatcher),
    fork(WorksitePlanSagas.createWorkAppointmentsWatcher),
    fork(WorksitePlanSagas.deleteAppointmentWatcher),
    fork(WorksitePlanSagas.deleteCheckInWatcher),
    fork(WorksitePlanSagas.editAppointmentWatcher),
    fork(WorksitePlanSagas.editWorksitePlanWatcher),
    fork(WorksitePlanSagas.getAppointmentCheckInsWatcher),
    fork(WorksitePlanSagas.getWorkAppointmentsWatcher),
    fork(WorksitePlanSagas.getWorksiteByWorksitePlanWatcher),
    fork(WorksitePlanSagas.getWorksitePlanStatusesWatcher),
    fork(WorksitePlanSagas.getWorksitePlansWatcher),
    fork(WorksitePlanSagas.updateHoursWorkedWatcher),

    // RoutingSagas
    fork(RoutingSagas.goToRootWatcher),
    fork(RoutingSagas.goToRouteWatcher),
  ]);
}
