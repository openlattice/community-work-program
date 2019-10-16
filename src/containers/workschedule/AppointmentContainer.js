// @flow
import React, { useEffect, useState } from 'react';
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
import EditAppointmentModal from '../participant/schedule/EditAppointmentModal';

import { isDefined } from '../../utils/LangUtils';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import {
  PARTICIPANT_SCHEDULE,
  PERSON,
  STATE,
  WORK_SCHEDULE,
} from '../../utils/constants/ReduxStateConsts';
import { ENTITY_KEY_ID, PEOPLE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { OL } from '../../core/style/Colors';
import { ButtonWrapper } from '../../components/Layout';

const { CHECK_INS_BY_APPOINTMENT } = PARTICIPANT_SCHEDULE;
const { PARTICIPANT } = PERSON;
const { PERSON_BY_APPOINTMENT_EKID } = WORK_SCHEDULE;
const { FIRST_NAME, LAST_NAME } = PEOPLE_FQNS;

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

const AppointmentContainer = ({
  checkInsByAppointment,
  participant,
  personByAppointmentEKID,
  result,
} :Props) => {

  const [isCheckInModalVisible, handleCheckInModalVisibility] = useState(false);
  const [isCheckInDetailsModalVisible, handleCheckInDetailsModalVisibility] = useState(false);
  const [isDeleteAppointmentModalVisible, handleDeleteAppointmentModalVisibility] = useState(false);
  const [isEditAppointmentModalVisible, handleEditAppointmentModalVisibility] = useState(false);

  const [day, setDay] = useState('');
  const [hours, setHours] = useState('');

  // use effect for editable properties
  useEffect(() => {
    const storedDay = result.get('day');
    const storedHours = result.get('hours');
    setDay(storedDay);
    setHours(storedHours);
  }, [result]);

  const personName = result.get('personName');
  const worksiteName = result.get('worksiteName');

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
                  <CheckWrapper onClick={() => handleCheckInDetailsModalVisibility(true)}>
                    <FontAwesomeIcon icon={faCheckCircle} color={OL.PURPLE02} size="lg" />
                  </CheckWrapper>
                )
                : (
                  <Button
                      onClick={() => handleCheckInModalVisibility(true)}
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
                      onClick={() => handleEditAppointmentModalVisibility(true)} />
                  <IconButton
                      icon={<FontAwesomeIcon icon={faTrash} color={OL.GREY04} size="sm" />}
                      mode="subtle"
                      onClick={() => handleDeleteAppointmentModalVisibility(true)} />
                </ActionButtonsWrapper>
              )
            }
          </ActionButtonsWrapper>
        </AppointmentCardSegment>
      </Card>
      <CheckInModal
          appointment={result}
          isOpen={isCheckInModalVisible}
          onClose={() => handleCheckInModalVisibility(false)}
          personEKID={personEKID}
          personName={modalDisplayOfPersonName} />
      <CheckInDetailsModal
          checkIn={checkIn}
          isOpen={isCheckInDetailsModalVisible}
          onClose={() => handleCheckInDetailsModalVisibility(false)} />
      <DeleteAppointmentModal
          appointment={result}
          appointmentEKID={appointmentEKID}
          isOpen={isDeleteAppointmentModalVisible}
          onClose={() => handleDeleteAppointmentModalVisibility(false)} />
      <EditAppointmentModal
          appointment={result}
          appointmentEKID={appointmentEKID}
          isOpen={isEditAppointmentModalVisible}
          onClose={() => handleEditAppointmentModalVisibility(false)}
          personName={modalDisplayOfPersonName} />
    </OuterWrapper>
  );
};

const mapStateToProps = (state :Map) => {
  const person = state.get(STATE.PERSON);
  const participantSchedule = state.get(STATE.PARTICIPANT_SCHEDULE);
  const workSchedule = state.get(STATE.WORK_SCHEDULE);
  return ({
    [CHECK_INS_BY_APPOINTMENT]: participantSchedule.get(CHECK_INS_BY_APPOINTMENT),
    [PARTICIPANT]: person.get(PARTICIPANT),
    [PERSON_BY_APPOINTMENT_EKID]: workSchedule.get(PERSON_BY_APPOINTMENT_EKID),
  });
};

// $FlowFixMe
export default connect(mapStateToProps)(AppointmentContainer);
