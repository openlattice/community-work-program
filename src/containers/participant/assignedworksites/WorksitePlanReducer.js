/*
 * @flow
 */

import {
  List,
  Map,
  fromJS,
} from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { FQN, UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  CLEAR_APPOINTMENTS_AND_PLANS,
  DELETE_APPOINTMENT,
  RESET_CHECK_IN_REQUEST_STATE,
  RESET_DELETE_CHECK_IN_REQUEST_STATE,
  addWorksitePlan,
  checkInForAppointment,
  createWorkAppointments,
  deleteAppointment,
  deleteCheckIn,
  editAppointment,
  editWorksitePlan,
  getAppointmentCheckIns,
  getWorkAppointments,
  getWorksiteByWorksitePlan,
  getWorksitePlanStatuses,
  getWorksitePlans,
  updateHoursWorked,
} from './WorksitePlanActions';

import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { RESET_REQUEST_STATE } from '../../../core/redux/actions';
import { resetRequestStateReducer } from '../../../core/redux/reducers';
import {
  findEntityPathInMap,
  getEntityKeyId,
  getPropertyFqnFromEdm,
} from '../../../utils/DataUtils';
import { WORKSITE_PLANS } from '../../../utils/constants/ReduxStateConsts';

const {
  ACTIONS,
  ADD_WORKSITE_PLAN,
  CHECK_INS_BY_APPOINTMENT,
  CHECK_IN_FOR_APPOINTMENT,
  CREATE_WORK_APPOINTMENTS,
  DELETE_CHECK_IN,
  EDIT_APPOINTMENT,
  EDIT_WORKSITE_PLAN,
  GET_APPOINTMENT_CHECK_INS,
  GET_WORKSITE_BY_WORKSITE_PLAN,
  GET_WORKSITE_PLANS,
  GET_WORKSITE_PLAN_STATUSES,
  GET_WORK_APPOINTMENTS,
  REQUEST_STATE,
  UPDATE_HOURS_WORKED,
  WORKSITES_BY_WORKSITE_PLAN,
  WORKSITE_PLANS_LIST,
  WORKSITE_PLAN_EKID_BY_APPOINTMENT_EKID,
  WORKSITE_PLAN_STATUSES,
  WORK_APPOINTMENTS_BY_WORKSITE_PLAN,
} = WORKSITE_PLANS;

const {
  DATETIME_END,
  ENTITY_KEY_ID,
  INCIDENT_START_DATETIME,
} = PROPERTY_TYPE_FQNS;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [ADD_WORKSITE_PLAN]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [CHECK_IN_FOR_APPOINTMENT]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [CREATE_WORK_APPOINTMENTS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [DELETE_APPOINTMENT]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [DELETE_CHECK_IN]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_APPOINTMENT]: {
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
    [GET_APPOINTMENT_CHECK_INS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_WORK_APPOINTMENTS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [UPDATE_HOURS_WORKED]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [CHECK_INS_BY_APPOINTMENT]: Map(),
  [WORKSITES_BY_WORKSITE_PLAN]: Map(),
  [WORKSITE_PLANS_LIST]: List(),
  [WORKSITE_PLAN_EKID_BY_APPOINTMENT_EKID]: Map(),
  [WORKSITE_PLAN_STATUSES]: Map(),
  [WORK_APPOINTMENTS_BY_WORKSITE_PLAN]: Map(),
});

