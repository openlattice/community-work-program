// @flow
import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { DateTime } from 'luxon';
import { Card, CardSegment } from 'lattice-ui-kit';

import { getEntityProperties } from '../../utils/DataUtils';
import { DATETIME_END, INCIDENT_START_DATETIME } from '../../core/edm/constants/FullyQualifiedNames';

const InfoWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 5px 40px;
  width: 70%;
`;

const DateText = styled.span`
  font-size: 18px;
  font-weight: 600;
  margin-left: 20px;
`;

const Text = styled.span`
  font-size: 16px;
`;

type Props = {
  appointment :Map;
  worksiteName :string;
};

const AppointmentBlock = ({ appointment, worksiteName } :Props) => {

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
      </CardSegment>
    </Card>
  );
};

export default AppointmentBlock;
