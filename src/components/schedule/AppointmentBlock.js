// @flow
import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { DateTime } from 'luxon';

import { getEntityProperties } from '../../utils/DataUtils';
import { DATETIME_END, INCIDENT_START_DATETIME } from '../../core/edm/constants/FullyQualifiedNames';
import { OL } from '../../core/style/Colors';

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

const AppointmentBlock = ({ appointment } :Props) => {

  const {
    [DATETIME_END]: datetimeEnd,
    [INCIDENT_START_DATETIME]: datetimeStart
  } = getEntityProperties(appointment, [DATETIME_END, INCIDENT_START_DATETIME]);
  const date = DateTime.fromISO(datetimeStart).toLocaleString(DateTime.DATE_SHORT);
  const startTime = DateTime.fromISO(datetimeStart).toLocaleString(DateTime.TIME_SIMPLE);
  const endTime = DateTime.fromISO(datetimeEnd).toLocaleString(DateTime.TIME_SIMPLE);
  const hours = `${startTime} - ${endTime}`;
  return (
    <AppointmentWrapper>
      <InfoWrapper>
        <DateText>{ date }</DateText>
        <Text>Work Site</Text>
        <Text>{ hours }</Text>
      </InfoWrapper>
    </AppointmentWrapper>
  );
};

export default AppointmentBlock;
