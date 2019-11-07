export const STATE = {
  APP: 'app',
  DATA: 'data',
  EDM: 'edm',
  INFRACTIONS: 'infractions',
  ORGANIZATION: 'organization',
  PEOPLE: 'people',
  PERSON: 'person',
  WORKSITES: 'worksites',
  WORKSITE_PLANS: 'worksitePlans',
  WORK_SCHEDULE: 'workSchedule',
};

/* App */

export const APP = {
  ACTIONS: 'actions',
  APP: 'app',
  ENTITY_SETS_BY_ORG: 'entitySetsByOrganization',
  FQN_TO_ID: 'fqnsToEntitySetIds',
  INITIALIZE_APPLICATION: 'initializeApplication',
  ERRORS: 'errors',
  ORGS: 'organizations',
  REQUEST_STATE: 'requestState',
  SELECTED_ORG_ID: 'selectedOrganizationId',
  SELECTED_ORG_TITLE: 'selectedOrganizationTitle',
  SWITCH_ORGANIZATION: 'switchOrganization',
};

/* Infractions */

export const PERSON_INFRACTIONS = {
  ACTIONS: 'actions',
  ADD_INFRACTION_EVENT: 'addInfractionEvent',
  DELETE_INFRACTION_EVENT: 'deleteInfractionEvent',
  EDIT_INFRACTION_EVENT: 'editInfractionEvent',
  GET_INFO_FOR_PRINT_INFRACTION: 'getInfoForPrintInfraction',
  GET_INFRACTION: 'getInfraction',
  GET_INFRACTION_TYPES: 'getInfractionTypes',
  INFRACTIONS_INFO: 'infractionsInfo',
  INFRACTION_EVENT: 'infractionEvent',
  INFRACTION_TYPE: 'infractionType',
  INFRACTION_TYPES: 'infractionTypes',
  REQUEST_STATE: 'requestState',
  VIOLATIONS: 'violations',
  WARNINGS: 'warnings',
};

/* People */

export const PEOPLE = {
  ACTIONS: 'actions',
  ADD_PARTICIPANT: 'addParticipant',
  COURT_TYPE_BY_PARTICIPANT: 'courtTypeByParticipant',
  CURRENT_DIVERSION_PLANS_BY_PARTICIPANT: 'currentDiversionPlansByParticipant',
  ENROLLMENT_BY_PARTICIPANT: 'enrollmentByParticipant',
  ERRORS: 'errors',
  GET_COURT_TYPE: 'getCourtType',
  GET_DIVERSION_PLANS: 'getDiversionPlans',
  GET_ENROLLMENT_STATUSES: 'getEnrollmentStatuses',
  GET_HOURS_WORKED: 'getHoursWorked',
  GET_INFRACTIONS: 'getInfractions',
  GET_PARTICIPANTS: 'getParticipants',
  HOURS_WORKED: 'hoursWorked',
  INFRACTIONS_BY_PARTICIPANT: 'infractionsByParticipant',
  INFRACTION_COUNTS_BY_PARTICIPANT: 'infractionCountsByParticipant',
  PARTICIPANTS: 'participants',
  REQUEST_STATE: 'requestState',
};

/* Person */

export const PERSON = {
  ACTIONS: 'actions',
  ADDRESS: 'address',
  ADD_NEW_DIVERSION_PLAN_STATUS: 'addNewDiversionPlanStatus',
  ADD_NEW_PARTICIPANT_CONTACTS: 'addNewParticipantContacts',
  ADD_ORIENTATION_DATE: 'addOrientationDate',
  ADD_PERSON_PHOTO: 'addPersonPhoto',
  ADD_TO_AVAILABLE_CHARGES: 'addToAvailableCharges',
  ALL_DIVERSION_PLANS: 'allDiversionPlans',
  ALL_PARTICIPANT_CASES: 'allParticipantCases',
  CHARGES: 'charges',
  CHARGES_FOR_CASE: 'chargesForCase',
  CREATE_NEW_ENROLLMENT: 'createNewEnrollment',
  DIVERSION_PLAN: 'diversionPlan',
  EDIT_CHECK_IN_DATE: 'editCheckInDate',
  EDIT_ENROLLMENT_DATES: 'editEnrollmentDates',
  EDIT_PARTICIPANT_CONTACTS: 'editParticipantContacts',
  EDIT_PERSON_CASE: 'editPersonCase',
  EDIT_PERSON_DETAILS: 'editPersonDetails',
  EDIT_PERSON_NOTES: 'editPersonNotes',
  EDIT_PLAN_NOTES: 'editPlanNotes',
  EDIT_REQUIRED_HOURS: 'editRequiredHours',
  EDIT_SENTENCE_DATE: 'editSentenceDate',
  EMAIL: 'email',
  ENROLLMENT_STATUS: 'enrollmentStatus',
  ERRORS: 'errors',
  GET_ALL_PARTICIPANT_INFO: 'getAllParticipantInfo',
  GET_CASE_INFO: 'getCaseInfo',
  GET_CHARGES: 'getCharges',
  GET_CHARGES_FOR_CASE: 'getChargesForCase',
  GET_CONTACT_INFO: 'getContactInfo',
  GET_ENROLLMENT_FROM_DIVERSION_PLAN: 'getEnrollmentFromDiversionPlan',
  GET_ENROLLMENT_STATUS: 'getEnrollmentStatus',
  GET_INFO_FOR_EDIT_CASE: 'getInfoForEditCase',
  GET_INFO_FOR_EDIT_PERSON: 'getInfoForEditPerson',
  GET_JUDGES: 'getJudges',
  GET_JUDGE_FOR_CASE: 'getJudgeForCase',
  GET_PARTICIPANT: 'getParticipant',
  GET_PARTICIPANT_ADDRESS: 'getParticipantAddress',
  GET_PARTICIPANT_CASES: 'getParticipantCases',
  GET_PERSON_PHOTO: 'getPersonPhoto',
  GET_PROGRAM_OUTCOME: 'getProgramOutcome',
  GET_REQUIRED_HOURS: 'getRequiredHours',
  JUDGE: 'judge',
  JUDGES: 'judges',
  JUDGES_BY_CASE: 'judgesByCase',
  MARK_DIVERSION_PLAN_AS_COMPLETE: 'markDiversionPlanAsComplete',
  PARTICIPANT: 'participant',
  PERSON_CASE: 'personCase',
  PERSON_PHOTO: 'personPhoto',
  PHONE: 'phone',
  PROGRAM_OUTCOME: 'programOutcome',
  REASSIGN_JUDGE: 'reassignJudge',
  REMOVE_CHARGE_FROM_CASE: 'removeChargeFromCase',
  REQUEST_STATE: 'requestState',
  REQUIRED_HOURS: 'requiredHours',
  UPDATE_PERSON_PHOTO: 'updatePersonPhoto',
};

