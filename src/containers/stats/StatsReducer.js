// @flow
import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { GET_STATS_DATA, getStatsData } from './StatsActions';
import { SHARED, STATS } from '../../utils/constants/ReduxStateConsts';

const { ACTIONS, REQUEST_STATE } = SHARED;
const {
  ENROLLMENTS_BY_COURT_TYPE_GRAPH_DATA,
  PEOPLE_BY_COURT_TYPE_GRAPH_DATA,
  TOTAL_ACTIVE_PARTICIPANT_COUNT,
  TOTAL_DIVERSION_PLAN_COUNT,
  TOTAL_PARTICIPANT_COUNT,
} = STATS;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [GET_STATS_DATA]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [ENROLLMENTS_BY_COURT_TYPE_GRAPH_DATA]: Map(),
  [PEOPLE_BY_COURT_TYPE_GRAPH_DATA]: Map(),
  [TOTAL_ACTIVE_PARTICIPANT_COUNT]: 0,
  [TOTAL_DIVERSION_PLAN_COUNT]: 0,
  [TOTAL_PARTICIPANT_COUNT]: 0,
});

export default function statsReducer(state :Map<*, *> = INITIAL_STATE, action :Object) :Map<*, *> {

  switch (action.type) {

    case getStatsData.case(action.type): {

      return getStatsData.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_STATS_DATA, action.id], action)
          .setIn([ACTIONS, GET_STATS_DATA, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = (action :any);
          const { value } = seqAction;
          const {
            enrollmentsByCourtTypeGraphData,
            peopleByCourtTypeGraphData,
            totalActiveParticipantCount,
            totalDiversionPlanCount,
            totalParticipantCount,
          } = value;
          return state
            .set(ENROLLMENTS_BY_COURT_TYPE_GRAPH_DATA, enrollmentsByCourtTypeGraphData)
            .set(PEOPLE_BY_COURT_TYPE_GRAPH_DATA, peopleByCourtTypeGraphData)
            .set(TOTAL_ACTIVE_PARTICIPANT_COUNT, totalActiveParticipantCount)
            .set(TOTAL_DIVERSION_PLAN_COUNT, totalDiversionPlanCount)
            .set(TOTAL_PARTICIPANT_COUNT, totalParticipantCount)
            .setIn([ACTIONS, GET_STATS_DATA, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_STATS_DATA, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_STATS_DATA, action.id]),
      });
    }

    default:
      return state;
  }
}
