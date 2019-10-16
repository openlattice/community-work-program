// @flow
import React from 'react';
import { Map } from 'immutable';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import type { Match } from 'react-router';

import ParticipantProfile from './ParticipantProfile';
import PrintWorkScheduleContainer from './print/PrintWorkScheduleContainer';
import PrintInfractionContainer from './print/PrintInfractionContainer';
import EditPersonAndContactsForm from './EditPersonAndContactsForm';
import EditEnrollmentDatesForm from './EditEnrollmentDatesForm';
import EditCaseInfoForm from './cases/EditCaseInfoForm';
import * as Routes from '../../core/router/Routes';

import { PERSON, STATE } from '../../utils/constants/ReduxStateConsts';

const {
  PARTICIPANT,
  WORK_APPOINTMENTS_BY_WORKSITE_PLAN,
  WORKSITES_BY_WORKSITE_PLAN
} = PERSON;

type Props = {
  match :Match;
  participant :Map;
  workAppointmentsByWorksitePlan :Map;
  worksitesByWorksitePlan :Map;
};

const ParticipantProfileContainer = (props :Props) => {
  const {
    match: {
      params: { subjectId: personEKID }
    },
    participant,
    workAppointmentsByWorksitePlan,
    worksitesByWorksitePlan,
  } = props;
  return (
    <Switch>
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
  return {
    [PARTICIPANT]: person.get(PARTICIPANT),
    [WORK_APPOINTMENTS_BY_WORKSITE_PLAN]: person.get(WORK_APPOINTMENTS_BY_WORKSITE_PLAN),
    [WORKSITES_BY_WORKSITE_PLAN]: person.get(WORKSITES_BY_WORKSITE_PLAN),
  };
};

// $FlowFixMe
export default connect(mapStateToProps)(ParticipantProfileContainer);
