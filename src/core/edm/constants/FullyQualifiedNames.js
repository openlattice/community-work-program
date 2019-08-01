/*
 * @flow
 */

import { Constants, Models } from 'lattice';

const { FullyQualifiedName } = Models;

const { OPENLATTICE_ID_FQN } = Constants;
export const ENTITY_KEY_ID = OPENLATTICE_ID_FQN;

export const APP_TYPE_FQNS = {
  APP_SETTINGS: new FullyQualifiedName('app.settings'),
  APPEARS_IN: new FullyQualifiedName('app.appearsin'),
  APPOINTMENT: new FullyQualifiedName('app.appointment'),
  ASSIGNED_TO: new FullyQualifiedName('app.assignedto'),
  BASED_ON: new FullyQualifiedName('app.basedon'),
  CHARGED_WITH: new FullyQualifiedName('app.chargedwith'),
  CHECK_INS: new FullyQualifiedName('app.checkins'),
  CONTACT_INFO_GIVEN: new FullyQualifiedName('app.contactinfogiven'),
  CONTACT_INFORMATION: new FullyQualifiedName('app.contactinformation'),
  COURT_CHARGES: new FullyQualifiedName('app.courtcharges'),
  COURT_PRETRIAL_CASES: new FullyQualifiedName('app.courtpretrialcases'),
  DIVERSION_PLAN: new FullyQualifiedName('app.diversionplan'),
  EDITED_BY: new FullyQualifiedName('app.editedby'),
  ENROLLMENT_STATUS: new FullyQualifiedName('app.enrollmentstatus'),
  FULFILLS: new FullyQualifiedName('app.fulfills'),
  HAS: new FullyQualifiedName('app.has'),
  INCLUDES: new FullyQualifiedName('app.includes'),
  INFRACTION_EVENT: new FullyQualifiedName('app.infractionevent'),
  INFRACTIONS: new FullyQualifiedName('app.infractions'),
  JUDGES: new FullyQualifiedName('app.judges'),
  LOCATED_AT: new FullyQualifiedName('app.locatedat'),
  LOCATION: new FullyQualifiedName('app.location'),
  MANUAL_PRETRIAL_CASES: new FullyQualifiedName('app.manualpretrialcases'),
  MANUAL_SENTENCED_WITH: new FullyQualifiedName('app.manualsentencedwith'),
  MANUAL_SENTENCES: new FullyQualifiedName('app.manualsentences'),
  OF_LENGTH: new FullyQualifiedName('app.oflength'),
  OPERATES: new FullyQualifiedName('app.operates'),
  ORGANIZATION: new FullyQualifiedName('app.organization'),
  PEOPLE: new FullyQualifiedName('app.people'),
  PROGRAM_OUTCOME: new FullyQualifiedName('app.programoutcome'),
  REGISTERED_FOR: new FullyQualifiedName('app.registeredfor'),
  RELATED_TO: new FullyQualifiedName('app.relatedto'),
  REMINDER_SENT: new FullyQualifiedName('app.remindersent'),
  REPORTED: new FullyQualifiedName('app.reported'),
  RESULTS_IN: new FullyQualifiedName('app.resultsin'),
  SENTENCE_TERM: new FullyQualifiedName('app.sentenceterm'),
  SENTENCED_WITH: new FullyQualifiedName('app.sentencedwith'),
  SENTENCES: new FullyQualifiedName('app.sentences'),
  SUBJECT_OF: new FullyQualifiedName('app.subjectof'),
  STAFF: new FullyQualifiedName('app.staff'),
  WORKSITE: new FullyQualifiedName('app.worksite'),
  WORKSITE_PLAN: new FullyQualifiedName('app.worksiteplan'),
};

/* DateTime FQNs */
export const DATETIME = new FullyQualifiedName('general.datetime');
export const DATETIME_COMPLETED = new FullyQualifiedName('date.completeddatetime');
export const DATETIME_START = new FullyQualifiedName('ol.datetimestart');
/* Property Type FQNs by Entity Type */

/* publicsafety.pretrialstatuscaseprocessings */
export const CASE_FQNS = {
  CASE_NUMBER_TEXT: new FullyQualifiedName('j.CaseNumberText'),
};

/* ol.contactinformation */
export const CONTACT_INFO_FQNS = {
  CELL_PHONE: new FullyQualifiedName('contact.cellphone'),
  EMAIL: new FullyQualifiedName('staff.email'),
  PHONE_NUMBER: new FullyQualifiedName('contact.phonenumber'),
  PREFERRED: new FullyQualifiedName('ol.preferred'),
};

