// @flow

import { List, Map, fromJS } from 'immutable';

import SubmitStates from '../../utils/constants/SubmitStates';
import FetchStates from '../../utils/constants/FetchStates';

import { getWarningsViolationsNote, getWarningsViolationsList } from './ParticipantActions';

const INITIAL_STATE :Map<*, *> = fromJS({
  note: Map({
    data: Map(),
    entityKeyIdMap: Map(),
    fetchState: FetchStates.PRE_FETCH,
  }),
  options: Map({
    data: List(),
    fetchState: FetchStates.PRE_FETCH,
  }),
  submitState: SubmitStates.PRE_SUBMIT,
});

export default function counselingProgressNotesReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case getWarningsViolationsList.case(action.type): {
      return getWarningsViolationsList.reducer(state, action, {
        REQUEST: () => state
          .set('options', INITIAL_STATE.get('options'))
          .setIn(['options', 'fetchState'], FetchStates.IS_FETCHING)
          .setIn(['note', 'fetchState'], FetchStates.IS_FETCHING),
        SUCCESS: () => state
          .setIn(['options', 'data'], fromJS(action.value))
          .setIn(['options', 'fetchState'], FetchStates.FETCH_SUCCESS)
          .setIn(['note', 'fetchState'], FetchStates.FETCH_SUCCESS),
        FAILURE: () => state
          .setIn(['options', 'fetchState'], FetchStates.FETCH_FAILURE)
          .setIn(['note', 'fetchState'], FetchStates.FETCH_FAILURE),
      });
    }

    case getWarningsViolationsNote.case(action.type): {
      return getWarningsViolationsNote.reducer(state, action, {
        SUCCESS: () => {
          const { data } = action.value;
          return state
            .setIn(['note', 'data'], fromJS(data))
            .setIn(['note', 'fetchState'], FetchStates.FETCH_SUCCESS);
        },
        FAILURE: () => state.setIn(['note', 'fetchState'], FetchStates.FETCH_FAILURE),
      });
    }

    default:
      return state;
  }
}
