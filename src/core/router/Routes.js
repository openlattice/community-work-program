/*
 * @flow
 */

export const ROOT :string = '/';
export const LOGIN :string = '/login';
export const DASHBOARD :string = '/dashboard';
export const PARTICIPANTS :string = '/participants';
export const WORKSITES :string = '/worksitesbyorganization';
export const WORK_SCHEDULE :string = '/workschedule';

export const PARTICIPANT_PROFILE :string = `${PARTICIPANTS}/:subjectId`;
export const PRINT_PARTICIPANT_SCHEDULE :string = `${PARTICIPANT_PROFILE}/schedule/print`;
export const PRINT_INFRACTION :string = `${PARTICIPANT_PROFILE}/infraction/:infractionId/print`;

const EDIT_PROFILE :string = `${PARTICIPANT_PROFILE}/edit`;
export const EDIT_PARTICIPANT :string = `${EDIT_PROFILE}/participant`;
export const EDIT_CASE_INFO :string = `${EDIT_PROFILE}/caseinfo`;
export const EDIT_DATES :string = `${EDIT_PROFILE}/enrollmentdates`;
