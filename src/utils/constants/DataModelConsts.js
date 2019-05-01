/*
 * @flow
 */
import { Models } from 'lattice';

const { FullyQualifiedName } = Models;

export const APP_NAME = 'communityworkprogram';

export const ORG_IDS = {
  DEMO_ORG: '1d5aa1f4-4d22-46a5-97cd-dcc6820e7ff8',
};

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

export const PROPERTY_TYPE_FQNS = {
  OL_ID_FQN: new FullyQualifiedName('ol.id'),
};
