// @flow
import {
  List,
  Map,
  fromJS,
} from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';
import type { FQN } from 'lattice';

import {
  addWorksitePlan,
  editWorksitePlan,
  getWorksiteByWorksitePlan,
  getWorksitePlanStatuses,
  getWorksitePlans,
  updateHoursWorked,
} from './WorksitePlanActions';
import {
  getEntityKeyId,
  getPropertyFqnFromEdm,
} from '../../../utils/DataUtils';
import { WORKSITE_PLANS } from '../../../utils/constants/ReduxStateConsts';
import { ENTITY_KEY_ID } from '../../../core/edm/constants/FullyQualifiedNames';

const {
  ACTIONS,
  ADD_WORKSITE_PLAN,
  EDIT_WORKSITE_PLAN,
  GET_WORKSITE_BY_WORKSITE_PLAN,
  GET_WORKSITE_PLANS,
  GET_WORKSITE_PLAN_STATUSES,
  REQUEST_STATE,
  UPDATE_HOURS_WORKED,
  WORKSITES_BY_WORKSITE_PLAN,
  WORKSITE_PLANS_LIST,
  WORKSITE_PLAN_STATUSES,
} = WORKSITE_PLANS;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [ADD_WORKSITE_PLAN]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_WORKSITE_PLAN]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_WORKSITE_BY_WORKSITE_PLAN]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_WORKSITE_PLANS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_WORKSITE_PLAN_STATUSES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [UPDATE_HOURS_WORKED]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [WORKSITES_BY_WORKSITE_PLAN]: Map(),
  [WORKSITE_PLANS_LIST]: List(),
  [WORKSITE_PLAN_STATUSES]: Map(),
});

