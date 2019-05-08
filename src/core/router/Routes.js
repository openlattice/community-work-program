/*
 * @flow
 */

export const ROOT :string = '/';
export const LOGIN :string = '/login';
export const DASHBOARD :string = '/dashboard';
export const PARTICIPANTS :string = '/participants';
export const WORKSITES :string = '/worksitesbyorganization';

export const ORGANIZATION_PROFILE :string = `${ROOT}organizations/:organizationId`;
export const WORKSITE_PROFILE :string = `${ROOT}worksites/:worksiteId`;
