export const STATE = {
  APP: 'app',
  DATA: 'data',
  EDM: 'edm',
  PEOPLE: 'people',
  PERSON: 'person',
  ORGANIZATION: 'organization',
  WORKSITES: 'worksites',
};

// App

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
};

/* People */

export const PEOPLE = {
  ACTIONS: 'actions',
  ADD_PARTICIPANT: 'addParticipant',
  ALL_DIVERSION_PLANS_BY_PARTICIPANT: 'allDiversionPlansByParticipant',
  CURRENT_DIVERSION_PLANS_BY_PARTICIPANT: 'currentDiversionPlansByParticipant',
  ENROLLMENT_BY_PARTICIPANT: 'enrollmentByParticipant',
  ERRORS: 'errors',
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
  ADD_INFRACTION_EVENT: 'addInfractionEvent',
  ADD_NEW_DIVERSION_PLAN_STATUS: 'addNewDiversionPlanStatus',
  ADD_ORIENTATION_DATE: 'addOrientationDate',
  ADD_WORKSITE_PLAN: 'addWorksitePlan',
  CHECK_IN_DATE: 'checkInDate',
  CHECK_INS_BY_APPOINTMENT: 'checkInsByAppointment',
  CHECK_IN_FOR_APPOINTMENT: 'checkInForAppointment',
  CREATE_WORK_APPOINTMENTS: 'createWorkAppointments',
  DIVERSION_PLAN: 'diversionPlan',
  EDIT_CHECK_IN_DATE: 'editCheckInDate',
  EDIT_SENTENCE_DATE: 'editSentenceDate',
  EMAIL: 'email',
  ENROLLMENT_STATUS: 'enrollmentStatus',
  ERRORS: 'errors',
  GET_ALL_PARTICIPANT_INFO: 'getAllParticipantInfo',
  GET_APPOINTMENT_CHECK_INS: 'getAppointmentCheckIns',
  GET_CASE_INFO: 'getCaseInfo',
  GET_CONTACT_INFO: 'getContactInfo',
  GET_ENROLLMENT_STATUS: 'getEnrollmentStatus',
  GET_INFRACTION_TYPES: 'getInfractionTypes',
  GET_PARTICIPANT: 'getParticipant',
  GET_PARTICIPANT_ADDRESS: 'getParticipantAddress',
  GET_REQUIRED_HOURS: 'getRequiredHours',
  GET_WORKSITE_PLANS: 'getWorksitePlans',
  GET_WORK_APPOINTMENTS: 'getWorkAppointments',
  INFRACTIONS_INFO: 'infractionsInfo',
  INFRACTION_TYPES: 'infractionTypes',
  PARTICIPANT: 'participant',
  PERSON_CASE: 'personCase',
  PHONE: 'phone',
  REQUEST_STATE: 'requestState',
  REQUIRED_HOURS: 'requiredHours',
  STATUS_WITH_CHECK_IN_DATE: 'statusWithCheckInDate',
  UPDATE_HOURS_WORKED: 'updateHoursWorked',
  VIOLATIONS: 'violations',
  WARNINGS: 'warnings',
  WORKSITES_BY_WORKSITE_PLAN: 'worksitesByWorksitePlan',
  WORKSITE_PLANS: 'worksitePlans',
  WORK_APPOINTMENTS_BY_WORKSITE_PLAN: 'workAppointmentsByWorksitePlan',
};

/* Worksites (and organizations) */

export const WORKSITES = {
  ACTIONS: 'actions',
  ADD_ORGANIZATION: 'addOrganization',
  ADD_WORKSITE: 'addWorksite',
  ERRORS: 'errors',
  GET_ORGANIZATIONS: 'getOrganizations',
  GET_WORKSITES: 'getWorksites',
  GET_WORKSITES_BY_ORG: 'getWorksitesByOrg',
  GET_WORKSITE_PLANS: 'getWorksitePlans',
  REQUEST_STATE: 'requestState',
  ORGANIZATION_STATUSES: 'organizationStatuses',
  ORGANIZATIONS_LIST: 'organizationsList',
  WORKSITES_BY_ORG: 'worksitesByOrg',
  WORKSITES_INFO: 'worksitesInfo',
  WORKSITES_LIST: 'worksitesList',
};
