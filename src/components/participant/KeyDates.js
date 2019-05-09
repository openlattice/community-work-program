// @flow
import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { DateTime } from 'luxon';

import { formatAsDate } from '../../utils/DateTimeUtils';
import { OL } from '../../utils/constants/Colors';

const DatesWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 600px;
  height: 175px;
  border: 1px solid ${OL.GREY08};
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
  person :Map;
};

const KeyDates = ({ person } :Props) => (
  <DatesWrapper>
    <DateBlock>
      <Header>Sentence Date</Header>
      <Date>{formatAsDate(person.get('sentenceDate'))}</Date>
    </DateBlock>
    <DateBlock>
      <Header>Sentence End Date</Header>
      <Date>{formatAsDate(person.get('sentenceEndDate'))}</Date>
    </DateBlock>
    <DateBlock>
      <Header>Enrollment Deadline</Header>
      <Date>{DateTime.fromISO(person.get('sentenceDate')).plus({ weeks: 2 }).toLocaleString()}</Date>
    </DateBlock>
  </DatesWrapper>
);

export default KeyDates;
