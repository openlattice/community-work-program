// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Button,
  Card,
  CardSegment,
  IconButton
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faPen, faTrash } from '@fortawesome/pro-solid-svg-icons';
import { faCalendarAlt } from '@fortawesome/pro-light-svg-icons';

import CheckInModal from '../participant/schedule/CheckInModal';
import CheckInDetailsModal from '../participant/schedule/CheckInDetailsModal';
import DeleteAppointmentModal from '../participant/schedule/DeleteAppointmentModal';

import { isDefined } from '../../utils/LangUtils';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import { PERSON, STATE, WORK_SCHEDULE } from '../../utils/constants/ReduxStateConsts';
import { ENTITY_KEY_ID, PEOPLE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { OL } from '../../core/style/Colors';
import { ButtonWrapper } from '../../components/Layout';

const { CHECK_INS_BY_APPOINTMENT, PARTICIPANT } = PERSON;
const { PERSON_BY_APPOINTMENT_EKID } = WORK_SCHEDULE;
const { FIRST_NAME, LAST_NAME } = PEOPLE_FQNS;

const CHECK_IN = 'isCheckInModalVisible';
const CHECK_IN_DETAILS = 'isCheckInDetailsModalVisible';
const DELETE_APPOINTMENT = 'isDeleteAppointmentModalVisible';
const EDIT_APPOINTMENT = 'isEditAppointmentModalVisible';

const OuterWrapper = styled.div`
  width: 100%;
`;

const AppointmentCardSegment = styled(CardSegment)`
  display: flex;
  justify-content: space-between;
`;

const InnerWrapper = styled.div`
  display: grid;
  grid-template-columns: 50px 140px 140px 140px 140px;
  grid-gap: 5px 30px;
  min-height: 40px;
`;

const Text = styled.span`
  align-items: center;
  display: flex;
  font-size: 14px;
`;

const CheckWrapper = styled(ButtonWrapper)`
  margin: 0;
`;

const ActionButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
`;

type Props = {
  checkInsByAppointment :Map;
  participant :Map;
  personByAppointmentEKID :Map;
  result :Map;
};

type State = {
  isCheckInDetailsModalVisible :boolean;
  isCheckInModalVisible :boolean;
  isDeleteAppointmentModalVisible :boolean;
  isEditAppointmentModalVisible :boolean;
};

class AppointmentContainer extends Component<Props, State> {

  state = {
    [CHECK_IN]: false,
    [CHECK_IN_DETAILS]: false,
    [DELETE_APPOINTMENT]: false,
    [EDIT_APPOINTMENT]: false,
  };

  handleShowModal = (modalName :string) => {
    this.setState({
      [modalName]: true,
    });
  }

  handleHideModal = (modalName :string) => {
    this.setState({
      [modalName]: false,
    });
  }

  render() {
    const {
      checkInsByAppointment,
      participant,
      personByAppointmentEKID,
      result,
    } = this.props;
    const {
      isCheckInDetailsModalVisible,
      isCheckInModalVisible,
      isDeleteAppointmentModalVisible,
      isEditAppointmentModalVisible,
    } = this.state;

    const day = result.get('day');
    const personName = result.get('personName');
    const worksiteName = result.get('worksiteName');
    const hours = result.get('hours');

    const appointmentEKID :UUID = result.get(ENTITY_KEY_ID);
    const checkIn :Map = checkInsByAppointment.get(appointmentEKID);
    const checkedIn :boolean = isDefined(checkIn);

    let personEKID :UUID = '';
    if (isDefined(personByAppointmentEKID)) {
      personEKID = getEntityKeyId(personByAppointmentEKID.get(appointmentEKID));
    }
    if (!isDefined(personByAppointmentEKID.get(appointmentEKID)) || personByAppointmentEKID.isEmpty()) {
      personEKID = getEntityKeyId(participant);
    }

    let modalDisplayOfPersonName = personName;
    if (!personName) {
      const {
        [FIRST_NAME]: firstName,
        [LAST_NAME]: lastName
      } = getEntityProperties(participant, [FIRST_NAME, LAST_NAME]);
      modalDisplayOfPersonName = `${firstName} ${lastName}`;
    }

    return (
      <OuterWrapper>
        <Card>
          <AppointmentCardSegment padding="sm">
            <InnerWrapper>
              <Text>
                <FontAwesomeIcon icon={faCalendarAlt} size="sm" />
              </Text>
              <Text>{ day }</Text>
              {
                personName && (
                  <Text>{ personName }</Text>
                )
              }
              <Text>{ worksiteName }</Text>
              <Text>{ hours }</Text>
            </InnerWrapper>
            <ActionButtonsWrapper>
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
              {
                !checkedIn && (
                  <ActionButtonsWrapper>
                    <IconButton
                        icon={<FontAwesomeIcon icon={faPen} color={OL.GREY04} size="sm" />}
                        mode="subtle"
                        onClick={() => this.handleShowModal(EDIT_APPOINTMENT)} />
                    <IconButton
                        icon={<FontAwesomeIcon icon={faTrash} color={OL.GREY04} size="sm" />}
                        mode="subtle"
                        onClick={() => this.handleShowModal(DELETE_APPOINTMENT)} />
                  </ActionButtonsWrapper>
                )
              }
            </ActionButtonsWrapper>
          </AppointmentCardSegment>
        </Card>
        <CheckInModal
            appointment={result}
            isOpen={isCheckInModalVisible}
            onClose={() => this.handleHideModal(CHECK_IN)}
            personEKID={personEKID}
            personName={modalDisplayOfPersonName} />
        <CheckInDetailsModal
            checkIn={checkIn}
            isOpen={isCheckInDetailsModalVisible}
            onClose={() => this.handleHideModal(CHECK_IN_DETAILS)} />
        <DeleteAppointmentModal
            appointment={result}
            appointmentEKID={appointmentEKID}
            isOpen={isDeleteAppointmentModalVisible}
            onClose={() => this.handleHideModal(DELETE_APPOINTMENT)} />
      </OuterWrapper>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const person = state.get(STATE.PERSON);
  const workSchedule = state.get(STATE.WORK_SCHEDULE);
  return ({
    [CHECK_INS_BY_APPOINTMENT]: person.get(CHECK_INS_BY_APPOINTMENT),
    [PARTICIPANT]: person.get(PARTICIPANT),
    [PERSON_BY_APPOINTMENT_EKID]: workSchedule.get(PERSON_BY_APPOINTMENT_EKID),
  });
};

// $FlowFixMe
export default connect(mapStateToProps)(AppointmentContainer);
