/*
 * @flow
 */

import { connectRouter } from 'connected-react-router/immutable';
import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import appReducer from '../../containers/app/AppReducer';
import ParticipantsReducer from '../../containers/participants/ParticipantsReducer';
import ParticipantReducer from '../../containers/participant/ParticipantReducer';

export default function reduxReducer(routerHistory :any) {

  return combineReducers({
    app: appReducer,
    auth: AuthReducer,
    people: ParticipantsReducer,
    person: ParticipantReducer,
    router: connectRouter(routerHistory),
  });
}
