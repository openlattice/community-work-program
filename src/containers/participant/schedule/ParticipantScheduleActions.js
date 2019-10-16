// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CHECK_IN_FOR_APPOINTMENT :'CHECK_IN_FOR_APPOINTMENT' = 'CHECK_IN_FOR_APPOINTMENT';
const checkInForAppointment :RequestSequence = newRequestSequence(CHECK_IN_FOR_APPOINTMENT);

const CREATE_WORK_APPOINTMENTS :'CREATE_WORK_APPOINTMENTS' = 'CREATE_WORK_APPOINTMENTS';
const createWorkAppointments :RequestSequence = newRequestSequence(CREATE_WORK_APPOINTMENTS);

const DELETE_APPOINTMENT :'DELETE_APPOINTMENT' = 'DELETE_APPOINTMENT';
const deleteAppointment :RequestSequence = newRequestSequence(DELETE_APPOINTMENT);

const EDIT_APPOINTMENT :'EDIT_APPOINTMENT' = 'EDIT_APPOINTMENT';
const editAppointment :RequestSequence = newRequestSequence(EDIT_APPOINTMENT);

const GET_APPOINTMENT_CHECK_INS :'GET_APPOINTMENT_CHECK_INS' = 'GET_APPOINTMENT_CHECK_INS';
const getAppointmentCheckIns :RequestSequence = newRequestSequence(GET_APPOINTMENT_CHECK_INS);

const GET_WORK_APPOINTMENTS :'GET_WORK_APPOINTMENTS' = 'GET_WORK_APPOINTMENTS';
const getWorkAppointments :RequestSequence = newRequestSequence(GET_WORK_APPOINTMENTS);

export {
  CHECK_IN_FOR_APPOINTMENT,
  CREATE_WORK_APPOINTMENTS,
  DELETE_APPOINTMENT,
  EDIT_APPOINTMENT,
  GET_APPOINTMENT_CHECK_INS,
  GET_WORK_APPOINTMENTS,
  checkInForAppointment,
  createWorkAppointments,
  deleteAppointment,
  editAppointment,
  getAppointmentCheckIns,
  getWorkAppointments,
};
