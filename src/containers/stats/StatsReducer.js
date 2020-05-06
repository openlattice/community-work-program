// @flow
import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { GET_STATS_DATA, getStatsData } from './StatsActions';
import { SHARED, STATS } from '../../utils/constants/ReduxStateConsts';

const { ACTIONS, REQUEST_STATE } = SHARED;
const {
  ACTIVE_PEOPLE_BY_COURT_TYPE_GRAPH_DATA,
  ENROLLMENTS_BY_COURT_TYPE_GRAPH_DATA,
  REFERRALS_BY_COURT_TYPE_GRAPH_DATA,
  SUCCESSFUL_PEOPLE_BY_COURT_TYPE_GRAPH_DATA,
  TOTAL_ACTIVE_PARTICIPANT_COUNT,
  TOTAL_DIVERSION_PLAN_COUNT,
  TOTAL_PARTICIPANT_COUNT,
  TOTAL_SUCCESSFUL_PARTICIPANT_COUNT,
  TOTAL_UNSUCCESSFUL_PARTICIPANT_COUNT,
  UNSUCCESSFUL_PEOPLE_BY_COURT_TYPE_GRAPH_DATA,
} = STATS;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [GET_STATS_DATA]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [ACTIVE_PEOPLE_BY_COURT_TYPE_GRAPH_DATA]: Map(),
  [ENROLLMENTS_BY_COURT_TYPE_GRAPH_DATA]: Map(),
  [REFERRALS_BY_COURT_TYPE_GRAPH_DATA]: Map(),
  [SUCCESSFUL_PEOPLE_BY_COURT_TYPE_GRAPH_DATA]: Map(),
  [TOTAL_ACTIVE_PARTICIPANT_COUNT]: 0,
  [TOTAL_DIVERSION_PLAN_COUNT]: 0,
  [TOTAL_PARTICIPANT_COUNT]: 0,
  [TOTAL_SUCCESSFUL_PARTICIPANT_COUNT]: 0,
  [TOTAL_UNSUCCESSFUL_PARTICIPANT_COUNT]: 0,
  [UNSUCCESSFUL_PEOPLE_BY_COURT_TYPE_GRAPH_DATA]: Map(),
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
            activePeopleByCourtTypeGraphData,
            enrollmentsByCourtTypeGraphData,
            referralsByCourtTypeGraphData,
            successfulPeopleByCourtTypeGraphData,
            totalActiveParticipantCount,
            totalDiversionPlanCount,
            totalParticipantCount,
            totalSuccessfulParticipantCount,
            totalUnsuccessfulParticipantCount,
            unsuccessfulPeopleByCourtTypeGraphData,
          } = value;
          return state
            .set(ENROLLMENTS_BY_COURT_TYPE_GRAPH_DATA, enrollmentsByCourtTypeGraphData)
            .set(ACTIVE_PEOPLE_BY_COURT_TYPE_GRAPH_DATA, activePeopleByCourtTypeGraphData)
            .set(REFERRALS_BY_COURT_TYPE_GRAPH_DATA, referralsByCourtTypeGraphData)
            .set(SUCCESSFUL_PEOPLE_BY_COURT_TYPE_GRAPH_DATA, successfulPeopleByCourtTypeGraphData)
            .set(UNSUCCESSFUL_PEOPLE_BY_COURT_TYPE_GRAPH_DATA, unsuccessfulPeopleByCourtTypeGraphData)
            .set(TOTAL_ACTIVE_PARTICIPANT_COUNT, totalActiveParticipantCount)
            .set(TOTAL_DIVERSION_PLAN_COUNT, totalDiversionPlanCount)
            .set(TOTAL_PARTICIPANT_COUNT, totalParticipantCount)
            .set(TOTAL_SUCCESSFUL_PARTICIPANT_COUNT, totalSuccessfulParticipantCount)
            .set(TOTAL_UNSUCCESSFUL_PARTICIPANT_COUNT, totalUnsuccessfulParticipantCount)
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
