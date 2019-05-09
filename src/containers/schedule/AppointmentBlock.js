// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import { OL } from '../../utils/constants/Colors';
import { EditButton } from '../../components/controls/index';

const AppointmentWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${OL.GREY15};
  background-color: ${OL.WHITE};
  margin-bottom: 15px;
  height: 69px;
  border: 1px solid ${OL.GREY11};
  border-radius: 5px;
  padding: 30px;
`;

const InfoWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DateText = styled.span`
  display: flex;
  min-width: 200px;
  font-weight: 600;
  font-size: 20px;
`;

const Text = styled.span`
  display: flex;
  width: 230px;
  font-size: 16px;
`;

type Props = {
  appointment :Map;
};

// eslint-disable-next-line react/prefer-stateless-function
class AppointmentBlock extends Component<Props> {
  render() {
    const { appointment } = this.props;
    const datetimestart = new Date(appointment.get('datetimestart'));
    const date = datetimestart.toLocaleString().split(',')[0];
    const timestart = datetimestart.toTimeString().slice(0, 5);
    const timeend = new Date(appointment.get('datetimeend')).toTimeString().slice(0, 5);
    return (
      <AppointmentWrapper>
        <InfoWrapper>
          <DateText>{date}</DateText>
          <Text>{appointment.get('worksite')}</Text>
          <Text>{`${timestart}—${timeend}`}</Text>
        </InfoWrapper>
        <EditButton>Edit</EditButton>
      </AppointmentWrapper>
    );
  }
}

export default AppointmentBlock;
