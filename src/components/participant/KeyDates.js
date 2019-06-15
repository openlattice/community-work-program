// @flow
import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { DateTime } from 'luxon';

import { getEntityProperties } from '../../utils/DataUtils';
import { formatAsDate } from '../../utils/DateTimeUtils';
import { SENTENCE_TERM_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { OL } from '../../core/style/Colors';

const { DATETIME_START } = SENTENCE_TERM_FQNS;

const DatesWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 600px;
  height: 175px;
  border: 1px solid ${OL.GREY11};
  background-color: ${OL.WHITE};
  padding: 70px 0;
  border-radius: 5px;
`;

const DateBlock = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-right: 1px solid ${OL.GREY08};
  :last-of-type {
    border: none;
  }
`;

const Header = styled.div`
  color: ${OL.GREY02};
  font-weight: 600;
  font-size: 16px;
  margin: 0 20px;
`;

const Date = styled.div`
  color: ${OL.BLACK};
  font-size: 18px;
  font-weight: 600;
  margin: 8px 30px;
`;

type Props = {
  sentenceTerm :Map;
};

const KeyDates = ({ sentenceTerm } :Props) => {

  const { [DATETIME_START]: sentDate } = getEntityProperties(sentenceTerm, [DATETIME_START]);
  const sentenceDate = sentDate ? formatAsDate(sentDate) : '';
  const enrollmentDeadline = DateTime.fromISO(sentDate).isValid
    ? DateTime.fromISO(sentDate).plus({ hours: 48 }).toLocaleString()
    : '';
  const sentenceEndDate = DateTime.fromISO(sentDate).isValid
    ? DateTime.fromISO(sentDate).plus({ days: 90 }).toLocaleString()
    : '';
  return (
    <DatesWrapper>
      <DateBlock>
        <Header>Sentence Date</Header>
        <Date>{ sentenceDate }</Date>
      </DateBlock>
      <DateBlock>
        <Header>Enrollment Deadline</Header>
        <Date>{ enrollmentDeadline }</Date>
      </DateBlock>
      <DateBlock>
        <Header>Sentence End Date</Header>
        <Date>{ sentenceEndDate }</Date>
      </DateBlock>
    </DatesWrapper>
  );
};

export default KeyDates;
