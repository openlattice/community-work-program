// @flow
import { Map } from 'immutable';
import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { DOWNLOAD_WORKSITES, downloadWorksites } from '../actions';

const { REQUEST_STATE } = ReduxConstants;

export default function reducer(state :Map, action :SequenceAction) {

  return downloadWorksites.reducer(state, action, {
    REQUEST: () => state
      .setIn([DOWNLOAD_WORKSITES, REQUEST_STATE], RequestStates.PENDING)
      .setIn([DOWNLOAD_WORKSITES, action.id], action),
    SUCCESS: () => state
      .setIn([DOWNLOAD_WORKSITES, REQUEST_STATE], RequestStates.SUCCESS),
    FAILURE: () => state.setIn([DOWNLOAD_WORKSITES, REQUEST_STATE], RequestStates.FAILURE),
    FINALLY: () => state.deleteIn([DOWNLOAD_WORKSITES, action.id]),
  });
}
