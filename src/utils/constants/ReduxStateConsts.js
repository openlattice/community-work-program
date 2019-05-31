export const STATE = {
  APP: 'app',
  PEOPLE: 'people',
};

/* App */

export const APP = {
  ACTIONS: 'actions',
  APP: 'app',
  APP_TYPES: 'appTypes',
  ENTITY_SETS_BY_ORG: 'entitySetsByOrganization',
  FQN_TO_ID: 'fqnsToEntitySetIds',
  ERRORS: 'errors',
  LOADING: 'isLoadingApp',
  LOAD_APP: 'loadApp',
  ORGS: 'organizations',
  PRIMARY_KEYS: 'primaryKeys',
  PROPERTY_TYPES: 'propertyTypes',
  SELECTED_ORG_ID: 'selectedOrganizationId',
  SELECTED_ORG_TITLE: 'selectedOrganizationTitle',
  APP_SETTINGS_ID: 'appSettingsEntitySetId',
  SELECTED_ORG_SETTINGS: 'selectedOrganizationSettings',
  SETTINGS_BY_ORG_ID: 'appSettingsByOrgId'
};

/* People */

export const PEOPLE = {
  ACTIONS: 'actions',
  ENROLLMENT_BY_PARTICIPANT: 'enrollmentByParticipant',
  ERRORS: 'errors',
  GET_ENROLLMENT_STATUSES: 'getEnrollmentStatuses',
  GET_INFRACTIONS: 'getInfractions',
  GET_PARTICIPANTS: 'getParticipants',
  GET_SENTENCES: 'getSentences',
  INFRACTIONS_BY_PARTICIPANT: 'infractionsByParticipant',
  INFRACTION_COUNTS_BY_PARTICIPANT: 'infractionCountsByParticipant',
  PARTICIPANTS: 'participants',
  REQUEST_STATE: 'requestState',
  SENTENCES: 'sentences',
};
