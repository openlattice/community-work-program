// @flow
import { Map, List } from 'immutable';

/* PEOPLE */

export const personOne = Map().withMutations((map :Map) => {
  map.set('name', 'Tommy Morrison');
  map.set('age', 25);
  map.set('startDate', '08/02/2018');
  map.set('sentenceDate', '08/09/2018');
  map.set('sentenceEndDate', '11/10/2018');
  map.set('hoursServed', '62h / 100h');
  map.set('numberOfWarnings', 0);
  map.set('numberOfViolations', 0);
  map.set('personId', '12gsdaru23hg0sei420');
  map.set('status', 'Active');
  map.set('caseNumber: ', '123456789012345');
  map.set('dateOfBirth', '01/25/1994');
});

export const personTwo = Map().withMutations((map :Map) => {
  map.set('name', 'Mabel Garrett');
  map.set('age', 19);
  map.set('startDate', '08/02/2018');
  map.set('sentenceDate', '08/06/2018');
  map.set('sentenceEndDate', '12/31/2018');
  map.set('hoursServed', '100h / 100h');
  map.set('numberOfWarnings', 1);
  map.set('numberOfViolations', 0);
  map.set('personId', 'dgal9827423bksdafgf');
  map.set('status', 'Completed');
  map.set('caseNumber: ', '123456789012345');
  map.set('dateOfBirth', '02/25/2000');
});

export const personThree = Map().withMutations((map :Map) => {
  map.set('name', 'Phoebe Oates');
  map.set('age', 28);
  map.set('startDate', '06/02/2018');
  map.set('sentenceDate', '06/06/2018');
  map.set('sentenceEndDate', '12/31/2018');
  map.set('hoursServed', '5h / 25h');
  map.set('numberOfWarnings', 3);
  map.set('numberOfViolations', 1);
  map.set('personId', '2yehf8as124124hbjhrb');
  map.set('status', 'Active – noncompliant');
  map.set('caseNumber: ', '123456789012345');
  map.set('dateOfBirth', '12/04/1990');
});

export const personFour = Map().withMutations((map :Map) => {
  map.set('name', 'Frank Seebold');
  map.set('age', 34);
  map.set('startDate', '01/02/2018');
  map.set('sentenceDate', '01/06/2018');
  map.set('sentenceEndDate', '10/08/2018');
  map.set('hoursServed', '53h / 150h');
  map.set('numberOfWarnings', 2);
  map.set('numberOfViolations', 0);
  map.set('personId', 'asdjh;lzdf2348234710');
  map.set('status', 'Closed');
  map.set('caseNumber: ', '123456789012345');
  map.set('dateOfBirth', '03/04/1985');
});

export const personFive = Map().withMutations((map :Map) => {
  map.set('name', 'Lori Amaratti');
  map.set('age', 21);
  map.set('startDate', '');
  map.set('sentenceDate', '09/01/2018');
  map.set('sentenceEndDate', '10/08/2018');
  map.set('hoursServed', '0h / 50h');
  map.set('numberOfWarnings', 0);
  map.set('numberOfViolations', 0);
  map.set('personId', '097164dyvskbdfjha');
  map.set('status', 'Awaiting enrollment');
  map.set('caseNumber: ', '123456789012345');
  map.set('dateOfBirth', '07/14/1997');
});

export const personSix = Map().withMutations((map :Map) => {
  map.set('name', 'Heather Everett');
  map.set('age', 23);
  map.set('startDate', '09/04/2018');
  map.set('sentenceDate', '09/01/2018');
  map.set('sentenceEndDate', '12/08/2018');
  map.set('hoursServed', '15h / 50h');
  map.set('numberOfWarnings', 3);
  map.set('numberOfViolations', 2);
  map.set('personId', '12r4242412sdhlfahgas');
  map.set('status', 'Removed – noncompliant');
  map.set('caseNumber: ', '123456789012345');
  map.set('dateOfBirth', '06/27/1995');
});

export const people = List([
  personOne,
  personTwo,
  personThree,
  personFour,
  personFive,
  personSix,
]).asImmutable();

/* CONTACT INFO */

export const personOneContact = Map().withMutations((map :Map) => {
  map.set('phoneNumber', '1234567890');
  map.set('email', 'tommymorrison@gmail.com');
  map.set('address', '123 Apple Street, Rapid City, SD 12345');
  map.set('personId', '12gsdaru23hg0sei420');
});

