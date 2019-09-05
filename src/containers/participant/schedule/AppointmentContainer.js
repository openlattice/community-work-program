// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { DateTime } from 'luxon';
import { Button, Card, CardSegment } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTrash } from '@fortawesome/pro-solid-svg-icons';

import CheckInModal from './CheckInModal';
import CheckInDetailsModal from './CheckInDetailsModal';
import DeleteAppointmentModal from './DeleteAppointmentModal';

import { getEntityKeyId, getEntityProperties } from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';
import { DATETIME_END, INCIDENT_START_DATETIME } from '../../../core/edm/constants/FullyQualifiedNames';
import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';
import { OL } from '../../../core/style/Colors';
import { ButtonWrapper } from '../../../components/Layout';

const { CHECK_INS_BY_APPOINTMENT } = PERSON;

const CHECK_IN = 'CheckIn';
const CHECK_IN_DETAILS = 'CheckInDetails';
const DELETE_APPOINTMENT = 'DeleteAppointment';

const InfoWrapper = styled.div`
  display: grid;
  grid-template-columns: 200px 200px 200px 1fr 1fr;
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

const TrashWrapper = styled(ButtonWrapper)`
  align-items: center;
  display: flex;
  justify-content: center;
  margin: 0 10px;
`;

type Props = {
  appointment :Map;
  checkInsByAppointment :Map;
  worksiteName :string;
};

type State = {
  isCheckInDetailsModalVisible :boolean;
  isCheckInModalVisible :boolean;
  isDeleteAppointmentModalVisible :boolean;
};

class AppointmentContainer extends Component<Props, State> {

  state = {
    isCheckInDetailsModalVisible: false,
    isCheckInModalVisible: false,
    isDeleteAppointmentModalVisible: false,
  };

  handleShowModal = (modalName :string) => {
    const stateToChange = `is${modalName}ModalVisible`;
    this.setState({
      [stateToChange]: true,
    });
  }

  handleHideModal = (modalName :string) => {
    const stateToChange = `is${modalName}ModalVisible`;
    this.setState({
      [stateToChange]: false,
    });
  }

  render() {
    const { appointment, checkInsByAppointment, worksiteName } = this.props;
    const { isCheckInDetailsModalVisible, isCheckInModalVisible, isDeleteAppointmentModalVisible } = this.state;

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

    const appointmentOverview :{} = {
      date,
      hours,
      weekday,
      worksiteName,
    };

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
                null
              )
              : (
                <TrashWrapper onClick={() => this.handleShowModal(DELETE_APPOINTMENT)}>
                  <FontAwesomeIcon icon={faTrash} color={OL.GREY04} size="sm" />
                </TrashWrapper>
              )
          }
          {
            checkedIn
              ? (
                <CheckWrapper onClick={() => this.handleShowModal(CHECK_IN_DETAILS)}>
                  <FontAwesomeIcon icon={faCheckCircle} color={OL.PURPLE02} size="lg" />
                </CheckWrapper>
              )
              : (
                <Button
                    onClick={() => this.handleShowModal(CHECK_IN)}
                    mode="subtle">
                  Check in
                </Button>
              )
          }
        </CardSegment>
        <CheckInModal
            appointment={appointment}
            isOpen={isCheckInModalVisible}
            onClose={() => this.handleHideModal(CHECK_IN)} />
        <CheckInDetailsModal
            checkIn={checkIn}
            isOpen={isCheckInDetailsModalVisible}
            onClose={() => this.handleHideModal(CHECK_IN_DETAILS)} />
        <DeleteAppointmentModal
            appointment={appointmentOverview}
            isOpen={isDeleteAppointmentModalVisible}
            onClose={() => this.handleHideModal(DELETE_APPOINTMENT)} />
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

// $FlowFixMe
export default connect(mapStateToProps)(AppointmentContainer);
