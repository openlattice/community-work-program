/*
 * @flow
 */

import { Models } from 'lattice';

const { FullyQualifiedName } = Models;

export const APP_TYPE_FQNS = {
  APP_SETTINGS: new FullyQualifiedName('app.settings'),
  APPEARS_IN: new FullyQualifiedName('app.appearsin'),
  APPOINTMENT: new FullyQualifiedName('app.appointment'),
  ASSESSED_BY: new FullyQualifiedName('app.assessedby'),
  CHARGED_WITH: new FullyQualifiedName('app.chargedwith'),
  CONTACT_INFO_GIVEN: new FullyQualifiedName('app.contactinfogiven'),
  CONTACT_INFORMATION: new FullyQualifiedName('app.contactinformation'),
  COURT_PRETRIAL_CASES: new FullyQualifiedName('app.courtpretrialcases'),
  EDITED_BY: new FullyQualifiedName('app.editedby'),
  JUDGES: new FullyQualifiedName('app.judges'),
  LOCATION: new FullyQualifiedName('app.location'),
  MANUAL_PRETRIAL_CASES: new FullyQualifiedName('app.manualpretrialcases'),
  MANUAL_SENTENCES: new FullyQualifiedName('app.manualsentences'),
  ORGANIZATION: new FullyQualifiedName('app.organization'),
  PEOPLE: new FullyQualifiedName('app.people'),
  PROGRAM_OUTCOME: new FullyQualifiedName('app.programoutcome'),
  REGISTERED_FOR: new FullyQualifiedName('app.registeredfor'),
  REMINDER_SENT: new FullyQualifiedName('app.remindersent'),
  SENTENCE_TERM: new FullyQualifiedName('app.sentenceterm'),
  SENTENCED_WITH: new FullyQualifiedName('app.sentencedwith'),
  SENTENCES: new FullyQualifiedName('app.sentences'),
  STAFF: new FullyQualifiedName('app.staff'),
  WORKS_AT: new FullyQualifiedName('app.worksat'),
  WORKSITE: new FullyQualifiedName('app.worksite'),
};
