/*
 * @flow
 */

import { Constants, Models } from 'lattice';

const { FQN } = Models;

const { OPENLATTICE_ID_FQN } = Constants;

// NOTE: adding the ":Object" annotation to effectively turns off hundreds of these annoying flow errors
// 2019-11-04 - Cannot assign computed property using `FullyQualifiedName` [1].
export const APP_TYPE_FQNS :Object = {
  ADDRESS: FQN.of('app.address'),
  ADDRESSES: FQN.of('app.addresses'),
  APPEARS_IN: FQN.of('app.appearsin'),
  APPEARS_IN_ARREST: FQN.of('app.appearsinarrest'),
  APPOINTMENT: FQN.of('app.appointment'),
  APPROVED_BY: FQN.of('app.approvedby'),
  APP_SETTINGS: FQN.of('app.settings'),
  ARREST_CHARGED_WITH: FQN.of('app.arrestchargedwith'),
  ARREST_CHARGE_LIST: FQN.of('publicsafety.arrestchargelist'),
  ASSIGNED_TO: FQN.of('app.assignedto'),
  BASED_ON: FQN.of('app.basedon'),
  CHARGED_WITH: FQN.of('app.chargedwith'),
  CHARGE_EVENT: FQN.of('app.chargeevent'),
  CHECK_INS: FQN.of('app.checkins'),
  CHECK_IN_DETAILS: FQN.of('app.checkindetails'),
  CONTACT_INFORMATION: FQN.of('app.contactinformation'),
  CONTACT_INFO_GIVEN: FQN.of('app.contactinfogiven'),
  COURT_CHARGE_LIST: FQN.of('publicsafety.courtchargelist'),
  COURT_PRETRIAL_CASES: FQN.of('app.courtpretrialcases'),
  DIVERSION_PLAN: FQN.of('app.diversionplan'),
  EMPLOYED_BY: FQN.of('app.employedby'),
  EMPLOYEE: FQN.of('app.employee'),
  EMPLOYMENT: FQN.of('app.employment'),
  ENROLLMENT_STATUS: FQN.of('app.enrollmentstatus'),
  FULFILLS: FQN.of('app.fulfills'),
  HAS: FQN.of('app.has'),
  IMAGE: FQN.of('app.image'),
  INFRACTIONS: FQN.of('app.infractions'),
  INFRACTION_EVENT: FQN.of('app.infractionevent'),
  IS: FQN.of('app.is'),
  IS_PICTURE_OF: FQN.of('app.ispictureof'),
  JUDGES: FQN.of('app.judges'),
  LIVES_AT: FQN.of('app.livesat'),
  LOCATED_AT: FQN.of('app.locatedat'),
  MANUAL_ARREST_CASES: FQN.of('app.manualpretrialcases'),
  MANUAL_ARREST_CHARGES: FQN.of('app.manualcharges'),
  MANUAL_CHARGED_WITH: FQN.of('app.manualchargedwith'),
  MANUAL_COURT_CHARGES: FQN.of('app.manualcourtcharges'),
  MANUAL_PRETRIAL_COURT_CASES: FQN.of('app.manualpretrialcourtcases'),
  MANUAL_SENTENCED_WITH: FQN.of('app.manualsentencedwith'),
  OF_LENGTH: FQN.of('app.oflength'),
  OPERATES: FQN.of('app.operates'),
  ORGANIZATION: FQN.of('app.organization'),
  PART_OF: FQN.of('app.partof'),
  PEOPLE: FQN.of('app.people'),
  PRESIDES_OVER: FQN.of('app.presidesover'),
  PROGRAM_OUTCOME: FQN.of('app.programoutcome'),
  REGISTERED_FOR: FQN.of('app.registeredfor'),
  RELATED_TO: FQN.of('app.relatedto'),
  REMINDER_SENT: FQN.of('app.remindersent'),
  REPORTED: FQN.of('app.reported'),
  RESULTS_IN: FQN.of('app.resultsin'),
  STAFF: FQN.of('app.staff'),
  SUBJECT_OF: FQN.of('app.subjectof'),
  WARRANT_REQUEST: FQN.of('app.warrantrequest'),
  WORKSITE: FQN.of('app.worksite'),
  WORKSITE_PLAN: FQN.of('app.worksiteplan'),
  WORKS_AT: FQN.of('app.worksat'),
};

