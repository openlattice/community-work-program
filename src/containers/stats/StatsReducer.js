// @flow
import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_MONTHLY_COURT_TYPE_DATA,
  GET_STATS_DATA,
  getMonthlyCourtTypeData,
  getStatsData,
} from './StatsActions';
import {
  GET_HOURS_WORKED_BY_WORKSITE,
  GET_MONTHLY_PARTICIPANTS_BY_WORKSITE,
  GET_WORKSITE_STATS_DATA,
  getHoursWorkedByWorksite,
  getMonthlyParticipantsByWorksite,
  getWorksiteStatsData,
} from './worksite/WorksiteStatsActions';
import {
  DOWNLOAD_DEMOGRAPHICS_DATA,
  GET_PARTICIPANTS_DEMOGRAPHICS,
  downloadDemographicsData,
  getParticipantsDemographics,
} from './demographics/DemographicsActions';
import {
  GET_ARREST_CHARGE_STATS,
  GET_CHARGES_STATS,
  GET_COURT_CHARGE_STATS,
  getArrestChargeStats,
  getChargesStats,
  getCourtChargeStats,
} from './charges/ChargesStatsActions';
import { SHARED, STATS } from '../../utils/constants/ReduxStateConsts';

const { ACTIONS, REQUEST_STATE } = SHARED;
const {
  ACTIVE_ENROLLMENTS_BY_COURT_TYPE,
  ARREST_CHARGE_TABLE_DATA,
  CLOSED_ENROLLMENTS_BY_COURT_TYPE,
  COURT_CHARGE_TABLE_DATA,
  ETHNICITY_DEMOGRAPHICS,
  HOURS_BY_WORKSITE,
  MONTHLY_HOURS_WORKED_BY_COURT_TYPE,
  MONTHLY_TOTAL_PARTICIPANTS_BY_COURT_TYPE,
  PARTICIPANTS_BY_WORKSITE,
  RACE_DEMOGRAPHICS,
  REFERRALS_BY_COURT_TYPE_GRAPH_DATA,
  SEX_DEMOGRAPHICS,
  SUCCESSFUL_ENROLLMENTS_BY_COURT_TYPE,
  TOTAL_ACTIVE_ENROLLMENTS_COUNT,
  TOTAL_CLOSED_ENROLLMENTS_COUNT,
  TOTAL_DIVERSION_PLAN_COUNT,
  TOTAL_PARTICIPANT_COUNT,
  TOTAL_SUCCESSFUL_ENROLLMENTS_COUNT,
  TOTAL_UNSUCCESSFUL_ENROLLMENTS_COUNT,
  UNSUCCESSFUL_ENROLLMENTS_BY_COURT_TYPE,
} = STATS;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [DOWNLOAD_DEMOGRAPHICS_DATA]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_ARREST_CHARGE_STATS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_CHARGES_STATS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_COURT_CHARGE_STATS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_HOURS_WORKED_BY_WORKSITE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_MONTHLY_COURT_TYPE_DATA]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_MONTHLY_PARTICIPANTS_BY_WORKSITE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_PARTICIPANTS_DEMOGRAPHICS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_STATS_DATA]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_WORKSITE_STATS_DATA]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [ACTIVE_ENROLLMENTS_BY_COURT_TYPE]: Map(),
  [ARREST_CHARGE_TABLE_DATA]: List(),
  [CLOSED_ENROLLMENTS_BY_COURT_TYPE]: Map(),
  [COURT_CHARGE_TABLE_DATA]: List(),
  [HOURS_BY_WORKSITE]: Map(),
  [MONTHLY_HOURS_WORKED_BY_COURT_TYPE]: Map(),
  [MONTHLY_TOTAL_PARTICIPANTS_BY_COURT_TYPE]: Map(),
  [PARTICIPANTS_BY_WORKSITE]: Map(),
  [REFERRALS_BY_COURT_TYPE_GRAPH_DATA]: Map(),
  [SEX_DEMOGRAPHICS]: Map(),
  [SUCCESSFUL_ENROLLMENTS_BY_COURT_TYPE]: Map(),
  [TOTAL_ACTIVE_ENROLLMENTS_COUNT]: 0,
  [TOTAL_CLOSED_ENROLLMENTS_COUNT]: 0,
  [TOTAL_DIVERSION_PLAN_COUNT]: 0,
  [TOTAL_PARTICIPANT_COUNT]: 0,
  [TOTAL_SUCCESSFUL_ENROLLMENTS_COUNT]: 0,
  [TOTAL_UNSUCCESSFUL_ENROLLMENTS_COUNT]: 0,
  [UNSUCCESSFUL_ENROLLMENTS_BY_COURT_TYPE]: Map(),
});