export default function worksitePlanReducer(state :Map<*, *> = INITIAL_STATE, action :SequenceAction) :Map<*, *> {

  switch (action.type) {

    case CLEAR_APPOINTMENTS_AND_PLANS: {
      return state
        .set(CHECK_INS_BY_APPOINTMENT, Map())
        .set(WORKSITES_BY_WORKSITE_PLAN, Map())
        .set(WORKSITE_PLANS_LIST, List())
        .set(WORKSITE_PLAN_STATUSES, Map())
        .set(WORK_APPOINTMENTS_BY_WORKSITE_PLAN, Map());
    }

    case RESET_CHECK_IN_REQUEST_STATE: {
      return state
        .setIn([ACTIONS, CHECK_IN_FOR_APPOINTMENT, REQUEST_STATE], RequestStates.STANDBY);
    }

    case RESET_DELETE_CHECK_IN_REQUEST_STATE: {
      return state
        .setIn([ACTIONS, DELETE_CHECK_IN, REQUEST_STATE], RequestStates.STANDBY);
    }

    case RESET_REQUEST_STATE: {
      return resetRequestStateReducer(state, action);
    }

    case checkInForAppointment.case(action.type): {

      return checkInForAppointment.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, CHECK_IN_FOR_APPOINTMENT, action.id], action)
          .setIn([ACTIONS, CHECK_IN_FOR_APPOINTMENT, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = (action :any);
          const { value } = seqAction;
          const { appointmentEKID, newCheckIn } = value;

          let checkInsByAppointment :Map = state.get(CHECK_INS_BY_APPOINTMENT);
          checkInsByAppointment = checkInsByAppointment.set(appointmentEKID, newCheckIn);

          return state
            .set(CHECK_INS_BY_APPOINTMENT, checkInsByAppointment)
            .setIn([ACTIONS, CHECK_IN_FOR_APPOINTMENT, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, CHECK_IN_FOR_APPOINTMENT, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, CHECK_IN_FOR_APPOINTMENT, action.id])
      });
    }

    case createWorkAppointments.case(action.type): {

      return createWorkAppointments.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, CREATE_WORK_APPOINTMENTS, action.id], action)
          .setIn([ACTIONS, CREATE_WORK_APPOINTMENTS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, CREATE_WORK_APPOINTMENTS, seqAction.id]);

          if (storedSeqAction) {

            const successValue :Object = seqAction.value;
            const {
              addressesESID,
              appointmentEKIDs,
              appointmentESID,
              edm,
            } = successValue;
            const requestValue :Object = storedSeqAction.value;
            const { associationEntityData, entityData } :Object = requestValue;

            const worksitePlanEKID :UUID = associationEntityData[addressesESID][0].dstEntityKeyId;

            const storedAppointmentEntities :List = fromJS(entityData[appointmentESID]);
            let newAppointmentEntities :List = List();
            storedAppointmentEntities.forEach((appointment :Map, i :number) => {

              let newAppointment :Map = Map();
              appointment.forEach((value, id) => {
                const propertyTypeFqn :FQN = getPropertyFqnFromEdm(edm, id);
                newAppointment = newAppointment.set(propertyTypeFqn, value);
              });

              newAppointment = newAppointment.set(ENTITY_KEY_ID, appointmentEKIDs[i]);
              newAppointmentEntities = newAppointmentEntities.push(newAppointment);
            });

            let workAppointmentsByWorksitePlan :Map = state.get(WORK_APPOINTMENTS_BY_WORKSITE_PLAN);
            let worksitePlanAppointments :List = workAppointmentsByWorksitePlan.get(worksitePlanEKID, List());

            worksitePlanAppointments = worksitePlanAppointments.concat(newAppointmentEntities);
            workAppointmentsByWorksitePlan = workAppointmentsByWorksitePlan
              .set(worksitePlanEKID, worksitePlanAppointments);

            return state
              .set(WORK_APPOINTMENTS_BY_WORKSITE_PLAN, workAppointmentsByWorksitePlan)
              .setIn([ACTIONS, CREATE_WORK_APPOINTMENTS, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
        },
        FAILURE: () => state
          .setIn([ACTIONS, CREATE_WORK_APPOINTMENTS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, CREATE_WORK_APPOINTMENTS, action.id])
      });
    }

    case deleteAppointment.case(action.type): {

      return deleteAppointment.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, DELETE_APPOINTMENT, action.id], action)
          .setIn([ACTIONS, DELETE_APPOINTMENT, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, DELETE_APPOINTMENT, seqAction.id]);

          if (storedSeqAction) {

            const requestValue :Object = storedSeqAction.value;
            const { entityKeyIds } :Object = requestValue[0];
            const [entityKeyId] = entityKeyIds;

            let workAppointmentsByWorksitePlan = state.get(WORK_APPOINTMENTS_BY_WORKSITE_PLAN);

            const [keyEKID, index] = findEntityPathInMap(workAppointmentsByWorksitePlan, entityKeyId);
            if (index !== -1) {
              workAppointmentsByWorksitePlan = workAppointmentsByWorksitePlan
                .deleteIn([keyEKID, index]);
              return state
                .set(WORK_APPOINTMENTS_BY_WORKSITE_PLAN, workAppointmentsByWorksitePlan)
                .setIn([ACTIONS, DELETE_APPOINTMENT, REQUEST_STATE], RequestStates.SUCCESS);
            }
          }

          return state
            .setIn([ACTIONS, DELETE_APPOINTMENT, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, DELETE_APPOINTMENT, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, DELETE_APPOINTMENT, action.id]),
      });
    }

    case deleteCheckIn.case(action.type): {

      return deleteCheckIn.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, DELETE_CHECK_IN, action.id], action)
          .setIn([ACTIONS, DELETE_CHECK_IN, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, DELETE_CHECK_IN, seqAction.id]);

          if (storedSeqAction) {

            const requestValue :Object = storedSeqAction.value;
            const { appointmentEKID } :Object = requestValue;

            let checkInsByAppointment :Map = state.get(CHECK_INS_BY_APPOINTMENT, Map());
            checkInsByAppointment = checkInsByAppointment.delete(appointmentEKID);

            return state
              .set(CHECK_INS_BY_APPOINTMENT, checkInsByAppointment)
              .setIn([ACTIONS, DELETE_CHECK_IN, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state
            .setIn([ACTIONS, DELETE_CHECK_IN, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, DELETE_CHECK_IN, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, DELETE_CHECK_IN, action.id]),
      });
    }

    case editAppointment.case(action.type): {

      return editAppointment.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, EDIT_APPOINTMENT, action.id], action)
          .setIn([ACTIONS, EDIT_APPOINTMENT, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, EDIT_APPOINTMENT, seqAction.id]);

          if (storedSeqAction) {

            const successValue :Object = seqAction.value;
            const {
              appointmentEKID,
              appointmentESID,
              endDateTimePTID,
              newWorksitePlanEKID,
              startDateTimePTID,
            } = successValue;

            const requestValue :Object = storedSeqAction.value;
            const { entityData } :Object = requestValue;

            let workAppointmentsByWorksitePlan = state.get(WORK_APPOINTMENTS_BY_WORKSITE_PLAN);
            const [keyEKID, index] = findEntityPathInMap(workAppointmentsByWorksitePlan, appointmentEKID);
            if (index !== -1) {

              const newAppointmentData :Map = fromJS(entityData[appointmentESID][appointmentEKID]);
              const newStartDateTime :string = newAppointmentData.getIn([startDateTimePTID, 0]);
              const newEndDateTime :string = newAppointmentData.getIn([endDateTimePTID, 0]);

              if (!newWorksitePlanEKID.length || newWorksitePlanEKID === keyEKID) {
                if (newStartDateTime) {
                  workAppointmentsByWorksitePlan = workAppointmentsByWorksitePlan.setIn([
                    keyEKID,
                    index,
                    INCIDENT_START_DATETIME,
                  ], List([newStartDateTime]));
                }
                if (newEndDateTime) {
                  workAppointmentsByWorksitePlan = workAppointmentsByWorksitePlan.setIn([
                    keyEKID,
                    index,
                    DATETIME_END,
                  ], List([newEndDateTime]));
                }
              }
              else {
                let workAppointment :Map = workAppointmentsByWorksitePlan.getIn([keyEKID, index]);
                let appointmentsForNewWorksitePlan :List = workAppointmentsByWorksitePlan
                  .get(newWorksitePlanEKID, List());

                workAppointment = workAppointment.set(INCIDENT_START_DATETIME, List([newStartDateTime]));
                workAppointment = workAppointment.set(DATETIME_END, List([newEndDateTime]));
                appointmentsForNewWorksitePlan = appointmentsForNewWorksitePlan.push(workAppointment);

                workAppointmentsByWorksitePlan = workAppointmentsByWorksitePlan
                  .set(newWorksitePlanEKID, appointmentsForNewWorksitePlan);
                workAppointmentsByWorksitePlan = workAppointmentsByWorksitePlan.deleteIn([keyEKID, index]);
              }

              return state
                .set(WORK_APPOINTMENTS_BY_WORKSITE_PLAN, workAppointmentsByWorksitePlan)
                .setIn([ACTIONS, EDIT_APPOINTMENT, REQUEST_STATE], RequestStates.SUCCESS);
            }
          }

          return state
            .setIn([ACTIONS, EDIT_APPOINTMENT, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_APPOINTMENT, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_APPOINTMENT, action.id]),
      });
    }

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

    case getAppointmentCheckIns.case(action.type): {

      return getAppointmentCheckIns.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_APPOINTMENT_CHECK_INS, action.id], fromJS(action))
          .setIn([ACTIONS, GET_APPOINTMENT_CHECK_INS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_APPOINTMENT_CHECK_INS, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(CHECK_INS_BY_APPOINTMENT, value)
            .setIn([ACTIONS, GET_APPOINTMENT_CHECK_INS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_APPOINTMENT_CHECK_INS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_APPOINTMENT_CHECK_INS, action.id])
      });
    }

    case getWorkAppointments.case(action.type): {

      return getWorkAppointments.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_WORK_APPOINTMENTS, action.id], fromJS(action))
          .setIn([ACTIONS, GET_WORK_APPOINTMENTS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const { workAppointmentsByWorksitePlan, worksitePlanEKIDByAppointmentEKID } = action.value;
          return state
            .set(WORK_APPOINTMENTS_BY_WORKSITE_PLAN, workAppointmentsByWorksitePlan)
            .set(WORKSITE_PLAN_EKID_BY_APPOINTMENT_EKID, worksitePlanEKIDByAppointmentEKID)
            .setIn([ACTIONS, GET_WORK_APPOINTMENTS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_WORK_APPOINTMENTS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_WORK_APPOINTMENTS, action.id])
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
