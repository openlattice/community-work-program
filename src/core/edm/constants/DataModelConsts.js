/*
 * @flow
 */

/* App-level Constants */

export const APP_NAME = 'communityworkprogram';

export const ORG_IDS = {
  CWP_DEMO_ORG: '030c9cc56d7e4388be54e148f27b3f01',
  OL_DEMO_ORG: '1d5aa1f4-4d22-46a5-97cd-dcc6820e7ff8',
};

/* EDM Constants */

export const TYPE_IDS_BY_FQNS = 'typeIdsByFqn';
export const TYPES_BY_ID = 'typesById';
export const ASSOCIATION_ENTITY_SET = 'associationEntitySet';
export const ASSOCIATION_DETAILS = 'associationDetails';
export const NEIGHBOR_DETAILS = 'neighborDetails';
export const NEIGHBOR_ENTITY_SET = 'neighborEntitySet';
export const SEARCH_PREFIX = 'entity';

/* Demographics */
export const RACE_VALUES = [
  'White',
  'Black or African American',
  'American Indian or Alaska Native',
  'Asian',
  'Native Hawaiian or Other Pacific Islander',
  'Other Not Specified',
  'Unknown',
];

export const ETHNICITY_VALUES = [
  'Hispanic or Latino',
  'Not Hispanic or Latino'
];

export const SEX_VALUES = [
  'Female',
  'Male',
  'Unknown'
];

/* Miscellaneous Constants */
export const CWP = 'Community Work Program';

export const COURT_TYPES = [
  'Sentenced',
  'Child Support',
  'Probation',
  'Mental Health Court',
  'DUI Court',
  'Drug Court',
  'Veterans Court',
  'HOPE Probation',
];

export const ENROLLMENT_STATUSES = {
  ACTIVE: 'Active',
  ACTIVE_REOPENED: 'Active Reopened',
  AWAITING_CHECKIN: 'Awaiting Check-in',
  AWAITING_ORIENTATION: 'Awaiting Orientation',
  CLOSED: 'Closed',
  COMPLETED: 'Completed',
  JOB_SEARCH: 'Job Search',
  REMOVED_NONCOMPLIANT: 'Removed Noncompliant',
  SUCCESSFUL: 'Successful',
  UNSUCCESSFUL: 'Unsuccessful',
};

export const WORKSITE_ENROLLMENT_STATUSES = {
  ACTIVE: 'Active',
  CANCELED: 'Canceled',
  COMPLETED: 'Completed',
  ON_HOLD: 'On hold',
  PLANNED: 'Planned'
};

export const HOURS_CONSTS = {
  REQUIRED: 'required',
  WORKED: 'worked'
};

export const INFRACTIONS_CONSTS = {
  VIOLATION: 'Violation',
  WARNING: 'Warning'
};

export const CONTACT_METHODS = {
  EMAIL: 'Email',
  PHONE: 'Phone'
};

export const USA_STATES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY'
];
