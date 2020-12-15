// @flow
import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  ADD_PERSON_ADDRESS,
  ADD_PERSON_EMAIL,
  ADD_PERSON_PHONE,
  EDIT_PERSON_ADDRESS,
  EDIT_PERSON_EMAIL,
  EDIT_PERSON_PHONE,
  GET_PERSON_ADDRESS,
  GET_PERSON_CONTACT_INFO,
  addPersonAddress,
  addPersonEmail,
  addPersonPhone,
  editPersonAddress,
  editPersonEmail,
  editPersonPhone,
  getPersonAddress,
  getPersonContactInfo,
} from './PersonContactsActions';

import { CONTACT_METHODS } from '../../../core/edm/constants/DataModelConsts';
import { PERSON_CONTACTS, SHARED } from '../../../utils/constants/ReduxStateConsts';

const { EMAIL, PERSON_ADDRESS, PHONE } = PERSON_CONTACTS;
const { ACTIONS, REQUEST_STATE } = SHARED;

const INITIAL_STATE = fromJS({
  [ACTIONS]: {
    [ADD_PERSON_ADDRESS]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [ADD_PERSON_EMAIL]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [ADD_PERSON_PHONE]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [EDIT_PERSON_ADDRESS]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [EDIT_PERSON_EMAIL]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [EDIT_PERSON_PHONE]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [GET_PERSON_ADDRESS]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [GET_PERSON_CONTACT_INFO]: { [REQUEST_STATE]: RequestStates.STANDBY },
  },
  [EMAIL]: Map(),
  [PERSON_ADDRESS]: Map(),
  [PHONE]: Map(),
});

export default function participantReducer(state :Map<*, *> = INITIAL_STATE, action :SequenceAction) :Map<*, *> {

  switch (action.type) {

    case addPersonAddress.case(action.type): {
      return addPersonAddress.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, ADD_PERSON_ADDRESS, action.id], action)
          .setIn([ACTIONS, ADD_PERSON_ADDRESS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .set(PERSON_ADDRESS, action.value)
          .setIn([ACTIONS, ADD_PERSON_ADDRESS, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, ADD_PERSON_ADDRESS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, ADD_PERSON_ADDRESS, action.id]),
      });
    }

    case addPersonEmail.case(action.type): {
      return addPersonEmail.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, ADD_PERSON_EMAIL, action.id], fromJS(action))
          .setIn([ACTIONS, ADD_PERSON_EMAIL, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .set(EMAIL, action.value)
          .setIn([ACTIONS, ADD_PERSON_EMAIL, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, ADD_PERSON_EMAIL, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, ADD_PERSON_EMAIL, action.id])
      });
    }

    case addPersonPhone.case(action.type): {
      return addPersonPhone.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, ADD_PERSON_PHONE, action.id], fromJS(action))
          .setIn([ACTIONS, ADD_PERSON_PHONE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .set(PHONE, action.value)
          .setIn([ACTIONS, ADD_PERSON_PHONE, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, ADD_PERSON_PHONE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, ADD_PERSON_PHONE, action.id])
      });
    }

    case editPersonAddress.case(action.type): {
      return editPersonAddress.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, EDIT_PERSON_ADDRESS, action.id], action)
          .setIn([ACTIONS, EDIT_PERSON_ADDRESS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .set(PERSON_ADDRESS, state.get(PERSON_ADDRESS).mergeWith((oldVal, newVal) => newVal, action.value))
          .setIn([ACTIONS, EDIT_PERSON_ADDRESS, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_PERSON_ADDRESS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_PERSON_ADDRESS, action.id]),
      });
    }

    case editPersonEmail.case(action.type): {
      return editPersonEmail.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, EDIT_PERSON_EMAIL, action.id], action)
          .setIn([ACTIONS, EDIT_PERSON_EMAIL, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .set(EMAIL, state.get(EMAIL).mergeWith((oldVal, newVal) => newVal, action.value))
          .setIn([ACTIONS, EDIT_PERSON_EMAIL, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_PERSON_EMAIL, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_PERSON_EMAIL, action.id]),
      });
    }

    case editPersonPhone.case(action.type): {
      return editPersonPhone.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, EDIT_PERSON_PHONE, action.id], action)
          .setIn([ACTIONS, EDIT_PERSON_PHONE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .set(PHONE, state.get(PHONE).mergeWith((oldVal, newVal) => newVal, action.value))
          .setIn([ACTIONS, EDIT_PERSON_PHONE, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_PERSON_PHONE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_PERSON_PHONE, action.id]),
      });
    }

    case getPersonAddress.case(action.type): {
      return getPersonAddress.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_PERSON_ADDRESS, action.id], fromJS(action))
          .setIn([ACTIONS, GET_PERSON_ADDRESS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .set(PERSON_ADDRESS, action.value)
          .setIn([ACTIONS, GET_PERSON_ADDRESS, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, GET_PERSON_ADDRESS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_PERSON_ADDRESS, action.id])
      });
    }

    case getPersonContactInfo.case(action.type): {
      return getPersonContactInfo.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_PERSON_CONTACT_INFO, action.id], fromJS(action))
          .setIn([ACTIONS, GET_PERSON_CONTACT_INFO, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .set(EMAIL, action.value.activeEmail)
          .set(PHONE, action.value.activePhone)
          .setIn([ACTIONS, GET_PERSON_CONTACT_INFO, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, GET_PERSON_CONTACT_INFO, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_PERSON_CONTACT_INFO, action.id])
      });
    }

    default:
      return state;
  }
}
