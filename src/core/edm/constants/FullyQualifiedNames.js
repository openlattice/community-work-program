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
  INCARCERATION_DAYS: new FullyQualifiedName('justice.incarcerationdays'),
  INCARCERATION_MONTHS: new FullyQualifiedName('justice.incarcerationmonths'),
  INCARCERATION_START_DATE: new FullyQualifiedName('justice.incarcerationstartdate'),
  INCARCERATION_YEARS: new FullyQualifiedName('justice.incarcerationyears'),
};

/* ol.notification */
export const INFRACTION_FQNS = {
  CATEGORY: new FullyQualifiedName('ol.category'),
  DATETIME: new FullyQualifiedName('general.datetime'),
  DESCRIPTION: new FullyQualifiedName('ol.description'),
  TYPE: new FullyQualifiedName('ol.type'),
};

/* ol.enrollment */
export const ENROLLMENT_STATUS_FQNS = {
  DATETIME_END: new FullyQualifiedName('ol.datetimeend'),
  EFFECTIVE_DATE: new FullyQualifiedName('ol.effectivedate'),
  STATUS: new FullyQualifiedName('ol.status'),
};

/* ol.has */
export const HAS_FQNS = {
  DATETIME_COMPLETED: new FullyQualifiedName('date.completeddatetime'),
};
