/*
 * @flow
 */

import { Constants, Models } from 'lattice';

const { FullyQualifiedName } = Models;

const { OPENLATTICE_ID_FQN } = Constants;
export const ENTITY_KEY_ID = OPENLATTICE_ID_FQN;

export const APP_TYPE_FQNS = {
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
  COURT_PRETRIAL_CASES: new FullyQualifiedName('app.courtpretrialcases'),
  DIVERSION_PLAN: new FullyQualifiedName('app.diversionplan'),
  EMPLOYEE: new FullyQualifiedName('app.employee'),
  EMPLOYED_BY: new FullyQualifiedName('app.employedby'),
  EMPLOYMENT: new FullyQualifiedName('app.employment'),
  ENROLLMENT_STATUS: new FullyQualifiedName('app.enrollmentstatus'),
  FULFILLS: new FullyQualifiedName('app.fulfills'),
  HAS: new FullyQualifiedName('app.has'),
  INFRACTIONS: new FullyQualifiedName('app.infractions'),
  IS: new FullyQualifiedName('app.is'),
  INFRACTION_EVENT: new FullyQualifiedName('app.infractionevent'),
  JUDGES: new FullyQualifiedName('app.judges'),
  LIVES_AT: new FullyQualifiedName('app.livesat'),
  LOCATED_AT: new FullyQualifiedName('app.locatedat'),
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
  WORKSITE: new FullyQualifiedName('app.worksite'),
  WORKSITE_PLAN: new FullyQualifiedName('app.worksiteplan'),
};

/* DateTime FQNs */
export const DATETIME = new FullyQualifiedName('general.datetime');
export const DATETIME_COMPLETED = new FullyQualifiedName('date.completeddatetime');
export const DATETIME_END = new FullyQualifiedName('ol.datetimeend');
export const DATETIME_START = new FullyQualifiedName('ol.datetimestart');
export const INCIDENT_START_DATETIME = new FullyQualifiedName('incident.startdatetime');

/* Property Type FQNs by Entity Type */

/* geo.address */
export const ADDRESS_FQNS = {
  LOCATION_ADDRESS: new FullyQualifiedName('location.address'),
};

/* publicsafety.pretrialstatuscaseprocessings */
export const CASE_FQNS = {
  CASE_NUMBER_TEXT: new FullyQualifiedName('j.CaseNumberText'),
  COURT_CASE_TYPE: new FullyQualifiedName('justice.courtcasetype'),
};

/* justice.charge */
export const CHARGE_FQNS = {
  ARREST_TRACKING_NUMBER: new FullyQualifiedName('justice.ArrestTrackingNumber'),
  CHARGE_LEVEL: new FullyQualifiedName('event.ChargeLevel'),
  OFFENSE_CHARGE_DESCRIPTION: new FullyQualifiedName('event.OffenseLocalDescription'),
};

/* ol.encounter */
export const CHECK_IN_FQNS = {
  CHECKED_IN: new FullyQualifiedName('ol.checkedin'),
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

/* ol.notificationevent */
export const INFRACTION_EVENT_FQNS = {
  NOTES: new FullyQualifiedName('ol.notes'),
  TYPE: new FullyQualifiedName('ol.type'),
};

/* ol.organization */
export const ORGANIZATION_FQNS = {
  DESCRIPTION: new FullyQualifiedName('ol.description'),
  ORGANIZATION_NAME: new FullyQualifiedName('ol.organizationname'),
};

/* general.person */
export const PEOPLE_FQNS = {
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
export const PROGRAM_OUTCOME_FQNS = {
  COMPLETED: new FullyQualifiedName('ol.completed'),
  DESCRIPTION: new FullyQualifiedName('ol.description'),
  HOURS_WORKED: new FullyQualifiedName('ol.hoursworked'),
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
