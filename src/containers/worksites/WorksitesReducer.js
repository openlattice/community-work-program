/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';
import type { FQN } from 'lattice';

import { isDefined } from '../../utils/LangUtils';
import { getEntityProperties, getPropertyFqnFromEdm } from '../../utils/DataUtils';
import { WORKSITES } from '../../utils/constants/ReduxStateConsts';
import { ENTITY_KEY_ID, WORKSITE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import {
  addOrganization,
  addWorksite,
  getOrganizations,
  getWorksitePlans,
  getWorksitesByOrg,
} from './WorksitesActions';

const {
  ACTIONS,
  ADD_ORGANIZATION,
  ADD_WORKSITE,
  ERRORS,
  GET_ORGANIZATIONS,
  GET_WORKSITES,
  GET_WORKSITE_PLANS,
  REQUEST_STATE,
  ORGANIZATION_STATUSES,
  ORGANIZATIONS_LIST,
  WORKSITES_BY_ORG,
  WORKSITES_INFO,
} = WORKSITES;
const { DATETIME_END, DATETIME_START } = WORKSITE_FQNS;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [ADD_ORGANIZATION]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [ADD_WORKSITE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_ORGANIZATIONS]: {
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
    [ADD_ORGANIZATION]: Map(),
    [ADD_WORKSITE]: Map(),
    [GET_ORGANIZATIONS]: Map(),
    [GET_WORKSITES]: Map(),
    [GET_WORKSITE_PLANS]: Map(),
  },
  [ORGANIZATION_STATUSES]: Map(),
  [ORGANIZATIONS_LIST]: List(),
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

    case addOrganization.case(action.type): {

      return addOrganization.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, ADD_ORGANIZATION, action.id], action)
          .setIn([ACTIONS, ADD_ORGANIZATION, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, ADD_ORGANIZATION, seqAction.id]);

          if (storedSeqAction) {

            const { value } :Object = seqAction;
            const { edm, orgEKID, orgESID } = value;

            const storedValue :Object = storedSeqAction.value;
            const { entityData } :Object = storedValue;

            const storedOrgEntity :Map = Map(entityData[orgESID][0]);

            let newOrg :Map = Map();
            storedOrgEntity.forEach((orgValue, id) => {
              const propertyTypeFqn :FQN = getPropertyFqnFromEdm(edm, id);
              newOrg = newOrg.set(propertyTypeFqn, orgValue);
            });
            newOrg = newOrg.set(ENTITY_KEY_ID, orgEKID);

            const organizations :List = state
              .get(ORGANIZATIONS_LIST)
              .push(newOrg);

            return state
              .set(ORGANIZATIONS_LIST, organizations)
              .setIn([ACTIONS, ADD_ORGANIZATION, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
        },
        FAILURE: () => state
          .setIn([ACTIONS, ADD_ORGANIZATION, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, ADD_ORGANIZATION, action.id]),
      });
    }

    case getOrganizations.case(action.type): {

      return getOrganizations.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_ORGANIZATIONS, action.id], fromJS(action))
          .setIn([ACTIONS, GET_ORGANIZATIONS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_ORGANIZATIONS, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(ORGANIZATIONS_LIST, value)
            .setIn([ACTIONS, GET_ORGANIZATIONS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;
          return state
            .set(ORGANIZATIONS_LIST, List())
            .setIn([ERRORS, GET_ORGANIZATIONS], value)
            .setIn([ACTIONS, GET_ORGANIZATIONS, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_ORGANIZATIONS, action.id])
      });
    }

    case getWorksitesByOrg.case(action.type): {

      return getWorksitesByOrg.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_WORKSITES, action.id], action)
          .setIn([ACTIONS, GET_WORKSITES, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, GET_WORKSITES, seqAction.id]);

          const { value } :Object = seqAction;
          const { worksitesByOrg } = value;

          if (storedSeqAction) {

            const storedValue :Object = storedSeqAction.value;
            const { organizationEKIDs: orgEKIDs } = storedValue;

            let organizationStatuses :Map = Map();
            worksitesByOrg.forEach((worksiteList :List, orgEKID :UUID) => {
              const currentlyActiveWorksite :Map = worksiteList ? worksiteList.find((worksite :Map) => {
                const {
                  [DATETIME_END]: end,
                  [DATETIME_START]: start
                } = getEntityProperties(worksite, [DATETIME_END, DATETIME_START]);
                return start && !end;
              }) : undefined;
              const orgStatus :string = isDefined(currentlyActiveWorksite) ? 'Active' : 'Inactive';
              organizationStatuses = organizationStatuses.set(orgEKID, orgStatus);
            });

            orgEKIDs.forEach((orgEKID :UUID) => {
              if (!worksitesByOrg.get(orgEKID)) organizationStatuses = organizationStatuses.set(orgEKID, 'Inactive');
            });

            return state
              .set(ORGANIZATION_STATUSES, organizationStatuses)
              .set(WORKSITES_BY_ORG, worksitesByOrg)
              .setIn([ACTIONS, GET_WORKSITES, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
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

    default:
      return state;
  }
}
