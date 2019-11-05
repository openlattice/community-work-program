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
  checkInForAppointment,
  createWorkAppointments,
  deleteAppointment,
  editAppointment,
  getAppointmentCheckIns,
  getWorkAppointments,
} from './ParticipantScheduleActions';
import {
  findEntityPathInMap,
  getPropertyFqnFromEdm,
  getPropertyTypeIdFromEdm,
} from '../../../utils/DataUtils';
import { PARTICIPANT_SCHEDULE } from '../../../utils/constants/ReduxStateConsts';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const {
  ACTIONS,
  CHECK_INS_BY_APPOINTMENT,
  CHECK_IN_FOR_APPOINTMENT,
  CREATE_WORK_APPOINTMENTS,
  DELETE_APPOINTMENT,
  EDIT_APPOINTMENT,
  GET_APPOINTMENT_CHECK_INS,
  GET_WORK_APPOINTMENTS,
  REQUEST_STATE,
  WORK_APPOINTMENTS_BY_WORKSITE_PLAN,
} = PARTICIPANT_SCHEDULE;
const {
  DATETIME_END,
  ENTITY_KEY_ID,
  INCIDENT_START_DATETIME,
  HOURS_WORKED,
} = PROPERTY_TYPE_FQNS;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [CHECK_IN_FOR_APPOINTMENT]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [CREATE_WORK_APPOINTMENTS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [DELETE_APPOINTMENT]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_APPOINTMENT]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_APPOINTMENT_CHECK_INS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_WORK_APPOINTMENTS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [CHECK_INS_BY_APPOINTMENT]: Map(),
  [WORK_APPOINTMENTS_BY_WORKSITE_PLAN]: Map(),
});

export default function participantScheduleReducer(
  state :Map<*, *> = INITIAL_STATE,
  action :SequenceAction
) :Map<*, *> {

  switch (action.type) {

    case checkInForAppointment.case(action.type): {

      return checkInForAppointment.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, CHECK_IN_FOR_APPOINTMENT, action.id], action)
          .setIn([ACTIONS, CHECK_IN_FOR_APPOINTMENT, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, CHECK_IN_FOR_APPOINTMENT, seqAction.id]);

          if (storedSeqAction) {

            const successValue :Object = seqAction.value;
            const {
              appointmentEKID,
              checkInDetailsESID,
              checkInEKID,
              checkInESID,
              edm,
            } = successValue;
            const requestValue :Object = storedSeqAction.value;
            const { entityData } = requestValue;

            const storedCheckInEntity :Map = fromJS(entityData[checkInESID][0]);
            const storedCheckInDetailsEntity :Map = fromJS(entityData[checkInDetailsESID][0]);

            let newCheckIn :Map = Map();
            storedCheckInEntity.forEach((value, id) => {
              const propertyTypeFqn :FQN = getPropertyFqnFromEdm(edm, id);
              newCheckIn = newCheckIn.set(propertyTypeFqn, value);
            });
            newCheckIn = newCheckIn.set(ENTITY_KEY_ID, checkInEKID);
            const hoursWorkedPTID :UUID = getPropertyTypeIdFromEdm(edm, HOURS_WORKED);
            const hoursWorked :number = storedCheckInDetailsEntity.getIn([hoursWorkedPTID, 0]);
            newCheckIn = newCheckIn.set(HOURS_WORKED, hoursWorked);

            let checkInsByAppointment :Map = state.get(CHECK_INS_BY_APPOINTMENT);
            checkInsByAppointment = checkInsByAppointment.set(appointmentEKID, newCheckIn);

            return state
              .set(CHECK_INS_BY_APPOINTMENT, checkInsByAppointment)
              .setIn([ACTIONS, CHECK_IN_FOR_APPOINTMENT, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state
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
            const { entityKeyId } :Object = requestValue[0];

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
            const { appointmentESID, edm } = successValue;

            const requestValue :Object = storedSeqAction.value;
            const { entityData } :Object = requestValue;
            const appointmentEKID = Object.keys(entityData[appointmentESID])[0];

            let workAppointmentsByWorksitePlan = state.get(WORK_APPOINTMENTS_BY_WORKSITE_PLAN);
            const [keyEKID, index] = findEntityPathInMap(workAppointmentsByWorksitePlan, appointmentEKID);
            if (index !== -1) {

              const newAppointmentData :Map = fromJS(entityData[appointmentESID][appointmentEKID]);
              const startDateTimePTID :UUID = getPropertyTypeIdFromEdm(edm, INCIDENT_START_DATETIME);
              const newStartDateTime :string = newAppointmentData.getIn([startDateTimePTID, 0]);

              const endDateTimePTID :UUID = getPropertyTypeIdFromEdm(edm, DATETIME_END);
              const newEndDateTime :string = newAppointmentData.getIn([endDateTimePTID, 0]);

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

          if (!state.hasIn([ACTIONS, GET_WORK_APPOINTMENTS, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(WORK_APPOINTMENTS_BY_WORKSITE_PLAN, value)
            .setIn([ACTIONS, GET_WORK_APPOINTMENTS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_WORK_APPOINTMENTS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_WORK_APPOINTMENTS, action.id])
      });
    }

    default:
      return state;
  }
}