export const personTwoContact = Map().withMutations((map :Map) => {
  map.set('phoneNumber', '1234567890');
  map.set('email', 'mabelgarrett@gmail.com');
  map.set('address', '123 Apple Street, Rapid City, SD 12345');
  map.set('personId', 'dgal9827423bksdafgf');
});

export const personThreeContact = Map().withMutations((map :Map) => {
  map.set('phoneNumber', '1234567890');
  map.set('email', 'phoebeoates@gmail.com');
  map.set('address', '123 Apple Street, Rapid City, SD 12345');
  map.set('personId', '2yehf8as124124hbjhrb');
});

export const personFourContact = Map().withMutations((map :Map) => {
  map.set('phoneNumber', '1234567890');
  map.set('email', 'frankseebold@gmail.com');
  map.set('address', '123 Apple Street, Rapid City, SD 12345');
  map.set('personId', 'asdjh;lzdf2348234710');
});

export const personFiveContact = Map().withMutations((map :Map) => {
  map.set('phoneNumber', '1234567890');
  map.set('email', 'loriamaratti@gmail.com');
  map.set('address', '123 Apple Street, Rapid City, SD 12345');
  map.set('personId', '097164dyvskbdfjha');
});

export const personSixContact = Map().withMutations((map :Map) => {
  map.set('phoneNumber', '1234567890');
  map.set('email', 'heathereverett@gmail.com');
  map.set('address', '123 Apple Street, Rapid City, SD 12345');
  map.set('personId', '12r4242412sdhlfahgas');
});

export const contactInfo = List([
  personOneContact,
  personTwoContact,
  personThreeContact,
  personFourContact,
  personFiveContact,
  personSixContact,
]).asImmutable();

/* WARNINGS / VIOLATIONS */

export const violationOne = Map().withMutations((map :Map) => {
  map.set('id', '1234567890');
  map.set('datetime', '2019-04-01T17:58:32.849Z');
  map.set('worksite', 'Community Garden');
  map.set('level', 'Warning');
  map.set('description', 'Tommy was found smoking when he was supposed to be working.');
});

export const violationTwo = Map().withMutations((map :Map) => {
  map.set('id', '0987654321');
  map.set('datetime', '2019-04-03T11:58:32.849Z');
  map.set('worksite', 'Community Garden');
  map.set('level', 'Violation');
  /* eslint-disable max-len */
  map.set('description', 'Tommy was found smoking again. Instead of stopping immediately, he tried to keep smoking when the supervisor looked the other way.');
});

export const violations = List([
  violationOne,
  violationTwo,
]).asImmutable();

/* APPOINTMENTS */

export const upcomingApptOne = Map().withMutations((map :Map) => {
  map.set('id', '1234567890');
  map.set('datetimestart', '2019-04-30T15:30:00.000Z');
  map.set('datetimeend', '2019-04-30T19:30:00.000Z');
  map.set('worksite', 'Community Garden');
});

export const upcomingApptTwo = Map().withMutations((map :Map) => {
  map.set('id', '0987654321');
  map.set('datetimestart', '2019-05-02T18:00:00.000Z');
  map.set('datetimeend', '2019-05-02T20:00:00.000Z');
  map.set('worksite', 'B&G');
});

export const upcomingApptThree = Map().withMutations((map :Map) => {
  map.set('id', '1029384756');
  map.set('datetimestart', '2019-05-04T20:00:00.000Z');
  map.set('datetimeend', '2019-05-02T23:00:00.000Z');
  map.set('worksite', 'Pennington County General Store');
});

export const pastApptOne = Map().withMutations((map :Map) => {
  map.set('id', '0192837465');
  map.set('datetimestart', '2019-03-20T20:00:00.000Z');
  map.set('datetimeend', '2019-03-20T23:00:00.000Z');
  map.set('worksite', 'Pennington County General Store');
});

export const pastApptTwo = Map().withMutations((map :Map) => {
  map.set('id', '7765531923');
  map.set('datetimestart', '2019-03-13T20:00:00.000Z');
  map.set('datetimeend', '2019-03-13T23:00:00.000Z');
  map.set('worksite', 'Community Garden');
});

export const pastApptThree = Map().withMutations((map :Map) => {
  map.set('id', '9982344324');
  map.set('datetimestart', '2019-04-01T15:00:00.000Z');
  map.set('datetimeend', '2019-04-01T20:00:00.000Z');
  map.set('worksite', 'B&G');
});

export const tommyAppts = List([
  upcomingApptOne,
  upcomingApptTwo,
  upcomingApptThree,
  pastApptOne,
  pastApptTwo,
  pastApptThree,
]).asImmutable();
