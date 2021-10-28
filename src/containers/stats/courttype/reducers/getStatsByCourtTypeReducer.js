// @flow

import { Map } from 'immutable';
import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { SHARED, STATS } from '../../../../utils/constants/ReduxStateConsts';
import { GET_STATS_BY_COURT_TYPE, getStatsByCourtType } from '../CourtTypeActions';

const {
  ENROLLMENT_STATUS_COUNTS_FOR_COURT_TYPE,
  TOTAL_ENROLLMENTS_FOR_COURT_TYPE,
  TOTAL_PARTICIPANTS_FOR_COURT_TYPE,
} = STATS;
const { ACTIONS } = SHARED;

const { REQUEST_STATE } = ReduxConstants;

export default function reducer(state :Map, action :SequenceAction) {

  return getStatsByCourtType.reducer(state, action, {
    REQUEST: () => state
      .setIn([ACTIONS, GET_STATS_BY_COURT_TYPE, REQUEST_STATE], RequestStates.PENDING)
      .setIn([ACTIONS, GET_STATS_BY_COURT_TYPE, action.id], action),
    SUCCESS: () => {
      const {
        enrollmentStatusCountsForCourtType,
        totalEnrollmentsForCourtType,
        totalParticipantsForCourtType,
      } = action.value;
      return state
        .set(ENROLLMENT_STATUS_COUNTS_FOR_COURT_TYPE, enrollmentStatusCountsForCourtType)
        .set(TOTAL_ENROLLMENTS_FOR_COURT_TYPE, totalEnrollmentsForCourtType)
        .set(TOTAL_PARTICIPANTS_FOR_COURT_TYPE, totalParticipantsForCourtType)
        .setIn([ACTIONS, GET_STATS_BY_COURT_TYPE, REQUEST_STATE], RequestStates.SUCCESS);
    },
    FAILURE: () => state.setIn([ACTIONS, GET_STATS_BY_COURT_TYPE, REQUEST_STATE], RequestStates.FAILURE),
    FINALLY: () => state.deleteIn([ACTIONS, GET_STATS_BY_COURT_TYPE, action.id]),
  });
}
