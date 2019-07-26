// @flow

import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';

import { INFRACTION_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { OL } from '../../../core/style/Colors';

const {
  TYPE,
  CATEGORY,
  DATETIME,
  DESCRIPTION,
} = INFRACTION_FQNS;

const NoteWrapper = styled.div`
  margin-top: 20px;
  padding: 40px;
  background-color: ${OL.WHITE};
  border: 1px solid ${OL.GREY11};
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const InfoWrapper = styled.div`
  width: 100%;
  display: flex;
  margin: 15px 0;
  justify-content: flex-start;
  align-items: center;
`;

const InfoBlock = styled.span`
  display: flex;
  flex-direction: column;
  font-size: 14px;
  margin-right: 150px;
  :last-of-type {
    margin-right: none;
  }
`;

const Title = styled.div`
  display: flex;
  justify-content: flex-start;
  color: ${OL.GREY02};
  font-weight: 600;
  margin: 5px 0;
`;

const Data = styled.div`
  display: flex;
  justify-content: flex-start;
  color: ${(props) => {
    if (props.level) {
      return props.level === 'Warning' ? OL.YELLOW01 : OL.RED01;
    }
    return OL.GREY15;
  }};
`;

type Props = {
  infractions :List;
};

const DigestedInfractionsContainer = ({ infractions } :Props) => (

  infractions.map((infraction :Map) => {
    const datetimeObj = DateTime.fromISO(infraction.get(DATETIME));
    const date :string = datetimeObj.toLocaleString(DateTime.DATE_SHORT);
    const time :string = datetimeObj.toLocaleString(DateTime.TIME_SIMPLE);
    return (
      <NoteWrapper>
        <InfoWrapper>
          <InfoBlock>
            <Title>Report Level</Title>
            <Data>{ infraction.get(TYPE) }</Data>
          </InfoBlock>
          <InfoBlock>
            <Title>Date</Title>
            <Data>{ date }</Data>
          </InfoBlock>
          <InfoBlock>
            <Title>Time</Title>
            <Data>{ time }</Data>
          </InfoBlock>
        </InfoWrapper>
        <InfoWrapper>
          <InfoBlock>
            <Title>Description of Incident</Title>
            <Data>{ infraction.get(DESCRIPTION) }</Data>
          </InfoBlock>
        </InfoWrapper>
      </NoteWrapper>
    );
  })
);

// $FlowFixMe
export default DigestedInfractionsContainer;
