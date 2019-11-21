// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_WORKSITE_PLAN :'ADD_WORKSITE_PLAN' = 'ADD_WORKSITE_PLAN';
const addWorksitePlan :RequestSequence = newRequestSequence(ADD_WORKSITE_PLAN);

const CHECK_IN_FOR_APPOINTMENT :'CHECK_IN_FOR_APPOINTMENT' = 'CHECK_IN_FOR_APPOINTMENT';
const checkInForAppointment :RequestSequence = newRequestSequence(CHECK_IN_FOR_APPOINTMENT);

const CLEAR_APPOINTMENTS_AND_PLANS :'CLEAR_APPOINTMENTS_AND_PLANS' = 'CLEAR_APPOINTMENTS_AND_PLANS';
const clearAppointmentsAndPlans = () => ({
  type: CLEAR_APPOINTMENTS_AND_PLANS
});

const CREATE_WORK_APPOINTMENTS :'CREATE_WORK_APPOINTMENTS' = 'CREATE_WORK_APPOINTMENTS';
const createWorkAppointments :RequestSequence = newRequestSequence(CREATE_WORK_APPOINTMENTS);

const DELETE_APPOINTMENT :'DELETE_APPOINTMENT' = 'DELETE_APPOINTMENT';
const deleteAppointment :RequestSequence = newRequestSequence(DELETE_APPOINTMENT);

const EDIT_APPOINTMENT :'EDIT_APPOINTMENT' = 'EDIT_APPOINTMENT';
const editAppointment :RequestSequence = newRequestSequence(EDIT_APPOINTMENT);

const EDIT_WORKSITE_PLAN :'EDIT_WORKSITE_PLAN' = 'EDIT_WORKSITE_PLAN';
const editWorksitePlan :RequestSequence = newRequestSequence(EDIT_WORKSITE_PLAN);

const GET_APPOINTMENT_CHECK_INS :'GET_APPOINTMENT_CHECK_INS' = 'GET_APPOINTMENT_CHECK_INS';
const getAppointmentCheckIns :RequestSequence = newRequestSequence(GET_APPOINTMENT_CHECK_INS);

const GET_WORK_APPOINTMENTS :'GET_WORK_APPOINTMENTS' = 'GET_WORK_APPOINTMENTS';
const getWorkAppointments :RequestSequence = newRequestSequence(GET_WORK_APPOINTMENTS);

const GET_WORKSITE_BY_WORKSITE_PLAN :'GET_WORKSITE_BY_WORKSITE_PLAN' = 'GET_WORKSITE_BY_WORKSITE_PLAN';
const getWorksiteByWorksitePlan :RequestSequence = newRequestSequence(GET_WORKSITE_BY_WORKSITE_PLAN);

const GET_WORKSITE_PLANS :'GET_WORKSITE_PLANS' = 'GET_WORKSITE_PLANS';
const getWorksitePlans :RequestSequence = newRequestSequence(GET_WORKSITE_PLANS);

const GET_WORKSITE_PLAN_STATUSES :'GET_WORKSITE_PLAN_STATUSES' = 'GET_WORKSITE_PLAN_STATUSES';
const getWorksitePlanStatuses :RequestSequence = newRequestSequence(GET_WORKSITE_PLAN_STATUSES);

const UPDATE_HOURS_WORKED :'UPDATE_HOURS_WORKED' = 'UPDATE_HOURS_WORKED';
const updateHoursWorked :RequestSequence = newRequestSequence(UPDATE_HOURS_WORKED);

export {
  ADD_WORKSITE_PLAN,
  CHECK_IN_FOR_APPOINTMENT,
  CLEAR_APPOINTMENTS_AND_PLANS,
  CREATE_WORK_APPOINTMENTS,
  DELETE_APPOINTMENT,
  EDIT_APPOINTMENT,
  EDIT_WORKSITE_PLAN,
  GET_APPOINTMENT_CHECK_INS,
  GET_WORKSITE_BY_WORKSITE_PLAN,
  GET_WORKSITE_PLANS,
  GET_WORKSITE_PLAN_STATUSES,
  GET_WORK_APPOINTMENTS,
  UPDATE_HOURS_WORKED,
  addWorksitePlan,
  checkInForAppointment,
  clearAppointmentsAndPlans,
  createWorkAppointments,
  deleteAppointment,
  editAppointment,
  editWorksitePlan,
  getAppointmentCheckIns,
  getWorkAppointments,
  getWorksiteByWorksitePlan,
  getWorksitePlanStatuses,
  getWorksitePlans,
  updateHoursWorked,
};
