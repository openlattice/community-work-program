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
import { WORKSITE_STATUSES } from './WorksitesConstants';
import {
  addOrganization,
  addWorksite,
  getOrganizations,
  getWorksite,
  getWorksiteAddress,
  getWorksiteContact,
  getWorksitePlans,
  getWorksites,
  getWorksitesByOrg,
} from './WorksitesActions';

const {
  ACTIONS,
  ADD_ORGANIZATION,
  ADD_WORKSITE,
  CONTACT_EMAIL,
  CONTACT_PERSON,
  CONTACT_PHONE,
  GET_ORGANIZATIONS,
  GET_WORKSITE,
  GET_WORKSITE_ADDRESS,
  GET_WORKSITE_CONTACT,
  GET_WORKSITES,
  GET_WORKSITES_BY_ORG,
  GET_WORKSITE_PLANS,
  REQUEST_STATE,
  ORGANIZATION_STATUSES,
  ORGANIZATIONS_LIST,
  WORKSITE,
  WORKSITE_ADDRESS,
  WORKSITES_BY_ORG,
  WORKSITES_INFO,
  WORKSITES_LIST,
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
    [GET_WORKSITE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_WORKSITE_ADDRESS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_WORKSITE_CONTACT]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_WORKSITES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_WORKSITES_BY_ORG]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_WORKSITE_PLANS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [CONTACT_EMAIL]: Map(),
  [CONTACT_PERSON]: Map(),
  [CONTACT_PHONE]: Map(),
  [ORGANIZATIONS_LIST]: List(),
  [ORGANIZATION_STATUSES]: Map(),
  [WORKSITES_BY_ORG]: Map(),
  [WORKSITES_INFO]: Map(),
  [WORKSITES_LIST]: List(),
  [WORKSITE]: Map(),
  [WORKSITE_ADDRESS]: Map(),
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

            let organizationStatuses :Map = state.get(ORGANIZATION_STATUSES);
            const {
              [DATETIME_END]: end,
              [DATETIME_START]: start
            } = getEntityProperties(newWorksite, [DATETIME_END, DATETIME_START]);

            // If org is already active, or worksite is inactive (so it doesn't change org status):
            if (organizationStatuses.get(orgEKID) === WORKSITE_STATUSES.ACTIVE || (!start && !end)) {
              return state
                .set(WORKSITES_BY_ORG, worksitesByOrg)
                .setIn([ACTIONS, ADD_WORKSITE, REQUEST_STATE], RequestStates.SUCCESS);
            }

            organizationStatuses = organizationStatuses.set(orgEKID, WORKSITE_STATUSES.ACTIVE);
            return state
              .set(WORKSITES_BY_ORG, worksitesByOrg)
              .set(ORGANIZATION_STATUSES, organizationStatuses)
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
        FAILURE: () => state
          .setIn([ACTIONS, GET_WORKSITE_PLANS, REQUEST_STATE], RequestStates.FAILURE),
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

            let organizationStatuses :Map = state.get(ORGANIZATION_STATUSES);
            organizationStatuses = organizationStatuses.set(orgEKID[0], WORKSITE_STATUSES.INACTIVE);

            return state
              .set(ORGANIZATIONS_LIST, organizations)
              .set(ORGANIZATION_STATUSES, organizationStatuses)
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
        FAILURE: () => state
          .setIn([ACTIONS, GET_ORGANIZATIONS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_ORGANIZATIONS, action.id])
      });
    }

    case getWorksitesByOrg.case(action.type): {

      return getWorksitesByOrg.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_WORKSITES_BY_ORG, action.id], action)
          .setIn([ACTIONS, GET_WORKSITES_BY_ORG, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, GET_WORKSITES_BY_ORG, seqAction.id]);

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
              const orgStatus :string = isDefined(currentlyActiveWorksite)
                ? WORKSITE_STATUSES.ACTIVE
                : WORKSITE_STATUSES.INACTIVE;
              organizationStatuses = organizationStatuses.set(orgEKID, orgStatus);
            });

            orgEKIDs.forEach((orgEKID :UUID) => {
              if (!worksitesByOrg.get(orgEKID)) {
                organizationStatuses = organizationStatuses.set(orgEKID, WORKSITE_STATUSES.INACTIVE);
              }
            });

            return state
              .set(ORGANIZATION_STATUSES, organizationStatuses)
              .set(WORKSITES_BY_ORG, worksitesByOrg)
              .setIn([ACTIONS, GET_WORKSITES_BY_ORG, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_WORKSITES_BY_ORG, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_WORKSITES_BY_ORG, action.id])
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
            .set(WORKSITES_LIST, value)
            .setIn([ACTIONS, GET_WORKSITES, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_WORKSITES, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_WORKSITES, action.id])
      });
    }

    case getWorksite.case(action.type): {

      return getWorksite.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_WORKSITE, action.id], fromJS(action))
          .setIn([ACTIONS, GET_WORKSITE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_WORKSITE, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(WORKSITE, value)
            .setIn([ACTIONS, GET_WORKSITE, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_WORKSITE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_WORKSITE, action.id])
      });
    }

    case getWorksiteAddress.case(action.type): {

      return getWorksiteAddress.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_WORKSITE_ADDRESS, action.id], fromJS(action))
          .setIn([ACTIONS, GET_WORKSITE_ADDRESS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_WORKSITE_ADDRESS, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(WORKSITE_ADDRESS, value)
            .setIn([ACTIONS, GET_WORKSITE_ADDRESS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_WORKSITE_ADDRESS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_WORKSITE_ADDRESS, action.id])
      });
    }

    case getWorksiteContact.case(action.type): {

      return getWorksiteContact.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_WORKSITE_CONTACT, action.id], fromJS(action))
          .setIn([ACTIONS, GET_WORKSITE_CONTACT, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_WORKSITE_CONTACT, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }
          const { contactEmail, contactPerson, contactPhone } = value;

          return state
            .set(CONTACT_PERSON, contactPerson)
            .set(CONTACT_EMAIL, contactEmail)
            .set(CONTACT_PHONE, contactPhone)
            .setIn([ACTIONS, GET_WORKSITE_CONTACT, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_WORKSITE_CONTACT, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_WORKSITE_CONTACT, action.id])
      });
    }

    default:
      return state;
  }
}
