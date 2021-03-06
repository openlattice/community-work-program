// @flow
import React from 'react';

import { Map, OrderedMap, fromJS } from 'immutable';
import { Card, CardSegment, DataGrid } from 'lattice-ui-kit';

import { SectionLabel, SectionNameRow, SectionWrapper } from './SectionStyledComponents';

import EditButton from '../controls/buttons/EditButton';
import { formatAsDate } from '../../utils/DateTimeUtils';
import { getCheckInDeadline, getSentenceEndDate } from '../../utils/ScheduleUtils';

const labelMap :OrderedMap = OrderedMap({
  sentenceDate: 'Sentence date',
  checkInDeadlineDate: 'Check-in deadline',
  checkedInDate: 'Date checked in',
  orientationDate: 'Orientation date',
  workStartDate: 'Started work',
  sentenceEndDate: 'Sentence end date',
});

type Props = {
  checkInDate :string;
  checkInDeadline :string;
  edit :() => void;
  orientationDateTime :string;
  sentenceDateTime :string;
  sentenceEndDateTime :string;
  workStartDateTime :string;
};

const EnrollmentDates = ({
  checkInDate,
  checkInDeadline,
  edit,
  orientationDateTime,
  sentenceDateTime,
  sentenceEndDateTime,
  workStartDateTime
} :Props) => {

  const sentenceDate = formatAsDate(sentenceDateTime);
  const checkInDeadlineDate = getCheckInDeadline(sentenceDateTime, checkInDeadline);
  const sentenceEndDate = getSentenceEndDate(sentenceEndDateTime);
  const orientationDate = formatAsDate(orientationDateTime);
  const workStartDate = formatAsDate(workStartDateTime);
  const checkedInDate = formatAsDate(checkInDate);

  const data :Map = fromJS({
    sentenceDate,
    checkInDeadlineDate,
    checkedInDate,
    orientationDate,
    workStartDate,
    sentenceEndDate,
  });
  return (
    <SectionWrapper>
      <SectionNameRow>
        <SectionLabel subtle>Enrollment Dates</SectionLabel>
        <EditButton onClick={edit} />
      </SectionNameRow>
      <Card>
        <CardSegment padding="md">
          <DataGrid
              columns={3}
              data={data}
              labelMap={labelMap} />
        </CardSegment>
      </Card>
    </SectionWrapper>
  );
};

export default EnrollmentDates;
