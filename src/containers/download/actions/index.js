// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const DOWNLOAD_ENROLLMENTS :'DOWNLOAD_ENROLLMENTS' = 'DOWNLOAD_ENROLLMENTS';
const downloadEnrollments :RequestSequence = newRequestSequence(DOWNLOAD_ENROLLMENTS);

export {
  DOWNLOAD_ENROLLMENTS,
  downloadEnrollments,
};
