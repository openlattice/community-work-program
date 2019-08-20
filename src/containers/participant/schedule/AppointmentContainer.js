// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { DateTime } from 'luxon';
import { Button, Card, CardSegment } from 'lattice-ui-kit';

import CheckInModal from './CheckInModal';

import { getEntityKeyId, getEntityProperties } from '../../../utils/DataUtils';
import { DATETIME_END, INCIDENT_START_DATETIME } from '../../../core/edm/constants/FullyQualifiedNames';

const InfoWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 5px 40px;
  width: 100%;
`;

const DateText = styled.span`
  align-items: center;
  display: flex;
  font-size: 18px;
  font-weight: 600;
  margin-left: 20px;
`;

const Text = styled.span`
  align-items: center;
  display: flex;
  font-size: 16px;
`;

type Props = {
  appointment :Map;
  worksiteName :string;
};

type State = {
  isCheckInModalVisible :boolean;
};

class AppointmentContainer extends Component<Props, State> {

  state = {
    isCheckInModalVisible: false,
  };

  showCheckInModal = () => {
    this.setState({ isCheckInModalVisible: true });
  }

  hideCheckInModal = () => {
    this.setState({ isCheckInModalVisible: false });
  }

  render() {
    const { appointment, worksiteName } = this.props;
    const { isCheckInModalVisible } = this.state;

    const {
      [DATETIME_END]: datetimeEnd,
      [INCIDENT_START_DATETIME]: datetimeStart
    } = getEntityProperties(appointment, [DATETIME_END, INCIDENT_START_DATETIME]);

    const dateObj :DateTime = DateTime.fromISO(datetimeStart);
    const date :string = dateObj.toLocaleString(DateTime.DATE_SHORT);
    const weekday :string = dateObj.weekdayShort;
    const startTime :string = DateTime.fromISO(datetimeStart).toLocaleString(DateTime.TIME_SIMPLE);
    const endTime :string = DateTime.fromISO(datetimeEnd).toLocaleString(DateTime.TIME_SIMPLE);
    const hours :string = `${startTime} - ${endTime}`;

    return (
      <Card>
        <CardSegment padding="sm">
          <InfoWrapper>
            <span>
              <DateText>{ weekday }</DateText>
              <DateText>{ date }</DateText>
            </span>
            <Text>{ worksiteName }</Text>
            <Text>{ hours }</Text>
          </InfoWrapper>
          <Button
              onClick={this.showCheckInModal}
              mode="subtle">
            Check in
          </Button>
        </CardSegment>
        <CheckInModal
            appointment={appointment}
            isOpen={isCheckInModalVisible}
            onClose={this.hideCheckInModal} />
      </Card>
    );
  }
}

export default AppointmentContainer;
