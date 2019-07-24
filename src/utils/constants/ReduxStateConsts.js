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
  APP_SETTINGS_ID: 'appSettingsEntitySetId',
  APP_TYPES: 'appTypes',
  ENTITY_SETS_BY_ORG: 'entitySetsByOrganization',
  FQN_TO_ID: 'fqnsToEntitySetIds',
  INITIALIZE_APPLICATION: 'initializeApplication',
  ERRORS: 'errors',
  LOADING: 'isLoadingApp',
  LOAD_APP: 'loadApp',
  ORGS: 'organizations',
  PRIMARY_KEYS: 'primaryKeys',
  PROPERTY_TYPES: 'propertyTypes',
  REQUEST_STATE: 'requestState',
  SELECTED_ORG_ID: 'selectedOrganizationId',
  SELECTED_ORG_TITLE: 'selectedOrganizationTitle',
  SELECTED_ORG_SETTINGS: 'selectedOrganizationSettings',
  SETTINGS_BY_ORG_ID: 'appSettingsByOrgId'
};

/* People */

export const PEOPLE = {
  ACTIONS: 'actions',
  ENROLLMENT_BY_PARTICIPANT: 'enrollmentByParticipant',
  ERRORS: 'errors',
  GET_ENROLLMENT_STATUSES: 'getEnrollmentStatuses',
  GET_HOURS_WORKED: 'getHoursWorked',
  GET_INFRACTIONS: 'getInfractions',
  GET_PARTICIPANTS: 'getParticipants',
  GET_SENTENCE_TERMS: 'getSentenceTerms',
  GET_SENTENCES: 'getSentences',
  HOURS_WORKED: 'hoursWorked',
  INFRACTIONS_BY_PARTICIPANT: 'infractionsByParticipant',
  INFRACTION_COUNTS_BY_PARTICIPANT: 'infractionCountsByParticipant',
  PARTICIPANTS: 'participants',
  REQUEST_STATE: 'requestState',
  SENTENCE_TERMS_BY_PARTICIPANT: 'sentenceTermsByParticipant',
  SENTENCE_EKIDS: 'sentenceEKIDs',
};

/* Person */

export const PERSON = {
  ACTIONS: 'actions',
  ADD_NEW_ENROLLMENT_STATUS: 'addNewEnrollmentStatus',
  ADDRESS: 'address',
  CASE_NUMBER: 'caseNumber',
  DIVERSION_PLAN: 'diversionPlan',
  EMAIL: 'email',
  ENROLLMENT_STATUS: 'enrollmentStatus',
  ERRORS: 'errors',
  GET_ALL_PARTICIPANT_INFO: 'getAllParticipantInfo',
  GET_CASE_INFO: 'getCaseInfo',
  GET_CONTACT_INFO: 'getContactInfo',
  GET_ENROLLMENT_STATUS: 'getEnrollmentStatus',
  GET_INFRACTIONS: 'getInfractions',
  GET_PARTICIPANT: 'getParticipant',
  GET_PARTICIPANT_ADDRESS: 'getParticipantAddress',
  GET_REQUIRED_HOURS: 'getRequiredHours',
  GET_SENTENCE_TERM: 'getSentenceTerm',
  PARTICIPANT: 'participant',
  PHONE: 'phone',
  REQUEST_STATE: 'requestState',
  REQUIRED_HOURS: 'requiredHours',
  SENTENCE_TERM: 'sentenceTerm',
  VIOLATIONS: 'violations',
  WARNINGS: 'warnings',
};

/* Worksites (and organizations) */

export const WORKSITES = {
  ACTIONS: 'actions',
  ADD_ORGANIZATION: 'addOrganization',
  ADD_WORKSITE: 'addWorksite',
  ERRORS: 'errors',
  GET_ORGANIZATIONS: 'getOrganizations',
  GET_WORKSITES: 'getWorksites',
  GET_WORKSITE_PLANS: 'getWorksitePlans',
  REQUEST_STATE: 'requestState',
  ORGANIZATION_STATUSES: 'organizationStatuses',
  ORGANIZATIONS_LIST: 'organizationsList',
  WORKSITES_BY_ORG: 'worksitesByOrg',
  WORKSITES_INFO: 'worksitesInfo',
};
