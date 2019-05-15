// @flow
import { Map, List } from 'immutable';

/* New Participants */

export const personOne = Map().withMutations((map :Map) => {
  map.set('name', 'Tommy Morrison');
  map.set('age', 25);
  map.set('startDate', '2018-08-02T07:00:00.000Z');
  map.set('sentenceDate', '2018-08-09T07:00:00.000Z');
  map.set('sentenceEndDate', '2018-11-01T07:00:00.000Z');
  map.set('hoursServed', '84h');
  map.set('requiredHours', '100h');
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
  map.set('startDate', '2018-08-02T07:00:00.000Z');
  map.set('sentenceDate', '2018-08-09T07:00:00.000Z');
  map.set('sentenceEndDate', '2018-11-01T07:00:00.000Z');
  map.set('hoursServed', '100h');
  map.set('requiredHours', '100h');
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
  map.set('startDate', '2019-04-02T07:00:00.000Z');
  map.set('sentenceDate', '2019-04-09T07:00:00.000Z');
  map.set('sentenceEndDate', '2019-11-30T07:00:00.000Z');
  map.set('hoursServed', '14h');
  map.set('requiredHours', '25h');
  map.set('numberOfWarnings', 3);
  map.set('numberOfViolations', 1);
  map.set('personId', '2yehf8as124124hbjhrb');
  map.set('status', 'Active — noncompliant');
  map.set('caseNumber: ', '123456789012345');
  map.set('dateOfBirth', '12/04/1990');
});

export const personFour = Map().withMutations((map :Map) => {
  map.set('name', 'Frank Seebold');
  map.set('age', 17);
  map.set('startDate', '2018-06-02T07:00:00.000Z');
  map.set('sentenceDate', '2018-06-09T07:00:00.000Z');
  map.set('sentenceEndDate', '2018-11-30T07:00:00.000Z');
  map.set('hoursServed', '58h');
  map.set('requiredHours', '150h');
  map.set('numberOfWarnings', 2);
  map.set('numberOfViolations', 0);
  map.set('personId', 'asdjh;lzdf2348234710');
  map.set('status', 'Closed');
  map.set('caseNumber: ', '123456789012345');
  map.set('dateOfBirth', '03/04/2002');
});

export const personFive = Map().withMutations((map :Map) => {
  map.set('name', 'Lori Amaratti');
  map.set('age', 21);
  map.set('startDate', undefined);
  map.set('sentenceDate', '2019-05-20T07:00:00.000Z');
  map.set('sentenceEndDate', '2019-07-01T07:00:00.000Z');
  map.set('hoursServed', '0h');
  map.set('requiredHours', '50h');
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
  map.set('startDate', '2018-05-20T07:00:00.000Z');
  map.set('sentenceDate', '2018-05-20T07:00:00.000Z');
  map.set('sentenceEndDate', '2018-07-08T07:00:00.000Z');
  map.set('hoursServed', '34h');
  map.set('requiredHours', '150h');
  map.set('numberOfWarnings', 3);
  map.set('numberOfViolations', 2);
  map.set('personId', '12r4242412sdhlfahgas');
  map.set('status', 'Removed — noncompliant');
  map.set('caseNumber: ', '123456789012345');
  map.set('dateOfBirth', '06/27/1995');
});

export const personSeven = Map().withMutations((map :Map) => {
  map.set('name', 'Carly McDonough');
  map.set('age', 18);
  map.set('startDate', '');
  map.set('sentenceDate', '04/20/2019');
  map.set('sentenceEndDate', '10/08/2019');
  map.set('hoursServed', '0h');
  map.set('requiredHours', '30h');
  map.set('numberOfWarnings', 0);
  map.set('numberOfViolations', 0);
  map.set('personId', '888767fhasdkfas');
  map.set('status', 'Awaiting enrollment');
  map.set('caseNumber: ', '123456789012345');
  map.set('dateOfBirth', '01/14/2001');
});

