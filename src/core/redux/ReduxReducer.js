/*
 * @flow
 */

import { connectRouter } from 'connected-react-router/immutable';
import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import appReducer from '../../containers/app/AppReducer';
import chargesReducer from '../../containers/participant/charges/ChargesReducer';
import downloadReducer from '../../containers/download/reducers';
import edmReducer from '../edm/EDMReducer';
import infractionsReducer from '../../containers/participant/infractions/InfractionsReducer';
import participantReducer from '../../containers/participant/ParticipantReducer';
import participantsReducer from '../../containers/participants/ParticipantsReducer';
import personContactsReducer from '../../containers/participant/contacts/PersonContactsReducer';
import printParticipantReducer from '../../containers/participant/print/PrintParticipantReducer';
import programOutcomeReducer from '../../containers/participant/outcome/ProgramOutcomeReducer';
import searchReducer from '../../containers/search/reducers';
import statsReducer from '../../containers/stats/StatsReducer';
import workScheduleReducer from '../../containers/workschedule/WorkScheduleReducer';
import worksitePlanReducer from '../../containers/participant/assignedworksites/WorksitePlanReducer';
import worksitesReducer from '../../containers/worksites/WorksitesReducer';

export default function reduxReducer(routerHistory :any) {

  return combineReducers({
    app: appReducer,
    auth: AuthReducer,
    charges: chargesReducer,
    download: downloadReducer,
    edm: edmReducer,
    infractions: infractionsReducer,
    people: participantsReducer,
    person: participantReducer,
    personContacts: personContactsReducer,
    printParticipant: printParticipantReducer,
    programOutcome: programOutcomeReducer,
    router: connectRouter(routerHistory),
    search: searchReducer,
    stats: statsReducer,
    workSchedule: workScheduleReducer,
    worksitePlans: worksitePlanReducer,
    worksites: worksitesReducer,
  });
}
