/*
 * @flow
 */

export const ROOT :string = '/';
export const LOGIN :string = '/login';
export const DASHBOARD :string = '/dashboard';
export const PARTICIPANTS :string = '/participants';
export const WORKSITES :string = '/worksites';

export const PARTICIPANT_PROFILE :string = `${PARTICIPANTS}/:subjectId`;
export const NEW_APPOINTMENT :string = `${PARTICIPANT_PROFILE}/newappointment`;
export const WARNINGS_VIOLATIONS_FORM :string = `${PARTICIPANT_PROFILE}/reportwarningorviolation`;
export const PARTICIPANT_GENERAL_INFO_EDIT :string = `${PARTICIPANT_PROFILE}/editgeneralinfo`;
export const PARTICIPANT_CASE_EDIT :string = `${PARTICIPANT_PROFILE}/editcasenumber`;