export default function worksitePlanReducer(state :Map<*, *> = INITIAL_STATE, action :SequenceAction) :Map<*, *> {

  switch (action.type) {

    case addWorksitePlan.case(action.type): {

      return addWorksitePlan.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, ADD_WORKSITE_PLAN, action.id], action)
          .setIn([ACTIONS, ADD_WORKSITE_PLAN, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, ADD_WORKSITE_PLAN, seqAction.id]);

          if (storedSeqAction) {

            const successValue :Object = seqAction.value;
            const {
              basedOnESID,
              edm,
              enrollmentStatusESID,
              worksitePlanEKID,
              worksitePlanESID,
              worksitePlanStatusEKID,
              worksitesList,
            } = successValue;

            const requestValue :Object = storedSeqAction.value;
            const { associationEntityData, entityData } :Object = requestValue;
            const storedWorksitePlanEntity :Map = fromJS(entityData[worksitePlanESID][0]);
            const storedWorksitePlanStatusEntity :Map = fromJS(entityData[enrollmentStatusESID][0]);
            const worksiteEKID = associationEntityData[basedOnESID][0].dstEntityKeyId;

            let newWorksitePlan :Map = Map();
            storedWorksitePlanEntity.forEach((planValue, planId) => {
              const propertyTypeFqn :FQN = getPropertyFqnFromEdm(edm, planId);
              newWorksitePlan = newWorksitePlan.set(propertyTypeFqn, planValue);
            });
            newWorksitePlan = newWorksitePlan.set(ENTITY_KEY_ID, worksitePlanEKID);

            const worksitePlans = state.get(WORKSITE_PLANS_LIST)
              .push(newWorksitePlan);

            const worksite :Map = worksitesList.find((site :Map) => getEntityKeyId(site) === worksiteEKID);
            const worksitesByWorksitePlan = state.get(WORKSITES_BY_WORKSITE_PLAN)
              .set(worksitePlanEKID, worksite);

            let newStatus :Map = Map();
            storedWorksitePlanStatusEntity.forEach((statusValue, statusId) => {
              const propertyTypeFqn :FQN = getPropertyFqnFromEdm(edm, statusId);
              newStatus = newStatus.set(propertyTypeFqn, statusValue);
            });
            newStatus = newStatus.set(ENTITY_KEY_ID, worksitePlanStatusEKID);

            const worksitePlanStatuses = state.get(WORKSITE_PLAN_STATUSES)
              .set(worksitePlanEKID, newStatus);

            return state
              .set(WORKSITE_PLANS_LIST, worksitePlans)
              .set(WORKSITES_BY_WORKSITE_PLAN, worksitesByWorksitePlan)
              .set(WORKSITE_PLAN_STATUSES, worksitePlanStatuses)
              .setIn([ACTIONS, ADD_WORKSITE_PLAN, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
        },
        FAILURE: () => state
          .setIn([ACTIONS, ADD_WORKSITE_PLAN, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, ADD_WORKSITE_PLAN, action.id]),
      });
    }

    case editWorksitePlan.case(action.type): {

      return editWorksitePlan.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, EDIT_WORKSITE_PLAN, action.id], action)
          .setIn([ACTIONS, EDIT_WORKSITE_PLAN, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, EDIT_WORKSITE_PLAN, seqAction.id]);

          if (storedSeqAction) {

            const successValue :Object = seqAction.value;
            const {
              edm,
              enrollmentStatusESID,
              worksitePlanEKID,
              worksitePlanESID,
              worksitePlanStatusEKID,
            } = successValue;

            const requestValue :Object = storedSeqAction.value;
            let { statusEntityData, worksitePlanDataToEdit } :Object = requestValue;

            statusEntityData = fromJS(statusEntityData);
            worksitePlanDataToEdit = fromJS(worksitePlanDataToEdit);

            let worksitePlanStatuses :Map = state.get(WORKSITE_PLAN_STATUSES);
            let worksitePlans :List = state.get(WORKSITE_PLANS_LIST);

            if (!statusEntityData.isEmpty()) {
              const storedStatusEntity :Map = statusEntityData.getIn([enrollmentStatusESID, 0]);

              let newWorksitePlanStatus :Map = Map();
              storedStatusEntity.forEach((statusValue, id) => {
                const propertyTypeFqn :FQN = getPropertyFqnFromEdm(edm, id);
                newWorksitePlanStatus = newWorksitePlanStatus.set(propertyTypeFqn, statusValue);
              });
              newWorksitePlanStatus = newWorksitePlanStatus.set(ENTITY_KEY_ID, worksitePlanStatusEKID);

              let currentWorksitePlanStatus = worksitePlanStatuses.get(worksitePlanEKID, Map());
              currentWorksitePlanStatus = newWorksitePlanStatus;
              worksitePlanStatuses = worksitePlanStatuses.set(worksitePlanEKID, currentWorksitePlanStatus);
            }

            if (!worksitePlanDataToEdit.isEmpty()) {
              const storedWorksitePlanEntity :Map = worksitePlanDataToEdit.getIn([worksitePlanESID, worksitePlanEKID]);

              let worksitePlan :Map = worksitePlans.find((plan :Map) => getEntityKeyId(plan) === worksitePlanEKID);
              const indexOfWorksitePlan :number = worksitePlans.indexOf(worksitePlan);

              storedWorksitePlanEntity.forEach((planValue, id) => {
                const propertyTypeFqn :FQN = getPropertyFqnFromEdm(edm, id);
                let entityValue = worksitePlan.get(propertyTypeFqn, '');
                entityValue = planValue;
                worksitePlan = worksitePlan.set(propertyTypeFqn, entityValue);
              });

              worksitePlans = worksitePlans.set(indexOfWorksitePlan, worksitePlan);
            }

            return state
              .set(WORKSITE_PLANS_LIST, worksitePlans)
              .set(WORKSITE_PLAN_STATUSES, worksitePlanStatuses)
              .setIn([ACTIONS, EDIT_WORKSITE_PLAN, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_WORKSITE_PLAN, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_WORKSITE_PLAN, action.id]),
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
            .set(WORKSITE_PLANS_LIST, value)
            .setIn([ACTIONS, GET_WORKSITE_PLANS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set(WORKSITE_PLANS_LIST, Map())
          .setIn([ACTIONS, GET_WORKSITE_PLANS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_WORKSITE_PLANS, action.id])
      });
    }

    case getWorksiteByWorksitePlan.case(action.type): {

      return getWorksiteByWorksitePlan.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_WORKSITE_BY_WORKSITE_PLAN, action.id], fromJS(action))
          .setIn([ACTIONS, GET_WORKSITE_BY_WORKSITE_PLAN, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_WORKSITE_BY_WORKSITE_PLAN, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(WORKSITES_BY_WORKSITE_PLAN, value)
            .setIn([ACTIONS, GET_WORKSITE_BY_WORKSITE_PLAN, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_WORKSITE_BY_WORKSITE_PLAN, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_WORKSITE_BY_WORKSITE_PLAN, action.id])
      });
    }

    case getWorksitePlanStatuses.case(action.type): {

      return getWorksitePlanStatuses.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_WORKSITE_PLAN_STATUSES, action.id], fromJS(action))
          .setIn([ACTIONS, GET_WORKSITE_PLAN_STATUSES, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_WORKSITE_PLAN_STATUSES, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(WORKSITE_PLAN_STATUSES, value)
            .setIn([ACTIONS, GET_WORKSITE_PLAN_STATUSES, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_WORKSITE_PLAN_STATUSES, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_WORKSITE_PLAN_STATUSES, action.id])
      });
    }

    case updateHoursWorked.case(action.type): {

      return updateHoursWorked.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, UPDATE_HOURS_WORKED, action.id], action)
          .setIn([ACTIONS, UPDATE_HOURS_WORKED, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, UPDATE_HOURS_WORKED, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          const worksitePlanEKID :UUID = getEntityKeyId(value);
          let worksitePlans :List = state.get(WORKSITE_PLANS_LIST);
          const worksitePlanToReplace :number = worksitePlans
            .findKey((worksitePlan :Map) => worksitePlanEKID === getEntityKeyId(worksitePlan));
          worksitePlans = worksitePlans.set(worksitePlanToReplace, value);

          return state
            .set(WORKSITE_PLANS_LIST, worksitePlans)
            .setIn([ACTIONS, GET_WORKSITE_BY_WORKSITE_PLAN, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, UPDATE_HOURS_WORKED, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, UPDATE_HOURS_WORKED, action.id]),
      });
    }

    default:
      return state;
  }
}
