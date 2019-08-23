// @flow
import React from 'react';
import styled from 'styled-components';
import { fromJS, Map, OrderedMap } from 'immutable';
import { DateTime } from 'luxon';
import { Card, CardSegment, DataGrid } from 'lattice-ui-kit';

// import { getEntityProperties } from '../../utils/DataUtils';
import { formatAsDate } from '../../utils/DateTimeUtils';

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
  sentenceDateTime :string;
};

const KeyDates = ({ orientationDateTime, sentenceDateTime } :Props) => {

  const sentenceDate = sentenceDateTime ? formatAsDate(sentenceDateTime) : '----';
  const sentenceDateObj = DateTime.fromISO(sentenceDateTime);
  const checkInDeadline = sentenceDateObj.isValid
    ? sentenceDateObj.plus({ hours: 48 }).toLocaleString()
    : '----';
  const sentenceEndDate = sentenceDateObj.isValid
    ? sentenceDateObj.plus({ days: 90 }).toLocaleString()
    : '----';
  const orientationDateObj = DateTime.fromISO(orientationDateTime);
  const orientationDate = orientationDateObj.isValid
    ? orientationDateObj.toLocaleString(DateTime.DATE_SHORT)
    : '----';

  const data :Map = fromJS({
    sentenceDate,
    checkInDeadline,
    checkedInDate: '----',
    orientationDate,
    workStartDate: '----',
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
