// @flow
import { Map } from 'immutable';
import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { DOWNLOAD_ENROLLMENTS, downloadEnrollments } from '../actions';

const { REQUEST_STATE } = ReduxConstants;

export default function reducer(state :Map, action :SequenceAction) {

  return downloadEnrollments.reducer(state, action, {
    REQUEST: () => state
      .setIn([DOWNLOAD_ENROLLMENTS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([DOWNLOAD_ENROLLMENTS, action.id], action),
    SUCCESS: () => state
      .setIn([DOWNLOAD_ENROLLMENTS, REQUEST_STATE], RequestStates.SUCCESS),
    FAILURE: () => state.setIn([DOWNLOAD_ENROLLMENTS, REQUEST_STATE], RequestStates.FAILURE),
    FINALLY: () => state.deleteIn([DOWNLOAD_ENROLLMENTS, action.id]),
  });
}
