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
import printParticipantReducer from '../../containers/participant/print/PrintParticipantReducer';
import workScheduleReducer from '../../containers/workschedule/WorkScheduleReducer';
import worksitePlanReducer from '../../containers/participant/assignedworksites/WorksitePlanReducer';
import worksitesReducer from '../../containers/worksites/WorksitesReducer';

export default function reduxReducer(routerHistory :any) {

  return combineReducers({
    app: appReducer,
    auth: AuthReducer,
    edm: edmReducer,
    infractions: infractionsReducer,
    people: participantsReducer,
    person: participantReducer,
    printParticipant: printParticipantReducer,
    router: connectRouter(routerHistory),
    workSchedule: workScheduleReducer,
    worksitePlans: worksitePlanReducer,
    worksites: worksitesReducer,
  });
}
