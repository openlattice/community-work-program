// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const DOWNLOAD_ENROLLMENTS :'DOWNLOAD_ENROLLMENTS' = 'DOWNLOAD_ENROLLMENTS';
const downloadEnrollments :RequestSequence = newRequestSequence(DOWNLOAD_ENROLLMENTS);

const DOWNLOAD_WORKSITES :'DOWNLOAD_WORKSITES' = 'DOWNLOAD_WORKSITES';
const downloadWorksites :RequestSequence = newRequestSequence(DOWNLOAD_WORKSITES);

export {
  DOWNLOAD_ENROLLMENTS,
  DOWNLOAD_WORKSITES,
  downloadEnrollments,
  downloadWorksites,
};
