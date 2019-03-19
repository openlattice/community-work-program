export const STATE = {
  APP: 'app',
  PEOPLE: 'people',
};

// App

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

// People

export const PEOPLE = {
  SCORES_ENTITY_SET_ID: 'scoresEntitySetId',
  RESULTS: 'peopleResults',
  PERSON_DATA: 'selectedPersonData',
  PERSON_ENTITY_KEY_ID: 'selectedPersonEntityKeyId',
  FETCHING_PEOPLE: 'isFetchingPeople',
  FETCHING_PERSON_DATA: 'isFetchingPersonData',
  NEIGHBORS: 'neighbors',
  REFRESHING_PERSON_NEIGHBORS: 'refreshingPersonNeighbors',
  MOST_RECENT_PSA: 'mostRecentPSA',
  MOST_RECENT_PSA_NEIGHBORS: 'mostRecentPSANeighbors',
  REQUIRES_ACTION_PEOPLE: 'requiresActionPeople',
  REQUIRES_ACTION_SCORES: 'requiresActionPSAScores',
  NO_PENDING_CHARGES_PSA_SCORES: 'psaScoresWithNoPendingCharges',
  RECENT_FTA_PSA_SCORES: 'psaScoresWithRecentFTAs',
  REQUIRES_ACTION_NEIGHBORS: 'requiresActionPeopleNeighbors',
  PSA_NEIGHBORS_BY_ID: 'psaNeighborsById',
  MULTIPLE_PSA_PEOPLE: 'peopleWithMultiplePSAs',
  RECENT_FTA_PEOPLE: 'peopleWithRecentFTAs',
  NO_PENDING_CHARGES_PEOPLE: 'peopleWithNoPendingCharges',
  REQUIRES_ACTION_LOADING: 'loadingRequiresActionPeople'
};
