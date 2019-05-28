/*
 * @flow
 */

import { Models } from 'lattice';

const { FullyQualifiedName } = Models;

export const APP_TYPE_FQNS = {
  // ADDRESSES: new FullyQualifiedName('app.addresses'),
  APP_SETTINGS: new FullyQualifiedName('app.settings'),
  APPEARS_IN: new FullyQualifiedName('app.appearsin'),
  APPOINTMENT: new FullyQualifiedName('app.appointment'),
  ASSESSED_BY: new FullyQualifiedName('app.assessedby'),
  ASSIGNED_TO: new FullyQualifiedName('app.assignedto'),
  // BASED_ON: new FullyQualifiedName('app.basedon'),
  CHARGED_WITH: new FullyQualifiedName('app.chargedwith'),
  CHECK_INS: new FullyQualifiedName('app.checkins'),
  CONTACT_INFO_GIVEN: new FullyQualifiedName('app.contactinfogiven'),
  CONTACT_INFORMATION: new FullyQualifiedName('app.contactinformation'),
  COURT_PRETRIAL_CASES: new FullyQualifiedName('app.courtpretrialcases'),
  DIVERSION_PLAN: new FullyQualifiedName('app.diversionplan'),
  EDITED_BY: new FullyQualifiedName('app.editedby'),
  ELIGIBLE_FOR: new FullyQualifiedName('app.eligiblefor'),
  ENROLLMENT_STATUS: new FullyQualifiedName('app.enrollmentstatus'),
  HAS: new FullyQualifiedName('app.has'),
  // INCLUDES: new FullyQualifiedName('app.includes'),
  INFRACTIONS: new FullyQualifiedName('app.infractions'),
  JUDGES: new FullyQualifiedName('app.judges'),
  // LOCATED_AT: new FullyQualifiedName('app.locatedat'),
  LOCATION: new FullyQualifiedName('app.location'),
  MANUAL_PRETRIAL_CASES: new FullyQualifiedName('app.manualpretrialcases'),
  MANUAL_SENTENCES: new FullyQualifiedName('app.manualsentences'),
  OF_LENGTH: new FullyQualifiedName('app.oflength'),
  ORGANIZATION: new FullyQualifiedName('app.organization'),
  PEOPLE: new FullyQualifiedName('app.people'),
  PROGRAM_OUTCOME: new FullyQualifiedName('app.programoutcome'),
  REGISTERED_FOR: new FullyQualifiedName('app.registeredfor'),
  // RELATED_TO: new FullyQualifiedName('app.relatedto'),
  REMINDER_SENT: new FullyQualifiedName('app.remindersent'),
  // REPORTED: new FullyQualifiedName('app.reported'),
  RESULTS_IN: new FullyQualifiedName('app.resultsin'),
  SENTENCE_TERM: new FullyQualifiedName('app.sentenceterm'),
  SENTENCED_WITH: new FullyQualifiedName('app.sentencedwith'),
  SENTENCES: new FullyQualifiedName('app.sentences'),
  SUBJECT_OF: new FullyQualifiedName('app.subjectof'),
  STAFF: new FullyQualifiedName('app.staff'),
  WORKS_AT: new FullyQualifiedName('app.worksat'),
  WORKSITE: new FullyQualifiedName('app.worksite'),
  // WORKSITE_PLAN: new FullyQualifiedName('app.worksiteplan'),
};

export const PROPERTY_TYPE_FQNS = {
  OL_ID_FQN: new FullyQualifiedName('ol.id'),
};
