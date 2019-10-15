/*
 * @flow
 */

import { connectRouter } from 'connected-react-router/immutable';
import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import appReducer from '../../containers/app/AppReducer';
import edmReducer from '../edm/EDMReducer';
import infractionsReducer from '../../containers/participant/infractions/InfractionsReducer';
import participantReducer from '../../containers/participant/ParticipantReducer';
import participantsReducer from '../../containers/participants/ParticipantsReducer';
import workScheduleReducer from '../../containers/workschedule/WorkScheduleReducer';
import worksitesReducer from '../../containers/worksites/WorksitesReducer';

export default function reduxReducer(routerHistory :any) {

  return combineReducers({
    app: appReducer,
    auth: AuthReducer,
    edm: edmReducer,
    infractions: infractionsReducer,
    people: participantsReducer,
    person: participantReducer,
    router: connectRouter(routerHistory),
    workSchedule: workScheduleReducer,
    worksites: worksitesReducer,
  });
}
