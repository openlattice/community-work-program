// @flow
import { Map, fromJS } from 'immutable';
import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';

import downloadEnrollmentsReducer from './downloadEnrollmentsReducer';
import downloadWorksitesReducer from './downloadWorksitesReducer';

import {
  DOWNLOAD_ENROLLMENTS,
  DOWNLOAD_WORKSITES,
  downloadEnrollments,
  downloadWorksites,
} from '../actions';

const { REQUEST_STATE } = ReduxConstants;

const INITIAL_STATE :Map = fromJS({
  // actions
  [DOWNLOAD_ENROLLMENTS]: {
    [REQUEST_STATE]: RequestStates.STANDBY
  },
  [DOWNLOAD_WORKSITES]: {
    [REQUEST_STATE]: RequestStates.STANDBY
  },
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case downloadEnrollments.case(action.type): {
      return downloadEnrollmentsReducer(state, action);
    }

    case downloadWorksites.case(action.type): {
      return downloadWorksitesReducer(state, action);
    }

    default:
      return state;
  }
}
