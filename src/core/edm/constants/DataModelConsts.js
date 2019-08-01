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
export const NEIGHBOR_DETAILS = 'neighborDetails';
export const NEIGHBOR_ENTITY_SET = 'neighborEntitySet';

/* Miscellaneous Constants */
export const CWP = 'Community Work Program';

export const ENROLLMENT_STATUSES = {
  ACTIVE: 'Active',
  ACTIVE_NONCOMPLIANT: 'Active noncompliant',
  ACTIVE_REOPENED: 'Active reopened',
  AWAITING_CHECKIN: 'Awaiting check-in',
  AWAITING_ORIENTATION: 'Awaiting orientation',
  CLOSED: 'Closed',
  COMPLETED: 'Completed',
  NO_SHOW: 'No show',
  REMOVED_NONCOMPLIANT: 'Removed noncompliant'
};

export const HOURS_CONSTS = {
  REQUIRED: 'required',
  WORKED: 'worked'
};

export const INFRACTIONS_CONSTS = {
  VIOLATION: 'Violation',
  WARNING: 'Warning'
};