/* ol.diversionplan */
export const DIVERSION_PLAN_FQNS = {
  COMPLETED: new FullyQualifiedName('ol.completed'),
  CONCURRENT: new FullyQualifiedName('ol.concurrent'),
  CONSECUTIVE: new FullyQualifiedName('ol.consecutive'),
  NAME: new FullyQualifiedName('ol.name'),
  NOTES: new FullyQualifiedName('ol.notes'),
  REQUIRED_HOURS: new FullyQualifiedName('ol.requiredhours'),
};

/* ol.enrollment */
export const ENROLLMENT_STATUS_FQNS = {
  DATETIME_END: new FullyQualifiedName('ol.datetimeend'),
  EFFECTIVE_DATE: new FullyQualifiedName('ol.effectivedate'),
  STATUS: new FullyQualifiedName('ol.status'),
};

/* ol.notification */
export const INFRACTION_FQNS = {
  CATEGORY: new FullyQualifiedName('ol.category'),
  DATETIME: new FullyQualifiedName('general.datetime'),
  DESCRIPTION: new FullyQualifiedName('ol.description'),
  TYPE: new FullyQualifiedName('ol.type'),
};

/* ol.location */
export const LOCATION_FQNS = {
  UNPARSED_ADDRESS: new FullyQualifiedName('location.address'),
};

/* ol.organization */
export const ORGANIZATION_FQNS = {
  DESCRIPTION: new FullyQualifiedName('ol.description'),
  ORGANIZATION_NAME: new FullyQualifiedName('ol.organizationname'),
};

/* general.person */
export const PEOPLE_FQNS = {
  FIRST_NAME: new FullyQualifiedName('nc.PersonGivenName'),
  MIDDLE_NAME: new FullyQualifiedName('nc.PersonMiddleName'),
  LAST_NAME: new FullyQualifiedName('nc.PersonSurName'),
  SSN: new FullyQualifiedName('nc.SSN'),
  DOB: new FullyQualifiedName('nc.PersonBirthDate'),
  AGE: new FullyQualifiedName('person.age'),
  RACE: new FullyQualifiedName('nc.PersonRace'),
  ETHNICITY: new FullyQualifiedName('nc.PersonEthnicity'),
  SEX: new FullyQualifiedName('nc.PersonSex'),
  STATE_ID_NUMBER: new FullyQualifiedName('person.stateidnumber'),
  MUGSHOT: new FullyQualifiedName('publicsafety.mugshot'),
  HAIR_COLOR: new FullyQualifiedName('nc.PersonHairColorText'),
  WEIGHT: new FullyQualifiedName('nc.PersonWeightMeasure'),
  EYE_COLOR: new FullyQualifiedName('nc.PersonEyeColorText'),
  SEX_OFFENDER: new FullyQualifiedName('j.SentenceRegisterSexOffenderIndicator'),
  HEIGHT: new FullyQualifiedName('nc.PersonHeightMeasure'),
  PICTURE: new FullyQualifiedName('person.picture'),
  PERSON_ID: new FullyQualifiedName('nc.SubjectIdentification'),
  ISSUING_JURISDICTION: new FullyQualifiedName('ol.idjurisdiction'),
  NOTES: new FullyQualifiedName('housing.notes'),
  GENDER: new FullyQualifiedName('bhr.gender'),
};

/* j.sentence */
export const SENTENCE_FQNS = {
  CONCURRENT_CONSECUTIVE: new FullyQualifiedName('justice.concurrentconsecutive'),
  SENTENCE_CONDITIONS: new FullyQualifiedName('justice.sentenceconditions'),
};

/* ol.sentenceterm */
export const SENTENCE_TERM_FQNS = {
  DATETIME_START: new FullyQualifiedName('ol.datetimestart'),
};

/* ol.program */
export const WORKSITE_FQNS = {
  DATETIME_END: new FullyQualifiedName('ol.datetimeend'),
  DATETIME_START: new FullyQualifiedName('ol.datetimestart'),
  DESCRIPTION: new FullyQualifiedName('ol.description'),
  NAME: new FullyQualifiedName('ol.name'),
};

/* ol.individualactivityplan */
export const WORKSITE_PLAN_FQNS = {
  HOURS_WORKED: new FullyQualifiedName('ol.hoursworked'),
  REQUIRED_HOURS: new FullyQualifiedName('ol.requiredhours'),
};