export default function statsReducer(state :Map<*, *> = INITIAL_STATE, action :Object) :Map<*, *> {

  switch (action.type) {

    case downloadDemographicsData.case(action.type): {

      return downloadDemographicsData.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, DOWNLOAD_DEMOGRAPHICS_DATA, action.id], action)
          .setIn([ACTIONS, DOWNLOAD_DEMOGRAPHICS_DATA, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .setIn([ACTIONS, DOWNLOAD_DEMOGRAPHICS_DATA, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, DOWNLOAD_DEMOGRAPHICS_DATA, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, DOWNLOAD_DEMOGRAPHICS_DATA, action.id]),
      });
    }

    case getArrestChargeStats.case(action.type): {

      return getArrestChargeStats.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_ARREST_CHARGE_STATS, action.id], action)
          .setIn([ACTIONS, GET_ARREST_CHARGE_STATS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = (action :any);
          const arrestChargeTableData = seqAction.value;
          return state
            .set(ARREST_CHARGE_TABLE_DATA, arrestChargeTableData)
            .setIn([ACTIONS, GET_ARREST_CHARGE_STATS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_ARREST_CHARGE_STATS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_ARREST_CHARGE_STATS, action.id]),
      });
    }

    case getChargesStats.case(action.type): {

      return getChargesStats.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_CHARGES_STATS, action.id], action)
          .setIn([ACTIONS, GET_CHARGES_STATS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .setIn([ACTIONS, GET_CHARGES_STATS, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, GET_CHARGES_STATS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_CHARGES_STATS, action.id]),
      });
    }

    case getCourtChargeStats.case(action.type): {

      return getCourtChargeStats.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_COURT_CHARGE_STATS, action.id], action)
          .setIn([ACTIONS, GET_COURT_CHARGE_STATS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = (action :any);
          const courtChargeTableData = seqAction.value;
          return state
            .set(COURT_CHARGE_TABLE_DATA, courtChargeTableData)
            .setIn([ACTIONS, GET_COURT_CHARGE_STATS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_COURT_CHARGE_STATS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_COURT_CHARGE_STATS, action.id]),
      });
    }

    case getHoursWorkedByWorksite.case(action.type): {

      return getHoursWorkedByWorksite.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_HOURS_WORKED_BY_WORKSITE, action.id], action)
          .setIn([ACTIONS, GET_HOURS_WORKED_BY_WORKSITE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = (action :any);
          const hoursByWorksite = seqAction.value;
          return state
            .set(HOURS_BY_WORKSITE, hoursByWorksite)
            .setIn([ACTIONS, GET_HOURS_WORKED_BY_WORKSITE, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_HOURS_WORKED_BY_WORKSITE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_HOURS_WORKED_BY_WORKSITE, action.id]),
      });
    }

    case getMonthlyCourtTypeData.case(action.type): {

      return getMonthlyCourtTypeData.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_MONTHLY_COURT_TYPE_DATA, action.id], action)
          .setIn([ACTIONS, GET_MONTHLY_COURT_TYPE_DATA, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = (action :any);
          const { value } = seqAction;
          const {
            monthlyHoursWorkedByCourtType,
            monthlyTotalParticipantsByCourtType
          } = value;
          return state
            .set(MONTHLY_HOURS_WORKED_BY_COURT_TYPE, monthlyHoursWorkedByCourtType)
            .set(MONTHLY_TOTAL_PARTICIPANTS_BY_COURT_TYPE, monthlyTotalParticipantsByCourtType)
            .setIn([ACTIONS, GET_MONTHLY_COURT_TYPE_DATA, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_MONTHLY_COURT_TYPE_DATA, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_MONTHLY_COURT_TYPE_DATA, action.id]),
      });
    }

    case getMonthlyParticipantsByWorksite.case(action.type): {

      return getMonthlyParticipantsByWorksite.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_MONTHLY_PARTICIPANTS_BY_WORKSITE, action.id], action)
          .setIn([ACTIONS, GET_MONTHLY_PARTICIPANTS_BY_WORKSITE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = (action :any);
          const participantsByWorksite = seqAction.value;
          return state
            .set(PARTICIPANTS_BY_WORKSITE, participantsByWorksite)
            .setIn([ACTIONS, GET_MONTHLY_PARTICIPANTS_BY_WORKSITE, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_MONTHLY_PARTICIPANTS_BY_WORKSITE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_MONTHLY_PARTICIPANTS_BY_WORKSITE, action.id]),
      });
    }

    case getParticipantsDemographics.case(action.type): {

      return getParticipantsDemographics.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_PARTICIPANTS_DEMOGRAPHICS, action.id], action)
          .setIn([ACTIONS, GET_PARTICIPANTS_DEMOGRAPHICS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = (action :any);
          const { ethnicityDemographics, raceDemographics, sexDemographics } = seqAction.value;
          return state
            .set(ETHNICITY_DEMOGRAPHICS, ethnicityDemographics)
            .set(RACE_DEMOGRAPHICS, raceDemographics)
            .set(SEX_DEMOGRAPHICS, sexDemographics)
            .setIn([ACTIONS, GET_PARTICIPANTS_DEMOGRAPHICS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_PARTICIPANTS_DEMOGRAPHICS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_PARTICIPANTS_DEMOGRAPHICS, action.id]),
      });
    }

    case getStatsData.case(action.type): {

      return getStatsData.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_STATS_DATA, action.id], action)
          .setIn([ACTIONS, GET_STATS_DATA, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = (action :any);
          const { value } = seqAction;
          const {
            activeEnrollmentsByCourtType,
            closedEnrollmentsByCourtType,
            referralsByCourtTypeGraphData,
            successfulEnrollmentsByCourtType,
            totalActiveEnrollmentCount,
            totalClosedEnrollmentsCount,
            totalDiversionPlanCount,
            totalParticipantCount,
            totalSuccessfulEnrollmentCount,
            totalUnsuccessfulEnrollmentCount,
            unsuccessfulEnrollmentsByCourtType,
          } = value;
          return state
            .set(ACTIVE_ENROLLMENTS_BY_COURT_TYPE, activeEnrollmentsByCourtType)
            .set(CLOSED_ENROLLMENTS_BY_COURT_TYPE, closedEnrollmentsByCourtType)
            .set(REFERRALS_BY_COURT_TYPE_GRAPH_DATA, referralsByCourtTypeGraphData)
            .set(SUCCESSFUL_ENROLLMENTS_BY_COURT_TYPE, successfulEnrollmentsByCourtType)
            .set(UNSUCCESSFUL_ENROLLMENTS_BY_COURT_TYPE, unsuccessfulEnrollmentsByCourtType)
            .set(TOTAL_ACTIVE_ENROLLMENTS_COUNT, totalActiveEnrollmentCount)
            .set(TOTAL_CLOSED_ENROLLMENTS_COUNT, totalClosedEnrollmentsCount)
            .set(TOTAL_DIVERSION_PLAN_COUNT, totalDiversionPlanCount)
            .set(TOTAL_PARTICIPANT_COUNT, totalParticipantCount)
            .set(TOTAL_SUCCESSFUL_ENROLLMENTS_COUNT, totalSuccessfulEnrollmentCount)
            .set(TOTAL_UNSUCCESSFUL_ENROLLMENTS_COUNT, totalUnsuccessfulEnrollmentCount)
            .setIn([ACTIONS, GET_STATS_DATA, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_STATS_DATA, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_STATS_DATA, action.id]),
      });
    }

    case getWorksiteStatsData.case(action.type): {

      return getWorksiteStatsData.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_WORKSITE_STATS_DATA, action.id], action)
          .setIn([ACTIONS, GET_WORKSITE_STATS_DATA, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .setIn([ACTIONS, GET_WORKSITE_STATS_DATA, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, GET_WORKSITE_STATS_DATA, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_WORKSITE_STATS_DATA, action.id]),
      });
    }

    default:
      return state;
  }
}
