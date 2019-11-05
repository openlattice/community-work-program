/*
 * @flow
 */

import { Constants, Models } from 'lattice';
import type { FQN } from 'lattice';

const { FullyQualifiedName } = Models;

const { OPENLATTICE_ID_FQN } = Constants;
export const ENTITY_KEY_ID :FQN = OPENLATTICE_ID_FQN;

// NOTE: adding the ":Object" annotation to effectively turns off hundreds of these annoying flow errors
// 2019-11-04 - Cannot assign computed property using `FullyQualifiedName` [1].
export const APP_TYPE_FQNS :Object = {
  ADDRESS: new FullyQualifiedName('app.address'),
  ADDRESSES: new FullyQualifiedName('app.addresses'),
  APPEARS_IN: new FullyQualifiedName('app.appearsin'),
  APPROVED_BY: new FullyQualifiedName('app.approvedby'),
  APPOINTMENT: new FullyQualifiedName('app.appointment'),
  APP_SETTINGS: new FullyQualifiedName('app.settings'),
  ASSIGNED_TO: new FullyQualifiedName('app.assignedto'),
  BASED_ON: new FullyQualifiedName('app.basedon'),
  CHARGE_EVENT: new FullyQualifiedName('app.chargeevent'),
  CHARGED_WITH: new FullyQualifiedName('app.chargedwith'),
  CHECK_INS: new FullyQualifiedName('app.checkins'),
  CHECK_IN_DETAILS: new FullyQualifiedName('app.checkindetails'),
  CONTACT_INFORMATION: new FullyQualifiedName('app.contactinformation'),
  CONTACT_INFO_GIVEN: new FullyQualifiedName('app.contactinfogiven'),
  COURT_CHARGE_LIST: new FullyQualifiedName('publicsafety.courtchargelist'),
  COURT_PRETRIAL_CASES: new FullyQualifiedName('app.courtpretrialcases'),
  DIVERSION_PLAN: new FullyQualifiedName('app.diversionplan'),
  EMPLOYEE: new FullyQualifiedName('app.employee'),
  EMPLOYED_BY: new FullyQualifiedName('app.employedby'),
  EMPLOYMENT: new FullyQualifiedName('app.employment'),
  ENROLLMENT_STATUS: new FullyQualifiedName('app.enrollmentstatus'),
  FULFILLS: new FullyQualifiedName('app.fulfills'),
  HAS: new FullyQualifiedName('app.has'),
  IMAGE: new FullyQualifiedName('app.image'),
  INFRACTIONS: new FullyQualifiedName('app.infractions'),
  IS: new FullyQualifiedName('app.is'),
  IS_PICTURE_OF: new FullyQualifiedName('app.ispictureof'),
  INFRACTION_EVENT: new FullyQualifiedName('app.infractionevent'),
  JUDGES: new FullyQualifiedName('app.judges'),
  LIVES_AT: new FullyQualifiedName('app.livesat'),
  LOCATED_AT: new FullyQualifiedName('app.locatedat'),
  MANUAL_CHARGED_WITH: new FullyQualifiedName('app.manualchargedwith'),
  MANUAL_COURT_CHARGES: new FullyQualifiedName('app.manualcourtcharges'),
  MANUAL_PRETRIAL_COURT_CASES: new FullyQualifiedName('app.manualpretrialcourtcases'),
  MANUAL_SENTENCED_WITH: new FullyQualifiedName('app.manualsentencedwith'),
  OF_LENGTH: new FullyQualifiedName('app.oflength'),
  OPERATES: new FullyQualifiedName('app.operates'),
  ORGANIZATION: new FullyQualifiedName('app.organization'),
  PART_OF: new FullyQualifiedName('app.partof'),
  PEOPLE: new FullyQualifiedName('app.people'),
  PRESIDES_OVER: new FullyQualifiedName('app.presidesover'),
  PROGRAM_OUTCOME: new FullyQualifiedName('app.programoutcome'),
  REGISTERED_FOR: new FullyQualifiedName('app.registeredfor'),
  RELATED_TO: new FullyQualifiedName('app.relatedto'),
  REMINDER_SENT: new FullyQualifiedName('app.remindersent'),
  REPORTED: new FullyQualifiedName('app.reported'),
  RESULTS_IN: new FullyQualifiedName('app.resultsin'),
  STAFF: new FullyQualifiedName('app.staff'),
  SUBJECT_OF: new FullyQualifiedName('app.subjectof'),
  WARRANT_REQUEST: new FullyQualifiedName('app.warrantrequest'),
  WORKS_AT: new FullyQualifiedName('app.worksat'),
  WORKSITE: new FullyQualifiedName('app.worksite'),
  WORKSITE_PLAN: new FullyQualifiedName('app.worksiteplan'),
};

/* DateTime FQNs */
export const DATETIME :FQN = new FullyQualifiedName('general.datetime');
export const DATETIME_COMPLETED :FQN = new FullyQualifiedName('date.completeddatetime');
export const DATETIME_END :FQN = new FullyQualifiedName('ol.datetimeend');
export const DATETIME_START :FQN = new FullyQualifiedName('ol.datetimestart');
export const INCIDENT_START_DATETIME :FQN = new FullyQualifiedName('incident.startdatetime');

/* Property Type FQNs by Entity Type */

/* geo.address */
export const ADDRESS_FQNS :Object = {
  FULL_ADDRESS: new FullyQualifiedName('location.Address'),
};

