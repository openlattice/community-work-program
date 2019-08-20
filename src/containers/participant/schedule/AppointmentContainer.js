// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { DateTime } from 'luxon';
import { Button, Card, CardSegment } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/pro-solid-svg-icons';

import CheckInModal from './CheckInModal';
import CheckInDetailsModal from './CheckInDetailsModal';

import { getEntityKeyId, getEntityProperties } from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';
import { DATETIME_END, INCIDENT_START_DATETIME } from '../../../core/edm/constants/FullyQualifiedNames';
import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';
import { OL } from '../../../core/style/Colors';
import { ButtonWrapper } from '../../../components/Layout';

const { CHECK_INS_BY_APPOINTMENT } = PERSON;

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

const CheckWrapper = styled(ButtonWrapper)`
  margin: 0;
`;

type Props = {
  appointment :Map;
  checkInsByAppointment :Map;
  worksiteName :string;
};

type State = {
  isCheckInDetailsModalVisible :boolean;
  isCheckInModalVisible :boolean;
};

class AppointmentContainer extends Component<Props, State> {

  state = {
    isCheckInDetailsModalVisible: false,
    isCheckInModalVisible: false,
  };

  showCheckInModal = () => {
    this.setState({ isCheckInModalVisible: true });
  }

  hideCheckInModal = () => {
    this.setState({ isCheckInModalVisible: false });
  }

  showCheckInDetailsModal = () => {
    this.setState({ isCheckInDetailsModalVisible: true });
  }

  hideCheckInDetailsModal = () => {
    this.setState({ isCheckInDetailsModalVisible: false });
  }

  render() {
    const { appointment, checkInsByAppointment, worksiteName } = this.props;
    const { isCheckInDetailsModalVisible, isCheckInModalVisible } = this.state;

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

    const appointmentEKID :UUID = getEntityKeyId(appointment);
    const checkIn :Map = checkInsByAppointment.get(appointmentEKID);
    const checkedIn :boolean = isDefined(checkIn);

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
          {
            checkedIn
              ? (
                <CheckWrapper onClick={this.showCheckInDetailsModal}>
                  <FontAwesomeIcon icon={faCheckCircle} color={OL.PURPLE02} size="lg" />
                </CheckWrapper>
              )
              : (
                <Button
                    onClick={this.showCheckInModal}
                    mode="subtle">
                  Check in
                </Button>
              )
          }
        </CardSegment>
        <CheckInModal
            appointment={appointment}
            isOpen={isCheckInModalVisible}
            onClose={this.hideCheckInModal} />
        <CheckInDetailsModal
            checkIn={checkIn}
            isOpen={isCheckInDetailsModalVisible}
            onClose={this.hideCheckInDetailsModal} />
      </Card>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const person = state.get(STATE.PERSON);
  return ({
    [CHECK_INS_BY_APPOINTMENT]: person.get(CHECK_INS_BY_APPOINTMENT),
  });
};

export default connect(mapStateToProps)(AppointmentContainer);