/* Print Participant */

export const PRINT_PARTICIPANT = {
  ACTIONS: 'actions',
  GET_INFO_FOR_PRINT_INFRACTION: 'getInfoForPrintInfraction',
  REQUEST_STATE: 'requestState',
};

/* Work Schedule */

export const WORK_SCHEDULE = {
  ACTIONS: 'actions',
  APPOINTMENTS: 'appointments',
  DELETE_APPOINTMENT: 'deleteAppointment',
  FIND_APPOINTMENTS: 'findAppointments',
  GET_WORKSITE_AND_PERSON_NAMES: 'getWorksiteAndPersonNames',
  REQUEST_STATE: 'requestState',
  PERSON_BY_APPOINTMENT_EKID: 'personByAppointmentEKID',
  WORKSITE_NAMES_BY_APPOINTMENT_EKID: 'worksiteNamesByAppointmentEKID',
};

/* Worksite Plans */
export const WORKSITE_PLANS = {
  ACTIONS: 'actions',
  ADD_WORKSITE_PLAN: 'addWorksitePlan',
  CHECK_INS_BY_APPOINTMENT: 'checkInsByAppointment',
  CHECK_IN_FOR_APPOINTMENT: 'checkInForAppointment',
  CREATE_WORK_APPOINTMENTS: 'createWorkAppointments',
  DELETE_APPOINTMENT: 'deleteAppointment',
  EDIT_APPOINTMENT: 'editAppointment',
  EDIT_WORKSITE_PLAN: 'editWorksitePlan',
  GET_APPOINTMENT_CHECK_INS: 'getAppointmentCheckIns',
  GET_WORKSITE_BY_WORKSITE_PLAN: 'getWorksiteByWorksitePlan',
  GET_WORKSITE_PLANS: 'getWorksitePlans',
  GET_WORKSITE_PLAN_STATUSES: 'getWorksitePlanStatuses',
  GET_WORK_APPOINTMENTS: 'getWorkAppointments',
  REQUEST_STATE: 'requestState',
  UPDATE_HOURS_WORKED: 'updateHoursWorked',
  WORKSITES_BY_WORKSITE_PLAN: 'worksitesByWorksitePlan',
  WORKSITE_PLANS_LIST: 'worksitePlansList',
  WORKSITE_PLAN_STATUSES: 'worksitePlanStatuses',
  WORK_APPOINTMENTS_BY_WORKSITE_PLAN: 'workAppointmentsByWorksitePlan',
};

/* Worksites (and organizations) */

export const WORKSITES = {
  ACTIONS: 'actions',
  ADD_ORGANIZATION: 'addOrganization',
  ADD_WORKSITE: 'addWorksite',
  ADD_WORKSITE_ADDRESS: 'addWorksiteAddress',
  ADD_WORKSITE_CONTACT_AND_ADDRESS: 'addWorksiteContactAndAddress',
  CONTACT_EMAIL: 'contactEmail',
  CONTACT_PERSON: 'contactPerson',
  CONTACT_PHONE: 'contactPhone',
  CREATE_WORKSITE_SCHEDULE: 'createWorksiteSchedule',
  EDIT_WORKSITE: 'editWorksite',
  EDIT_WORKSITE_ADDRESS: 'editWorksiteAddress',
  EDIT_WORKSITE_CONTACT_AND_ADDRESS: 'editWorksiteContactAndAddress',
  GET_ORGANIZATIONS: 'getOrganizations',
  GET_WORKSITE: 'getWorksite',
  GET_WORKSITES: 'getWorksites',
  GET_WORKSITES_BY_ORG: 'getWorksitesByOrg',
  GET_WORKSITE_ADDRESS: 'getWorksiteAddress',
  GET_WORKSITE_CONTACT: 'getWorksiteContact',
  GET_WORKSITE_PLANS: 'getWorksitePlans',
  GET_WORKSITE_SCHEDULE: 'getWorksiteSchedule',
  ORGANIZATIONS_LIST: 'organizationsList',
  ORGANIZATION_STATUSES: 'organizationStatuses',
  REQUEST_STATE: 'requestState',
  SCHEDULE_BY_WEEKDAY: 'scheduleByWeekday',
  SCHEDULE_FOR_FORM: 'scheduleForForm',
  WORKSITE: 'worksite',
  WORKSITES_BY_ORG: 'worksitesByOrg',
  WORKSITES_INFO: 'worksitesInfo',
  WORKSITES_LIST: 'worksitesList',
  WORKSITE_ADDRESS: 'worksiteAddress',
};
