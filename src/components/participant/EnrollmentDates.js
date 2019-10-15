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
  StyledEditButton,
} from './SectionStyledComponents';
import { formatAsDate } from '../../utils/DateTimeUtils';
import { getCheckInDeadline, getSentenceEndDate } from '../../utils/ScheduleUtils';
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
  edit :() => void;
  orientationDateTime :string;
  sentenceDateTime :string;
  sentenceEndDateTime :string;
  workStartDateTime :string;
};

const EnrollmentDates = ({
  checkInDate,
  edit,
  orientationDateTime,
  sentenceDateTime,
  sentenceEndDateTime,
  workStartDateTime
} :Props) => {

  const sentenceDate = formatAsDate(sentenceDateTime);
  const checkInDeadline = getCheckInDeadline(sentenceDateTime);
  const sentenceEndDate = getSentenceEndDate(sentenceEndDateTime, sentenceDateTime);
  const orientationDate = formatAsDate(orientationDateTime);
  const workStartDate = formatAsDate(workStartDateTime);
  const checkedInDate = formatAsDate(checkInDate);

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
        <StyledEditButton mode="subtle" onClick={edit} />
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
