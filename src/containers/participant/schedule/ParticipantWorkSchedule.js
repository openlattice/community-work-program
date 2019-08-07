// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map, List } from 'immutable';
import { withRouter } from 'react-router-dom';
import { DateTime } from 'luxon';

import AppointmentBlock from '../../../components/schedule/AppointmentBlock';

import { ContainerOuterWrapper } from '../../../components/Layout';

const OuterWrapper = styled(ContainerOuterWrapper)`
  width: 100%;
`;

type Props = {
  workAppointmentsByWorksitePlan :Map
};

type State = {};

class ParticipantWorkSchedule extends Component<Props, State> {

  renderAppointmentList = () => {
    const { workAppointmentsByWorksitePlan } = this.props;
    const appointments :List = workAppointmentsByWorksitePlan
      .valueSeq()
      .toList();
    return appointments.map((appointment :Map) => (
      <AppointmentBlock
          appointment={appointment} />
    ));
  }

  render() {
    return (
      <OuterWrapper>
        { this.renderAppointmentList() }
      </OuterWrapper>
    );
  }
}

export default ParticipantWorkSchedule;
