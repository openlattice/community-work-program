// @flow
import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { addToAvailableCourtCharges, getArrestCharges, getCourtCharges } from './ChargesActions';
import { CHARGES, SHARED } from '../../../utils/constants/ReduxStateConsts';

const { ACTIONS, REQUEST_STATE } = SHARED;
const {
  ADD_TO_AVAILABLE_COURT_CHARGES,
  ARREST_CHARGES,
  COURT_CHARGES,
  GET_ARREST_CHARGES,
  GET_COURT_CHARGES,
} = CHARGES;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [GET_ARREST_CHARGES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_COURT_CHARGES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    }
  },
  [ARREST_CHARGES]: List(),
  [COURT_CHARGES]: List(),
});

export default function chargesReducer(state :Map = INITIAL_STATE, action :SequenceAction) :Map {

  switch (action.type) {

    case addToAvailableCourtCharges.case(action.type): {

      return addToAvailableCourtCharges.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, ADD_TO_AVAILABLE_COURT_CHARGES, action.id], action)
          .setIn([ACTIONS, ADD_TO_AVAILABLE_COURT_CHARGES, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const successValue :Object = seqAction.value;
          const { newCharge } = successValue;

          let courtCharges = state.get(COURT_CHARGES, List());
          courtCharges = courtCharges.push(newCharge);

          return state
            .set(COURT_CHARGES, courtCharges)
            .setIn([ACTIONS, ADD_TO_AVAILABLE_COURT_CHARGES, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, ADD_TO_AVAILABLE_COURT_CHARGES, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, ADD_TO_AVAILABLE_COURT_CHARGES, action.id]),
      });
    }

    case getArrestCharges.case(action.type): {

      return getArrestCharges.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_ARREST_CHARGES, action.id], fromJS(action))
          .setIn([ACTIONS, GET_ARREST_CHARGES, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_ARREST_CHARGES, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(ARREST_CHARGES, value)
            .setIn([ACTIONS, GET_ARREST_CHARGES, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_ARREST_CHARGES, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_ARREST_CHARGES, action.id])
      });
    }

    case getCourtCharges.case(action.type): {

      return getCourtCharges.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_COURT_CHARGES, action.id], fromJS(action))
          .setIn([ACTIONS, GET_COURT_CHARGES, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_COURT_CHARGES, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(COURT_CHARGES, value)
            .setIn([ACTIONS, GET_COURT_CHARGES, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_COURT_CHARGES, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_COURT_CHARGES, action.id])
      });
    }

    default:
      return state;
  }
}