/* publicsafety.pretrialstatuscaseprocessings */
export const CASE_FQNS :Object = {
  CASE_NUMBER_TEXT: new FullyQualifiedName('j.CaseNumberText'),
  COURT_CASE_TYPE: new FullyQualifiedName('justice.courtcasetype'),
};

/* justice.charge */
export const CHARGE_FQNS :Object = {
  NAME: new FullyQualifiedName('ol.name'),
  OL_ID: new FullyQualifiedName('ol.id'),
  VIOLENT: new FullyQualifiedName('ol.violent'),
};

/* ol.encounter */
export const CHECK_IN_FQNS :Object = {
  CHECKED_IN: new FullyQualifiedName('ol.checkedin'),
};

/* ol.contactinformation */
export const CONTACT_INFO_FQNS :Object = {
  CELL_PHONE: new FullyQualifiedName('contact.cellphone'),
  EMAIL: new FullyQualifiedName('staff.email'),
  PHONE_NUMBER: new FullyQualifiedName('contact.phonenumber'),
  PREFERRED: new FullyQualifiedName('ol.preferred'),
};

/* ol.diversionplan */
export const DIVERSION_PLAN_FQNS :Object = {
  CHECK_IN_DATETIME: new FullyQualifiedName('ol.checkindatetime'),
  COMPLETED: new FullyQualifiedName('ol.completed'),
  CONCURRENT: new FullyQualifiedName('ol.concurrent'),
  CONSECUTIVE: new FullyQualifiedName('ol.consecutive'),
  DATETIME_RECEIVED: new FullyQualifiedName('datetime.received'),
  NAME: new FullyQualifiedName('ol.name'),
  NOTES: new FullyQualifiedName('ol.notes'),
  ORIENTATION_DATETIME: new FullyQualifiedName('ol.orientationdatetime'),
  REQUIRED_HOURS: new FullyQualifiedName('ol.requiredhours'),
  REQUIRED_HOURS_TEXT: new FullyQualifiedName('ol.requiredhourstext'),
};

/* ol.employee */
export const EMPLOYEE_FQNS :Object = {
  TITLE: new FullyQualifiedName('person.title'),
};

/* ol.enrollment */
export const ENROLLMENT_STATUS_FQNS :Object = {
  DATETIME_END: new FullyQualifiedName('ol.datetimeend'),
  EFFECTIVE_DATE: new FullyQualifiedName('ol.effectivedate'),
  STATUS: new FullyQualifiedName('ol.status'),
};

/* ol.image */
export const IMAGE_FQNS :Object = {
  IMAGE_DATA: new FullyQualifiedName('ol.imagedata')
};

/* ol.notification */
export const INFRACTION_FQNS :Object = {
  CATEGORY: new FullyQualifiedName('ol.category'),
  DATETIME: new FullyQualifiedName('general.datetime'),
  DESCRIPTION: new FullyQualifiedName('ol.description'),
  TYPE: new FullyQualifiedName('ol.type'),
};

/* ol.notificationevent */
export const INFRACTION_EVENT_FQNS :Object = {
  NOTES: new FullyQualifiedName('ol.notes'),
  TYPE: new FullyQualifiedName('ol.type'),
};

/* ol.organization */
export const ORGANIZATION_FQNS :Object = {
  DESCRIPTION: new FullyQualifiedName('ol.description'),
  ORGANIZATION_NAME: new FullyQualifiedName('ol.organizationname'),
};

/* general.person */
export const PEOPLE_FQNS :Object = {
  DOB: new FullyQualifiedName('nc.PersonBirthDate'),
  ETHNICITY: new FullyQualifiedName('nc.PersonEthnicity'),
  FIRST_NAME: new FullyQualifiedName('nc.PersonGivenName'),
  GENDER: new FullyQualifiedName('bhr.gender'),
  LAST_NAME: new FullyQualifiedName('nc.PersonSurName'),
  MIDDLE_NAME: new FullyQualifiedName('nc.PersonMiddleName'),
  MUGSHOT: new FullyQualifiedName('publicsafety.mugshot'),
  PERSON_NOTES: new FullyQualifiedName('housing.notes'),
  PICTURE: new FullyQualifiedName('person.picture'),
  RACE: new FullyQualifiedName('nc.PersonRace'),
  SEX: new FullyQualifiedName('nc.PersonSex'),
  SSN: new FullyQualifiedName('nc.SSN'),
};

/* ol.programoutcome */
export const PROGRAM_OUTCOME_FQNS :Object = {
  COMPLETED: new FullyQualifiedName('ol.completed'),
  DESCRIPTION: new FullyQualifiedName('ol.description'),
  HOURS_WORKED: new FullyQualifiedName('ol.hoursworked'),
};


/* ol.program */
export const WORKSITE_FQNS :Object = {
  DATETIME_END: new FullyQualifiedName('ol.datetimeend'),
  DATETIME_START: new FullyQualifiedName('ol.datetimestart'),
  DESCRIPTION: new FullyQualifiedName('ol.description'),
  NAME: new FullyQualifiedName('ol.name'),
};

/* ol.individualactivityplan */
export const WORKSITE_PLAN_FQNS :Object = {
  HOURS_WORKED: new FullyQualifiedName('ol.hoursworked'),
  REQUIRED_HOURS: new FullyQualifiedName('ol.requiredhours'),
};
