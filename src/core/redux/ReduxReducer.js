/*
 * @flow
 */

import { connectRouter } from 'connected-react-router/immutable';
import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import appReducer from '../../containers/app/AppReducer';
import edmReducer from '../edm/EDMReducer';
import participantReducer from '../../containers/participant/ParticipantReducer';
import participantsReducer from '../../containers/participants/ParticipantsReducer';
import organizationReducer from '../../containers/organization/OrganizationReducer';
import worksitesReducer from '../../containers/worksites/WorksitesReducer';

export default function reduxReducer(routerHistory :any) {

  return combineReducers({
    app: appReducer,
    auth: AuthReducer,
    edm: edmReducer,
    people: participantsReducer,
    person: participantReducer,
    router: connectRouter(routerHistory),
    organization: organizationReducer,
    worksites: worksitesReducer,
  });
}
