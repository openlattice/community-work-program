// @flow
import React from 'react';
import styled from 'styled-components';
import { fromJS, Map, OrderedMap } from 'immutable';
import { DateTime } from 'luxon';
import { Card, CardSegment, DataGrid } from 'lattice-ui-kit';

import { getEntityProperties } from '../../utils/DataUtils';
import { formatAsDate } from '../../utils/DateTimeUtils';
import { DATETIME_START } from '../../core/edm/constants/FullyQualifiedNames';
import { EMPTY_FIELD } from '../../containers/participants/ParticipantsConstants';

const labelMap :OrderedMap = OrderedMap({
  sentenceDate: 'Sentence date',
  checkInDeadline: 'Check-in deadline',
  checkedInDate: 'Date checked in',
  orientationDate: 'Orientation date',
  workStartDate: 'Started work',
  sentenceEndDate: 'Sentence end date',
});

const DatesWrapper = styled.div`
  width: 600px;
`;

type Props = {
  orientationDateTime :string;
  sentenceTerm :Map;
};

const KeyDates = ({ orientationDateTime, sentenceTerm } :Props) => {

  const { [DATETIME_START]: sentDate } = getEntityProperties(sentenceTerm, [DATETIME_START]);
  const sentenceDate = sentDate ? formatAsDate(sentDate) : EMPTY_FIELD;
  const sentenceDateObj = DateTime.fromISO(sentDate);
  const checkInDeadline = sentenceDateObj.isValid
    ? sentenceDateObj.plus({ hours: 48 }).toLocaleString()
    : EMPTY_FIELD;
  const sentenceEndDate = sentenceDateObj.isValid
    ? sentenceDateObj.plus({ days: 90 }).toLocaleString()
    : EMPTY_FIELD;
  const orientationDateObj = DateTime.fromISO(orientationDateTime);
  const orientationDate = orientationDateObj.isValid
    ? orientationDateObj.toLocaleString(DateTime.DATE_SHORT)
    : EMPTY_FIELD;

  const data :Map = fromJS({
    sentenceDate,
    checkInDeadline,
    checkedInDate: EMPTY_FIELD,
    orientationDate,
    workStartDate: EMPTY_FIELD,
    sentenceEndDate,
  });
  return (
    <DatesWrapper>
      <Card>
        <CardSegment padding="lg" vertical>
          <DataGrid
              columns={3}
              data={data}
              labelMap={labelMap} />
        </CardSegment>
      </Card>
    </DatesWrapper>
  );
};

export default KeyDates;
