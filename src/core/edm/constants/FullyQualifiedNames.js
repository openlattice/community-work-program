/*
 * @flow
 */

import { Models } from 'lattice';

const { FullyQualifiedName } = Models;

export const APP_TYPE_FQNS = {
  APP_SETTINGS: new FullyQualifiedName('app.settings'),
  APPEARS_IN: new FullyQualifiedName('app.appearsin'),
  APPOINTMENT: new FullyQualifiedName('app.appointment'), // delete?
  ASSESSED_BY: new FullyQualifiedName('app.assessedby'),
  // BASED_ON: new FullyQualifiedName('app.basedon'),
  CHARGED_WITH: new FullyQualifiedName('app.chargedwith'),
  // CHECK_IN: new FullyQualifiedName('app.checkin'),
  CONTACT_INFO_GIVEN: new FullyQualifiedName('app.contactinfogiven'),
  CONTACT_INFORMATION: new FullyQualifiedName('app.contactinformation'),
  // CONTACTED_VIA: new FullyQualifiedName('app.contactedvia'),
  COURT_PRETRIAL_CASES: new FullyQualifiedName('app.courtpretrialcases'),
  // DIVERSION_PLAN: new FullyQualifiedName('app.diversionplan'),
  EDITED_BY: new FullyQualifiedName('app.editedby'),
  // ENROLLMENT_STATUS: new FullyQualifiedName('app.enrollmentstatus'),
  // ELIGIBLE_FOR: new FullyQualifiedName('app.eligiblefor'),
  // HAS: new FullyQualifiedName('has'),
  // INFRACTION: new FullyQualifiedName('app.infraction'),
  JUDGES: new FullyQualifiedName('app.judges'),
  // LOCATED_AT: new FullyQualifiedName('app.locatedat'),
  LOCATION: new FullyQualifiedName('app.location'),
  MANUAL_PRETRIAL_CASES: new FullyQualifiedName('app.manualpretrialcases'), // delete
  MANUAL_SENTENCES: new FullyQualifiedName('app.manualsentences'), // delete
  // OF_LENGTH: new FullyQualifiedName('app.oflength'),
  ORGANIZATION: new FullyQualifiedName('app.organization'),
  PEOPLE: new FullyQualifiedName('app.people'),
  // PROGRAM: new FullyQualifiedName('app.program'),
  PROGRAM_OUTCOME: new FullyQualifiedName('app.programoutcome'),
  REGISTERED_FOR: new FullyQualifiedName('app.registeredfor'),
  REMINDER_SENT: new FullyQualifiedName('app.remindersent'),
  // RESULTS_IN: new FullyQualifiedName('app.resultsin'),
  // SCHEDULE: new FullyQualifiedName('app.schedule'),
  SENTENCE_TERM: new FullyQualifiedName('app.sentenceterm'),
  SENTENCED_WITH: new FullyQualifiedName('app.sentencedwith'),
  SENTENCES: new FullyQualifiedName('app.sentences'),
  STAFF: new FullyQualifiedName('app.staff'), // should be type generalcontactedvia.person
  WORKS_AT: new FullyQualifiedName('app.worksat'),
  WORKSITE: new FullyQualifiedName('app.worksite'),
  // WORKSITE_PLAN: new FullyQualifiedName('app.worksiteplan'),
};

export const PEOPLE_FQNS = {
  FIRST_NAME: 'nc.PersonGivenName',
  MIDDLE_NAME: 'nc.PersonMiddleName',
  LAST_NAME: 'nc.PersonSurName',
  SSN: 'nc.SSN',
  SUFFIX: 'nc.PersonSuffix',
  DOB: 'nc.PersonBirthDate',
  BIRTH_YEAR: 'ol.birthyear',
  BIRTH_MONTH: 'ol.birthmonth',
  NICKNAME: 'im.PersonNickName',
  RACE: 'nc.PersonRace',
  ETHNICITY: 'nc.PersonEthnicity',
  SEX: 'nc.PersonSex',
  STATE_ID_NUMBER: 'person.stateidnumber',
  MUGSHOT: 'publicsafety.mugshot',
  MARITAL_STATUS: 'person.maritalstatus',
  STATE_OF_ID: 'person.stateidstate',
  HAIR_COLOR: 'nc.PersonHairColorText',
  WEIGHT: 'nc.PersonWeightMeasure',
  EYE_COLOR: 'nc.PersonEyeColorText',
  XREF: 'justice.xref',
  BIRTH_PLACE: 'nc.PersonBirthPlace',
  SEX_OFFENDER: 'j.SentenceRegisterSexOffenderIndicator',
  HEIGHT: 'nc.PersonHeightMeasure',
  PERSON_TYPE: 'criminaljustice.persontype',
  PICTURE: 'person.picture',
  COMPLEXION: 'nc.complexion',
  UPDATED_AT: 'housing.updatedat',
  PERSON_ID: 'nc.SubjectIdentification',
  NOTES: 'housing.notes',
  ID_TYPE: 'ol.idtype',
  GENDER: 'bhr.gender',
  ISSUING_JURISDICTION: 'ol.idjurisdiction',
  ID_NUMBER: 'ol.idnumber',
  NUMBER_DATA_SOURCES: 'ol.numsourcesfoundin',
  DATA_SOURCE: 'ol.datasource',
  DEATH_DATETIME: 'ol.deathdatetime',
  FULL_NAME: 'general.fullname',
};

// const ASSOCIATION_ENTITY_TYPE_FQNS = {};
// const ENTITY_TYPE_FQNS = {};

export const PROPERTY_TYPE_FQNS = {
  OL_ID_FQN: new FullyQualifiedName('ol.id'),
};
