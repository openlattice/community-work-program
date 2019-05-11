// @flow
import { List, Map } from 'immutable';

/* eslint-disable max-len */

/* Organizations */

export const penningtonCountyCenter = Map().withMutations((map :Map) => {
  map.set('id', '1234567890');
  map.set('name', 'Pennington County Center');
  map.set('status', 'Active');
  map.set('description', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.');
});

export const youthOrganization = Map().withMutations((map :Map) => {
  map.set('id', '0987654321');
  map.set('name', 'Youth Organization');
  map.set('status', 'Active');
  map.set('description', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.');
});

export const cityCommittee = Map().withMutations((map :Map) => {
  map.set('id', '1029384756');
  map.set('name', 'City Committee');
  map.set('status', 'Inactive');
  map.set('description', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.');
});

export const organizations = List([
  penningtonCountyCenter,
  youthOrganization,
  cityCommittee,
]).asImmutable();

/* Worksites */

export const communityGarden = Map().withMutations((map :Map) => {
  map.set('id', '1234567890');
  map.set('name', 'Community Garden');
  map.set('status', 'Active');
  map.set('organization', 'Pennington County Center');
  map.set('startDate', '07/02/2018');
  map.set('lastActiveDate', '04/20/2019');
  map.set('scheduledParticipantCount', 8);
  map.set('pastParticipantCount', 14);
  map.set('totalHours', 392);
});

export const countyShop = Map().withMutations((map :Map) => {
  map.set('id', '0987654321');
  map.set('name', 'County Shop');
  map.set('status', 'Active');
  map.set('organization', 'Pennington County Center');
  map.set('startDate', '07/14/2018');
  map.set('lastActiveDate', '04/19/2019');
  map.set('scheduledParticipantCount', 3);
  map.set('pastParticipantCount', 7);
  map.set('totalHours', 432);
});

export const bg = Map().withMutations((map :Map) => {
  map.set('id', '1029384756');
  map.set('name', 'B&G');
  map.set('status', 'Active');
  map.set('organization', 'Youth Organization');
  map.set('startDate', '07/03/2018');
  map.set('lastActiveDate', '04/01/2019');
  map.set('scheduledParticipantCount', 1);
  map.set('pastParticipantCount', 4);
  map.set('totalHours', 514);
});

export const roadwayTrash = Map().withMutations((map :Map) => {
  map.set('id', '0192837465');
  map.set('name', 'Roadway Trash');
  map.set('status', 'Inactive');
  map.set('organization', 'City Committee');
  map.set('startDate', '08/12/2018');
  map.set('lastActiveDate', '03/22/2019');
  map.set('scheduledParticipantCount', 0);
  map.set('pastParticipantCount', 19);
  map.set('totalHours', 941);
});

export const homelessShelter = Map().withMutations((map :Map) => {
  map.set('id', '142536475869708');
  map.set('name', 'Homeless Shelter');
  map.set('status', 'Inactive');
  map.set('organization', 'City Committee');
  map.set('startDate', '08/12/2018');
  map.set('lastActiveDate', '03/02/2019');
  map.set('scheduledParticipantCount', 0);
  map.set('pastParticipantCount', 11);
  map.set('totalHours', 356);
});

export const countyHospital = Map().withMutations((map :Map) => {
  map.set('id', '0897867564534231');
  map.set('name', 'County Hospital');
  map.set('status', 'Inactive');
  map.set('organization', 'Pennington County Center');
  map.set('startDate', '07/15/2018');
  map.set('lastActiveDate', '02/20/2019');
  map.set('scheduledParticipantCount', 0);
  map.set('pastParticipantCount', 3);
  map.set('totalHours', 42);
});

export const worksites = List([
  communityGarden,
  countyShop,
  bg,
  roadwayTrash,
  homelessShelter,
  countyHospital,
]).asImmutable();

/* Appointments */

export const apptOne = Map().withMutations((map :Map) => {
  map.set('id', '1234567890');
  map.set('datetimestart', '2019-05-20T15:30:00.000Z');
  map.set('datetimeend', '2019-05-20T19:30:00.000Z');
  map.set('worksite', 'Community Garden');
  map.set('person', 'Florence Welch');
});

export const apptTwo = Map().withMutations((map :Map) => {
  map.set('id', '0987654321');
  map.set('datetimestart', '2019-05-20T18:00:00.000Z');
  map.set('datetimeend', '2019-05-20T20:00:00.000Z');
  map.set('worksite', 'Community Garden');
  map.set('person', 'Mark Johnson');
});

export const apptThree = Map().withMutations((map :Map) => {
  map.set('id', '1029384756');
  map.set('datetimestart', '2019-05-21T20:00:00.000Z');
  map.set('datetimeend', '2019-05-21T23:00:00.000Z');
  map.set('worksite', 'Community Garden');
  map.set('person', 'Sara Liu');
});

export const apptFour = Map().withMutations((map :Map) => {
  map.set('id', '0192837465');
  map.set('datetimestart', '2019-05-21T20:00:00.000Z');
  map.set('datetimeend', '2019-05-21T23:00:00.000Z');
  map.set('worksite', 'Community Garden');
  map.set('person', 'Tommy Morrison');
});

export const apptFive = Map().withMutations((map :Map) => {
  map.set('id', '7765531923');
  map.set('datetimestart', '2019-05-27T20:00:00.000Z');
  map.set('datetimeend', '2019-05-27T23:00:00.000Z');
  map.set('worksite', 'Community Garden');
  map.set('person', 'Lori Amaratti');
});

export const apptSix = Map().withMutations((map :Map) => {
  map.set('id', '9982344324');
  map.set('datetimestart', '2019-05-22T15:00:00.000Z');
  map.set('datetimeend', '2019-05-22T20:00:00.000Z');
  map.set('worksite', 'Community Garden');
  map.set('person', 'Nathan Moore');
});

export const apptSeven = Map().withMutations((map :Map) => {
  map.set('id', '88491374981');
  map.set('datetimestart', '2019-05-23T10:00:00.000Z');
  map.set('datetimeend', '2019-05-23T12:00:00.000Z');
  map.set('worksite', 'Community Garden');
  map.set('person', 'Jane Frazier');
});

export const appts = List([
  apptOne,
  apptTwo,
  apptThree,
  apptFour,
  apptFive,
  apptSix,
  apptSeven,
]).asImmutable();

export const apptMap = Map({
  All: appts,
  Monday: List([apptOne, apptTwo, apptFive]),
  Tuesday: List([apptThree, apptFour]),
  Wednesday: List([apptSix]),
  Thursday: List([apptSeven]),
  Friday: List([]),
  Saturday: List([]),
  Sunday: List([]),
});
