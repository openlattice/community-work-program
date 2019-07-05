/*
 * @flow
 */

import { connectRouter } from 'connected-react-router/immutable';
import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import appReducer from '../../containers/app/AppReducer';
import dataReducer from '../sagas/data/DataReducer';
import edmReducer from '../edm/EDMReducer';
import participantReducer from '../../containers/participant/ParticipantReducer';
import participantsReducer from '../../containers/participants/ParticipantsReducer';
import organizationsReducer from '../../containers/organizations/OrganizationsReducer';
import worksitesReducer from '../../containers/worksites/WorksitesReducer';

export default function reduxReducer(routerHistory :any) {

  return combineReducers({
    app: appReducer,
    auth: AuthReducer,
    data: dataReducer,
    edm: edmReducer,
    people: participantsReducer,
    person: participantReducer,
    router: connectRouter(routerHistory),
    organizations: organizationsReducer,
    worksites: worksitesReducer,
  });
}
