/*
 * @flow
 */

import { Constants, Models } from 'lattice';

const { FullyQualifiedName } = Models;

const { OPENLATTICE_ID_FQN } = Constants;

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

export const PROPERTY_TYPE_FQNS :Object = {
  CASE_NUMBER_TEXT: new FullyQualifiedName('j.CaseNumberText'),
  CATEGORY: new FullyQualifiedName('ol.category'),
  CELL_PHONE: new FullyQualifiedName('contact.cellphone'),
  CHECKED_IN: new FullyQualifiedName('ol.checkedin'),
  CHECK_IN_DATETIME: new FullyQualifiedName('ol.checkindatetime'),
  CITY: new FullyQualifiedName('location.city'),
  COMPLETED: new FullyQualifiedName('ol.completed'),
  CONCURRENT: new FullyQualifiedName('ol.concurrent'),
  CONSECUTIVE: new FullyQualifiedName('ol.consecutive'),
  COURT_CASE_TYPE: new FullyQualifiedName('justice.courtcasetype'),
  DATETIME: new FullyQualifiedName('general.datetime'),
  DATETIME_COMPLETED: new FullyQualifiedName('date.completeddatetime'),
  DATETIME_END: new FullyQualifiedName('ol.datetimeend'),
  DATETIME_RECEIVED: new FullyQualifiedName('datetime.received'),
  DATETIME_START: new FullyQualifiedName('ol.datetimestart'),
  DESCRIPTION: new FullyQualifiedName('ol.description'),
  DOB: new FullyQualifiedName('nc.PersonBirthDate'),
  EFFECTIVE_DATE: new FullyQualifiedName('ol.effectivedate'),
  EMAIL: new FullyQualifiedName('staff.email'),
  ENTITY_KEY_ID: OPENLATTICE_ID_FQN,
  ETHNICITY: new FullyQualifiedName('nc.PersonEthnicity'),
  FIRST_NAME: new FullyQualifiedName('nc.PersonGivenName'),
  FULL_ADDRESS: new FullyQualifiedName('location.Address'),
  GENDER: new FullyQualifiedName('bhr.gender'),
  HOURS_WORKED: new FullyQualifiedName('ol.hoursworked'),
  IMAGE_DATA: new FullyQualifiedName('ol.imagedata'),
  INCIDENT_START_DATETIME: new FullyQualifiedName('incident.startdatetime'),
  LAST_NAME: new FullyQualifiedName('nc.PersonSurName'),
  MIDDLE_NAME: new FullyQualifiedName('nc.PersonMiddleName'),
  MUGSHOT: new FullyQualifiedName('publicsafety.mugshot'),
  NAME: new FullyQualifiedName('ol.name'),
  NOTES: new FullyQualifiedName('ol.notes'),
  OL_ID: new FullyQualifiedName('ol.id'),
  ORGANIZATION_NAME: new FullyQualifiedName('ol.organizationname'),
  ORIENTATION_DATETIME: new FullyQualifiedName('ol.orientationdatetime'),
  PERSON_NOTES: new FullyQualifiedName('housing.notes'),
  PHONE_NUMBER: new FullyQualifiedName('contact.phonenumber'),
  PICTURE: new FullyQualifiedName('person.picture'),
  PREFERRED: new FullyQualifiedName('ol.preferred'),
  RACE: new FullyQualifiedName('nc.PersonRace'),
  REQUIRED_HOURS: new FullyQualifiedName('ol.requiredhours'),
  REQUIRED_HOURS_TEXT: new FullyQualifiedName('ol.requiredhourstext'),
  SEX: new FullyQualifiedName('nc.PersonSex'),
  SSN: new FullyQualifiedName('nc.SSN'),
  STATUS: new FullyQualifiedName('ol.status'),
  TITLE: new FullyQualifiedName('person.title'),
  TYPE: new FullyQualifiedName('ol.type'),
  US_STATE: new FullyQualifiedName('location.state'),
  VIOLENT: new FullyQualifiedName('ol.violent'),
  ZIP: new FullyQualifiedName('location.zip'),
};
