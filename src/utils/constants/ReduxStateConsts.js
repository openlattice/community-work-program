export const STATE = {
  APP: 'app',
  EDM: 'edm',
  PEOPLE: 'people',
  PERSON: 'person',
};

/* App */

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
  ADDRESS: 'address',
  CASE_NUMBER: 'caseNumber',
  EMAIL: 'email',
  ERRORS: 'errors',
  GET_CASE_INFO: 'getCaseInfo',
  GET_CONTACT_INFO: 'getContactInfo',
  GET_PARTICIPANT: 'getParticipant',
  GET_PARTICIPANT_ADDRESS: 'getParticipantAddress',
  PARTICIPANT: 'participant',
  PHONE: 'phone',
  REQUEST_STATE: 'requestState',
};