export const PROPERTY_TYPE_FQNS :Object = {
  ARREST_DATETIME: FQN.of('ol.arrestdatetime'),
  CASE_NUMBER_TEXT: FQN.of('j.CaseNumberText'),
  CATEGORY: FQN.of('ol.category'),
  CELL_PHONE: FQN.of('contact.cellphone'),
  CHECKED_IN: FQN.of('ol.checkedin'),
  CHECK_IN_DATETIME: FQN.of('ol.checkindatetime'),
  CHECK_IN_DEADLINE: FQN.of('ol.orientationdeadline'), // datetime
  CITY: FQN.of('location.city'),
  COMPLETED: FQN.of('ol.completed'),
  CONCURRENT: FQN.of('ol.concurrent'),
  CONSECUTIVE: FQN.of('ol.consecutive'),
  COURT_CASE_TYPE: FQN.of('justice.courtcasetype'),
  DATETIME: FQN.of('general.datetime'),
  DATETIME_COMPLETED: FQN.of('date.completeddatetime'),
  DATETIME_END: FQN.of('ol.datetimeend'),
  DATETIME_RECEIVED: FQN.of('datetime.received'),
  DATETIME_START: FQN.of('ol.datetimestart'),
  DESCRIPTION: FQN.of('ol.description'),
  DOB: FQN.of('nc.PersonBirthDate'),
  EFFECTIVE_DATE: FQN.of('ol.effectivedate'),
  EMAIL: FQN.of('staff.email'),
  ENTITY_KEY_ID: OPENLATTICE_ID_FQN,
  ETHNICITY: FQN.of('nc.PersonEthnicity'),
  FIRST_NAME: FQN.of('nc.PersonGivenName'),
  FULL_ADDRESS: FQN.of('location.Address'),
  GENDER: FQN.of('bhr.gender'),
  HOURS_WORKED: FQN.of('ol.hoursworked'),
  IMAGE_DATA: FQN.of('ol.imagedata'),
  INACTIVE: FQN.of('ol.inactive'),
  INCIDENT_START_DATETIME: FQN.of('incident.startdatetime'),
  JUSTICE_XREF: FQN.of('justice.xref'),
  LAST_NAME: FQN.of('nc.PersonSurName'),
  LEVEL_STATE: FQN.of('ol.levelstate'),
  MIDDLE_NAME: FQN.of('nc.PersonMiddleName'),
  MUGSHOT: FQN.of('publicsafety.mugshot'),
  NAME: FQN.of('ol.name'),
  NOTES: FQN.of('ol.notes'),
  OL_ID: FQN.of('ol.id'),
  OFFENSE_LOCAL_CODE: FQN.of('event.OffenseLocalCodeSection'),
  OFFENSE_LOCAL_DESCRIPTION: FQN.of('event.OffenseLocalDescription'),
  ORGANIZATION_NAME: FQN.of('ol.organizationname'),
  ORIENTATION_DATETIME: FQN.of('ol.orientationdatetime'),
  PERSON_NOTES: FQN.of('housing.notes'),
  PHONE_NUMBER: FQN.of('contact.phonenumber'),
  PICTURE: FQN.of('person.picture'),
  RACE: FQN.of('nc.PersonRace'),
  REQUIRED_HOURS: FQN.of('ol.requiredhours'),
  REQUIRED_HOURS_TEXT: FQN.of('ol.requiredhourstext'),
  SEX: FQN.of('nc.PersonSex'),
  SSN: FQN.of('nc.SSN'),
  STATUS: FQN.of('ol.status'),
  TITLE: FQN.of('person.title'),
  TYPE: FQN.of('ol.type'),
  US_STATE: FQN.of('location.state'),
  VIOLENT: FQN.of('ol.violent'),
  ZIP: FQN.of('location.zip'),
};
