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

export const WORKSITE_PROFILE :string = '/worksites/:worksiteId';
export const EDIT_WORKSITE_PROFILE_INFO :string = `${WORKSITE_PROFILE}/edit`;
