// @flow
import React from 'react';

import { Map } from 'immutable';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import type { Match } from 'react-router';

import CreateNewEnrollmentForm from './CreateNewEnrollmentForm';
import EditCaseInfoForm from './cases/EditCaseInfoForm';
import EditEnrollmentDatesForm from './EditEnrollmentDatesForm';
import EditPersonAndContactsForm from './EditPersonAndContactsForm';
import ParticipantProfile from './ParticipantProfile';
import PrintInfractionContainer from './print/PrintInfractionContainer';
import PrintWorkScheduleContainer from './print/PrintWorkScheduleContainer';

import * as Routes from '../../core/router/Routes';
import {
  PERSON,
  STATE,
  WORKSITE_PLANS,
} from '../../utils/constants/ReduxStateConsts';

const { PARTICIPANT } = PERSON;
const { WORKSITES_BY_WORKSITE_PLAN, WORK_APPOINTMENTS_BY_WORKSITE_PLAN } = WORKSITE_PLANS;

type Props = {
  match :Match;
  participant :Map;
  workAppointmentsByWorksitePlan :Map;
  worksitesByWorksitePlan :Map;
};

const ParticipantProfileContainer = (props :Props) => {
  const {
    match: {
      params: { participantId: personEKID }
    },
    participant,
    workAppointmentsByWorksitePlan,
    worksitesByWorksitePlan,
  } = props;
  return (
    <Switch>
      <Route
          path={Routes.CREATE_NEW_ENROLLMENT}
          component={CreateNewEnrollmentForm} />
      <Route
          path={Routes.PRINT_INFRACTION}
          component={PrintInfractionContainer} />
      <Route
          path={Routes.EDIT_PARTICIPANT}
          component={EditPersonAndContactsForm} />
      <Route
          path={Routes.EDIT_DATES}
          component={EditEnrollmentDatesForm} />
      <Route
          path={Routes.EDIT_CASE_INFO}
          component={EditCaseInfoForm} />
      <Route
          path={Routes.PRINT_PARTICIPANT_SCHEDULE}
          render={() => (
            <PrintWorkScheduleContainer
                participant={participant}
                workAppointmentsByWorksitePlan={workAppointmentsByWorksitePlan}
                worksitesByWorksitePlan={worksitesByWorksitePlan} />
          )} />
      <Route path={Routes.PARTICIPANT_PROFILE} render={() => <ParticipantProfile personEKID={personEKID} />} />
    </Switch>
  );
};

const mapStateToProps = (state :Map<*, *>) => {
  const person = state.get(STATE.PERSON);
  const worksitePlans = state.get(STATE.WORKSITE_PLANS);
  return {
    [PARTICIPANT]: person.get(PARTICIPANT),
    [WORK_APPOINTMENTS_BY_WORKSITE_PLAN]: worksitePlans.get(WORK_APPOINTMENTS_BY_WORKSITE_PLAN),
    [WORKSITES_BY_WORKSITE_PLAN]: worksitePlans.get(WORKSITES_BY_WORKSITE_PLAN),
  };
};

// $FlowFixMe
export default connect(mapStateToProps)(ParticipantProfileContainer);
