// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map, List } from 'immutable';
import { withRouter } from 'react-router-dom';
import { DateTime } from 'luxon';
import { faCalendarTimes } from '@fortawesome/pro-light-svg-icons';
import {
  Card,
  CardSegment,
  IconSplash,
} from 'lattice-ui-kit';

import AppointmentBlock from '../../../components/schedule/AppointmentBlock';

import { ContainerOuterWrapper } from '../../../components/Layout';

const OuterWrapper = styled(ContainerOuterWrapper)`
  width: 100%;
`;

type Props = {
  appointmentsByWorksite :Map
};

type State = {};

class ParticipantWorkSchedule extends Component<Props, State> {

  renderAppointmentList = () => {
    const { appointmentsByWorksite } = this.props;
    // const appointments :List = appointmentsByWorksite
    //   .valueSeq()
    //   .toList();
    return appointmentsByWorksite.map((appointment :Map, worksiteName :string) => (
      <AppointmentBlock
          appointment={appointment}
          worksiteName={worksiteName} />
    ));
  }

  render() {
    const { appointmentsByWorksite } = this.props;
    return (
      <OuterWrapper>
        {
          appointmentsByWorksite.isEmpty()
            ? (
              <Card>
                <CardSegment>
                  <IconSplash
                      caption="No Appointments Scheduled"
                      icon={faCalendarTimes}
                      size="3x" />
                </CardSegment>
              </Card>
            )
            : this.renderAppointmentList()
        }
      </OuterWrapper>
    );
  }
}

export default ParticipantWorkSchedule;
