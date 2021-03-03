/*
 * @flow
 */

import { Map } from 'immutable';
import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';

const { ERROR, REQUEST_STATE } = ReduxConstants;

export default function reducer(state :Map, action :Object) {

  const { path } = action;
  if (path && state.hasIn(path)) {
    return state
      .setIn([...path, ERROR], false)
      .setIn([...path, REQUEST_STATE], RequestStates.STANDBY);
  }

  return state;
}
