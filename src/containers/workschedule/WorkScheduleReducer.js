/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  FIND_APPOINTMENTS,
  GET_WORKSITE_PLANS_BY_PERSON,
  findAppointments,
  getPersonCourtType,
  getWorksiteAndPersonNames,
  getWorksitePlansByPerson,
} from './WorkScheduleActions';
import {
  DELETE_APPOINTMENT,
  EDIT_APPOINTMENT,
  deleteAppointment,
  editAppointment,
} from '../participant/assignedworksites/WorksitePlanActions';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import { WORK_SCHEDULE } from '../../utils/constants/ReduxStateConsts';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const {
  ACTIONS,
  APPOINTMENTS,
  COURT_TYPE_BY_APPOINTMENT_EKID,
  GET_PERSON_COURT_TYPE,
  GET_WORKSITE_NAMES_FOR_APPOINTMENTS,
  PERSON_BY_APPOINTMENT_EKID,
  REQUEST_STATE,
  WORKSITES_BY_WORKSITE_PLAN_BY_PERSON,
  WORKSITE_NAMES_BY_APPOINTMENT_EKID,
} = WORK_SCHEDULE;
const { DATETIME_END, INCIDENT_START_DATETIME, NAME } = PROPERTY_TYPE_FQNS;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [DELETE_APPOINTMENT]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [FIND_APPOINTMENTS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_WORKSITE_NAMES_FOR_APPOINTMENTS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_WORKSITE_PLANS_BY_PERSON]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [APPOINTMENTS]: List(),
  [COURT_TYPE_BY_APPOINTMENT_EKID]: Map(),
  [PERSON_BY_APPOINTMENT_EKID]: Map(),
  [WORKSITES_BY_WORKSITE_PLAN_BY_PERSON]: Map(),
  [WORKSITE_NAMES_BY_APPOINTMENT_EKID]: Map(),
});

export default function workScheduleReducer(state :Map<*, *> = INITIAL_STATE, action :Object) :Map<*, *> {

  switch (action.type) {

    case getPersonCourtType.case(action.type): {
      return getPersonCourtType.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_PERSON_COURT_TYPE, action.id], action)
          .setIn([ACTIONS, GET_PERSON_COURT_TYPE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const { value } = seqAction;
          return state
            .set(COURT_TYPE_BY_APPOINTMENT_EKID, value)
            .setIn([ACTIONS, GET_PERSON_COURT_TYPE, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([ACTIONS, GET_PERSON_COURT_TYPE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_PERSON_COURT_TYPE, action.id]),
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

          let workScheduleAppointments = state.get(APPOINTMENTS);
          if (storedSeqAction) {

            const requestValue :Object = storedSeqAction.value;
            const [entityKeyId] :Object = requestValue[0].entityKeyIds;

            let indexToDeleteInWorkSchedule = -1;

            indexToDeleteInWorkSchedule = workScheduleAppointments.findIndex(
              (appointment :Map) => getEntityKeyId(appointment) === entityKeyId
            );

            if (indexToDeleteInWorkSchedule !== -1) {
              workScheduleAppointments = workScheduleAppointments.delete(indexToDeleteInWorkSchedule);
            }
          }

          return state
            .set(APPOINTMENTS, workScheduleAppointments)
            .setIn([ACTIONS, DELETE_APPOINTMENT, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set(APPOINTMENTS, List())
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
            const {
              appointmentEKID,
              appointmentESID,
              endDateTimePTID,
              newWorksitePlanEKID,
              personEKID,
              startDateTimePTID,
            } = successValue;

            const requestValue :Object = storedSeqAction.value;
            const { entityData } :Object = requestValue;

            let workScheduleAppointments = state.get(APPOINTMENTS);
            let indexOfAppointmentToEdit :number = -1;

            indexOfAppointmentToEdit = workScheduleAppointments.findIndex(
              (appointment :Map) => getEntityKeyId(appointment) === appointmentEKID
            );

            if (indexOfAppointmentToEdit !== -1) {

              const newAppointmentData :Map = fromJS(entityData[appointmentESID][appointmentEKID]);
              const newStartDateTime :string = newAppointmentData.getIn([startDateTimePTID, 0]);
              const newEndDateTime :string = newAppointmentData.getIn([endDateTimePTID, 0]);

              if (newStartDateTime) {
                workScheduleAppointments = workScheduleAppointments.setIn([
                  indexOfAppointmentToEdit,
                  INCIDENT_START_DATETIME,
                ], List([newStartDateTime]));
              }
              if (newEndDateTime) {
                workScheduleAppointments = workScheduleAppointments.setIn([
                  indexOfAppointmentToEdit,
                  DATETIME_END,
                ], List([newEndDateTime]));
              }

              let worksiteNamesByAppointmentEKID :Map = state.get(WORKSITE_NAMES_BY_APPOINTMENT_EKID);

              if (newWorksitePlanEKID.length) {
                const worksitesByWorksitePlan :Map = state.get(WORKSITES_BY_WORKSITE_PLAN_BY_PERSON)
                  .get(personEKID, Map());
                const worksite :Map = worksitesByWorksitePlan.get(newWorksitePlanEKID, Map());
                const { [NAME]: worksiteName } = getEntityProperties(worksite, [NAME]);

                worksiteNamesByAppointmentEKID = worksiteNamesByAppointmentEKID
                  .update(appointmentEKID, () => worksiteName);
              }

              return state
                .set(APPOINTMENTS, workScheduleAppointments)
                .set(WORKSITE_NAMES_BY_APPOINTMENT_EKID, worksiteNamesByAppointmentEKID)
                .setIn([ACTIONS, EDIT_APPOINTMENT, REQUEST_STATE], RequestStates.SUCCESS);
            }
          }

          return state
            .setIn([ACTIONS, EDIT_APPOINTMENT, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set(APPOINTMENTS, List())
          .setIn([ACTIONS, EDIT_APPOINTMENT, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_APPOINTMENT, action.id]),
      });
    }

    case findAppointments.case(action.type): {

      return findAppointments.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, FIND_APPOINTMENTS, action.id], action)
          .setIn([ACTIONS, FIND_APPOINTMENTS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const { value } = action;
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
            .set(PERSON_BY_APPOINTMENT_EKID, value.personByAppointmentEKID)
            .set(WORKSITE_NAMES_BY_APPOINTMENT_EKID, value.worksiteNamesByAppointmentEKID)
            .setIn([ACTIONS, GET_WORKSITE_NAMES_FOR_APPOINTMENTS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set(PERSON_BY_APPOINTMENT_EKID, Map())
          .set(WORKSITE_NAMES_BY_APPOINTMENT_EKID, Map())
          .setIn([ACTIONS, GET_WORKSITE_NAMES_FOR_APPOINTMENTS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_WORKSITE_NAMES_FOR_APPOINTMENTS, action.id]),
      });
    }

    case getWorksitePlansByPerson.case(action.type): {

      return getWorksitePlansByPerson.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_WORKSITE_PLANS_BY_PERSON, action.id], action)
          .setIn([ACTIONS, GET_WORKSITE_PLANS_BY_PERSON, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const seqAction :SequenceAction = (action :any);
          const { value } = seqAction;
          return state
            .set(WORKSITES_BY_WORKSITE_PLAN_BY_PERSON, value)
            .setIn([ACTIONS, GET_WORKSITE_PLANS_BY_PERSON, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_WORKSITE_PLANS_BY_PERSON, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_WORKSITE_PLANS_BY_PERSON, action.id]),
      });
    }

    default:
      return state;
  }
}
