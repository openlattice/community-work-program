// @flow
import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_WORKSITE_PLAN :'ADD_WORKSITE_PLAN' = 'ADD_WORKSITE_PLAN';
const addWorksitePlan :RequestSequence = newRequestSequence(ADD_WORKSITE_PLAN);

const EDIT_WORKSITE_PLAN :'EDIT_WORKSITE_PLAN' = 'EDIT_WORKSITE_PLAN';
const editWorksitePlan :RequestSequence = newRequestSequence(EDIT_WORKSITE_PLAN);

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
  EDIT_WORKSITE_PLAN,
  GET_WORKSITE_BY_WORKSITE_PLAN,
  GET_WORKSITE_PLANS,
  GET_WORKSITE_PLAN_STATUSES,
  UPDATE_HOURS_WORKED,
  addWorksitePlan,
  editWorksitePlan,
  getWorksiteByWorksitePlan,
  getWorksitePlanStatuses,
  getWorksitePlans,
  updateHoursWorked,
};
