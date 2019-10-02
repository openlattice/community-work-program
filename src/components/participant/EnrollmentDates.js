// @flow
import React from 'react';
import styled from 'styled-components';
import { fromJS, Map, OrderedMap } from 'immutable';
import { DateTime } from 'luxon';
import { Card, CardSegment, DataGrid } from 'lattice-ui-kit';

import {
  SectionLabel,
  SectionNameRow,
  SectionWrapper,
  SmallEditButton,
} from './SectionStyledComponents';
import { formatAsDate } from '../../utils/DateTimeUtils';
import { EMPTY_FIELD } from '../../containers/participants/ParticipantsConstants';

const labelMap :OrderedMap = OrderedMap({
  sentenceDate: 'Sentence date',
  checkInDeadline: 'Check-in deadline',
  checkedInDate: 'Date checked in',
  orientationDate: 'Orientation date',
  workStartDate: 'Started work',
  sentenceEndDate: 'Sentence end date',
});

const DatesCard = styled(Card)`
  height: 190px;
`;

type Props = {
  checkInDate :string;
  orientationDateTime :string;
  sentenceDateTime :string;
  workStartDateTime :string;
};

const EnrollmentDates = ({
  checkInDate,
  orientationDateTime,
  sentenceDateTime,
  workStartDateTime
} :Props) => {

  const sentenceDate = sentenceDateTime ? formatAsDate(sentenceDateTime) : EMPTY_FIELD;

  const sentenceDateObj = DateTime.fromISO(sentenceDateTime);
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

  const workStartDate = workStartDateTime ? formatAsDate(workStartDateTime) : EMPTY_FIELD;

  const checkedInDate = checkInDate ? formatAsDate(checkInDate) : EMPTY_FIELD;

  const data :Map = fromJS({
    sentenceDate,
    checkInDeadline,
    checkedInDate,
    orientationDate,
    workStartDate,
    sentenceEndDate,
  });
  return (
    <SectionWrapper>
      <SectionNameRow>
        <SectionLabel subtle>Enrollment Dates</SectionLabel>
        <SmallEditButton mode="subtle" onClick={() => {}} />
      </SectionNameRow>
      <DatesCard>
        <CardSegment padding="md" vertical>
          <DataGrid
              columns={3}
              data={data}
              labelMap={labelMap} />
        </CardSegment>
      </DatesCard>
    </SectionWrapper>
  );
};

export default EnrollmentDates;