export const personEight = Map().withMutations((map :Map) => {
  map.set('name', 'Jack Rodriguez');
  map.set('age', 18);
  map.set('startDate', '');
  map.set('sentenceDate', '04/23/2019');
  map.set('sentenceEndDate', '08/08/2019');
  map.set('hoursServed', '0h');
  map.set('requiredHours', '60h');
  map.set('numberOfWarnings', 0);
  map.set('numberOfViolations', 0);
  map.set('personId', 'lmnbvvffhas873294');
  map.set('status', 'Awaiting enrollment');
  map.set('caseNumber: ', '123456789012345');
  map.set('dateOfBirth', '07/14/2000');
});

export const personNine = Map().withMutations((map :Map) => {
  map.set('name', 'Daniel Wilson');
  map.set('age', 17);
  map.set('startDate', '');
  map.set('sentenceDate', '04/15/2019');
  map.set('sentenceEndDate', '08/15/2019');
  map.set('hoursServed', '0h');
  map.set('requiredHours', '50h');
  map.set('numberOfWarnings', 0);
  map.set('numberOfViolations', 0);
  map.set('personId', 'ncxmewirwe394224');
  map.set('status', 'Awaiting enrollment');
  map.set('caseNumber: ', '123456789012345');
  map.set('dateOfBirth', '02/03/2002');
});

export const personTen = Map().withMutations((map :Map) => {
  map.set('name', 'Joshua Cohen');
  map.set('age', 17);
  map.set('startDate', '');
  map.set('sentenceDate', '04/24/2019');
  map.set('sentenceEndDate', '09/30/2019');
  map.set('hoursServed', '0h');
  map.set('requiredHours', '100h');
  map.set('numberOfWarnings', 0);
  map.set('numberOfViolations', 0);
  map.set('personId', '91283ajsdlfjasasdf');
  map.set('status', 'Awaiting enrollment');
  map.set('caseNumber: ', '123456789012345');
  map.set('dateOfBirth', '03/13/2002');
});

export const personEleven = Map().withMutations((map :Map) => {
  map.set('name', 'Jessica Garcia');
  map.set('age', 19);
  map.set('startDate', '');
  map.set('sentenceDate', '04/24/2019');
  map.set('sentenceEndDate', '09/30/2019');
  map.set('hoursServed', '0h');
  map.set('requiredHours', '25h');
  map.set('numberOfWarnings', 0);
  map.set('numberOfViolations', 0);
  map.set('personId', '91283ajsdlfjasasdf');
  map.set('status', 'Awaiting enrollment');
  map.set('caseNumber: ', '123456789012345');
  map.set('dateOfBirth', '03/13/2000');
});

export const personTwelve = Map().withMutations((map :Map) => {
  map.set('name', 'Amelia Torres');
  map.set('age', 20);
  map.set('startDate', '');
  map.set('sentenceDate', '03/24/2019');
  map.set('sentenceEndDate', '09/30/2019');
  map.set('hoursServed', '32h');
  map.set('requiredHours', '40h');
  map.set('numberOfWarnings', 3);
  map.set('numberOfViolations', 2);
  map.set('personId', '91283ajsdlfjasasdf');
  map.set('status', 'Active — noncompliant');
  map.set('caseNumber: ', '123456789012345');
  map.set('dateOfBirth', '03/13/1999');
});

export const personThirteen = Map().withMutations((map :Map) => {
  map.set('name', 'Matthew Miller');
  map.set('age', 20);
  map.set('startDate', '');
  map.set('sentenceDate', '01/24/2019');
  map.set('sentenceEndDate', '04/30/2019');
  map.set('hoursServed', '40h');
  map.set('requiredHours', '40h');
  map.set('numberOfWarnings', 3);
  map.set('numberOfViolations', 2);
  map.set('personId', '91283ajsdlfjasasdf');
  map.set('status', 'Active — noncompliant');
  map.set('caseNumber: ', '123456789012345');
  map.set('dateOfBirth', '03/04/1999');
});

export const people = List([
  personOne,
  personTwo,
  personThree,
  personFour,
  personFive,
  personSix,
  // personSeven,
  // personEight,
  // personNine,
  // personTen,
  // personEleven,
  // personTwelve,
  // personThirteen,
]).asImmutable();
