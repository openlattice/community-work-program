export const STATE = {
  APP: 'app',
  PEOPLE: 'people',
  ORGANIZATION: 'organization',
  WORKSITES: 'worksites',
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

// Organization

export const ORGANIZATION = {
  ACTIONS: 'actions',
  ERRORS: 'errors',
  GET_ORGANIZATION: 'getOrganization',
  IS_FETCHING_ORGANIZATION: 'isFetchingOrganization',
  SELECTED_ORGANIZATION: 'selectedOrganization',
};

// Organizations and Worksites

export const WORKSITES = {
  ACTIONS: 'actions',
  ERRORS: 'errors',
  GET_ORGANIZATIONS: 'getOrganizations',
  GET_ORGANIZATION_WORKSITES: 'getOrganizationWorksites',
  IS_FETCHING_ORGANIZATIONS: 'isFetchingOrganizations',
  IS_FETCHING_WORKSITES: 'isFetchingWorksites',
  ORGANIZATIONS: 'organizations',
  WORKSITES_BY_ORGANIZATION: 'worksitesByOrganization',
};
