// @flow
import { List, Map, fromJS } from 'immutable';
import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';

import downloadEnrollmentsReducer from './downloadEnrollmentsReducer';

import { SEARCH } from '../../../utils/constants/ReduxStateConsts';
import { DOWNLOAD_ENROLLMENTS, downloadEnrollments } from '../actions';

const { SEARCHED_PARTICIPANTS, TOTAL_HITS } = SEARCH;
const { REQUEST_STATE } = ReduxConstants;

const INITIAL_STATE :Map = fromJS({
  // actions
  [DOWNLOAD_ENROLLMENTS]: {
    [REQUEST_STATE]: RequestStates.STANDBY
  },
  // data
  [SEARCHED_PARTICIPANTS]: List(),
  [TOTAL_HITS]: 0,
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case downloadEnrollments.case(action.type): {
      return downloadEnrollmentsReducer(state, action);
    }

    default:
      return state;
  }
}
