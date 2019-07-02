/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { WORKSITES } from '../../utils/constants/ReduxStateConsts';

import {
  getWorksites,
  getWorksitePlans,
} from './WorksitesActions';

const {
  ACTIONS,
  ERRORS,
  GET_WORKSITES,
  GET_WORKSITE_PLANS,
  REQUEST_STATE,
  WORKSITES_BY_ORG,
  WORKSITE_PLANS_BY_WORKSITE,
} = WORKSITES;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [GET_WORKSITES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_WORKSITE_PLANS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [ERRORS]: {
    [GET_WORKSITES]: Map(),
    [GET_WORKSITE_PLANS]: Map(),
  },
  [WORKSITES_BY_ORG]: Map(),
  [WORKSITE_PLANS_BY_WORKSITE]: Map(),
});

export default function worksitesReducer(state :Map<*, *> = INITIAL_STATE, action :SequenceAction) :Map<*, *> {

  switch (action.type) {

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
            .set(WORKSITE_PLANS_BY_WORKSITE, value)
            .setIn([ACTIONS, GET_WORKSITE_PLANS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;
          return state
            .set(WORKSITE_PLANS_BY_WORKSITE, Map())
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
