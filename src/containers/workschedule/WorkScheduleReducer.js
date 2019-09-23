/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  findAppointments,
  getWorksiteAndPersonNames,
} from './WorkScheduleActions';
import { WORK_SCHEDULE } from '../../utils/constants/ReduxStateConsts';

const {
  ACTIONS,
  APPOINTMENTS,
  FIND_APPOINTMENTS,
  GET_WORKSITE_NAMES_FOR_APPOINTMENTS,
  REQUEST_STATE,
  PERSON_NAMES_BY_APPOINTMENT_EKID,
  WORKSITE_NAMES_BY_APPOINTMENT_EKID,
} = WORK_SCHEDULE;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [FIND_APPOINTMENTS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_WORKSITE_NAMES_FOR_APPOINTMENTS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [APPOINTMENTS]: List(),
  [PERSON_NAMES_BY_APPOINTMENT_EKID]: Map(),
  [WORKSITE_NAMES_BY_APPOINTMENT_EKID]: Map(),
});

export default function worksitesReducer(state :Map<*, *> = INITIAL_STATE, action :SequenceAction) :Map<*, *> {

  switch (action.type) {

    case findAppointments.case(action.type): {

      return findAppointments.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, FIND_APPOINTMENTS, action.id], action)
          .setIn([ACTIONS, FIND_APPOINTMENTS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, FIND_APPOINTMENTS, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(APPOINTMENTS, value)
            .setIn([ACTIONS, FIND_APPOINTMENTS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set(APPOINTMENTS, List())
          .setIn([ACTIONS, FIND_APPOINTMENTS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, FIND_APPOINTMENTS, action.id]),
      });
    }

    case getWorksiteAndPersonNames.case(action.type): {

      return getWorksiteAndPersonNames.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_WORKSITE_NAMES_FOR_APPOINTMENTS, action.id], action)
          .setIn([ACTIONS, GET_WORKSITE_NAMES_FOR_APPOINTMENTS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_WORKSITE_NAMES_FOR_APPOINTMENTS, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(PERSON_NAMES_BY_APPOINTMENT_EKID, value.personNamesByAppointmentEKID)
            .set(WORKSITE_NAMES_BY_APPOINTMENT_EKID, value.worksiteNamesByAppointmentEKID)
            .setIn([ACTIONS, GET_WORKSITE_NAMES_FOR_APPOINTMENTS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set(PERSON_NAMES_BY_APPOINTMENT_EKID, Map())
          .set(WORKSITE_NAMES_BY_APPOINTMENT_EKID, Map())
          .setIn([ACTIONS, GET_WORKSITE_NAMES_FOR_APPOINTMENTS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_WORKSITE_NAMES_FOR_APPOINTMENTS, action.id]),
      });
    }

    default:
      return state;
  }
}
