/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';
import type { FQN } from 'lattice';

import { getPropertyFqnFromEdm } from '../../utils/DataUtils';
import { WORKSITES } from '../../utils/constants/ReduxStateConsts';
import { ENTITY_KEY_ID } from '../../core/edm/constants/FullyQualifiedNames';
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
          .setIn([ACTIONS, ADD_WORKSITE, action.id], action)
          .setIn([ACTIONS, ADD_WORKSITE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, ADD_WORKSITE, seqAction.id]);

          if (storedSeqAction) {

            const { value } :Object = seqAction;
            const { edm, worksiteEKID, worksiteESID } = value;

            const storedValue :Object = storedSeqAction.value;
            const { entityData } :Object = storedValue;
            const storedWorksiteEntity :Map = Map(entityData[worksiteESID][0]);

            const { associationEntityData } :Object = storedValue;
            const operatesAssociation = Object.values(associationEntityData)[0];
            const orgEKID = operatesAssociation[0].srcEntityKeyId;

            let newWorksite :Map = Map();
            storedWorksiteEntity.forEach((worksiteValue, id) => {
              const propertyTypeFqn :FQN = getPropertyFqnFromEdm(edm, id);
              newWorksite = newWorksite.set(propertyTypeFqn, worksiteValue);
            });
            newWorksite = newWorksite.set(ENTITY_KEY_ID, worksiteEKID);

            let worksitesByOrg :Map = state.get(WORKSITES_BY_ORG);
            let relevantOrgWorksites :List = worksitesByOrg.get(orgEKID, List());
            relevantOrgWorksites = relevantOrgWorksites.push(newWorksite);
            worksitesByOrg = worksitesByOrg.set(orgEKID, relevantOrgWorksites);

            return state
              .set(WORKSITES_BY_ORG, worksitesByOrg)
              .setIn([ACTIONS, ADD_WORKSITE, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
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
