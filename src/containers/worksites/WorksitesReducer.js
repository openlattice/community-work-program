/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { WORKSITES } from '../../utils/constants/ReduxStateConsts';

import {
  addWorksite,
  getWorksites,
  getWorksitePlans,
} from './WorksitesActions';

const {
  ACTIONS,
  ADD_WORKSITE,
  ERRORS,
  GET_WORKSITES,
  GET_WORKSITE_PLANS,
  REQUEST_STATE,
  WORKSITES_BY_ORG,
  WORKSITES_INFO,
} = WORKSITES;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [ADD_WORKSITE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_WORKSITES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_WORKSITE_PLANS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [ERRORS]: {
    [ADD_WORKSITE]: Map(),
    [GET_WORKSITES]: Map(),
    [GET_WORKSITE_PLANS]: Map(),
  },
  [WORKSITES_BY_ORG]: Map(),
  [WORKSITES_INFO]: Map(),
});

export default function worksitesReducer(state :Map<*, *> = INITIAL_STATE, action :SequenceAction) :Map<*, *> {

  switch (action.type) {

    case addWorksite.case(action.type): {

      return addWorksite.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, ADD_WORKSITE, action.id], fromJS(action))
          .setIn([ACTIONS, ADD_WORKSITE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, ADD_WORKSITE, action.id])) {
            return state;
          }

          return state
            .setIn([ACTIONS, ADD_WORKSITE, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, ADD_WORKSITE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, ADD_WORKSITE, action.id]),
      });
    }

    case getWorksites.case(action.type): {

      return getWorksites.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_WORKSITES, action.id], fromJS(action))
          .setIn([ACTIONS, GET_WORKSITES, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_WORKSITES, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(WORKSITES_BY_ORG, value)
            .setIn([ACTIONS, GET_WORKSITES, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;
          return state
            .set(WORKSITES_BY_ORG, Map())
            .setIn([ERRORS, GET_WORKSITES], value)
            .setIn([ACTIONS, GET_WORKSITES, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_WORKSITES, action.id])
      });
    }

    case getWorksitePlans.case(action.type): {

      return getWorksitePlans.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_WORKSITE_PLANS, action.id], fromJS(action))
          .setIn([ACTIONS, GET_WORKSITE_PLANS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_WORKSITE_PLANS, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(WORKSITES_INFO, value)
            .setIn([ACTIONS, GET_WORKSITE_PLANS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;
          return state
            .set(WORKSITES_INFO, Map())
            .setIn([ERRORS, GET_WORKSITE_PLANS], value)
            .setIn([ACTIONS, GET_WORKSITE_PLANS, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_WORKSITE_PLANS, action.id])
      });
    }

    default:
      return state;
  }
}
