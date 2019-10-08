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
