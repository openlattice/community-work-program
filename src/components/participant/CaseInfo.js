// @flow
import React from 'react';
import styled from 'styled-components';

import { formatNumericalValue } from '../../utils/FormattingUtils';
import { OL } from '../../core/style/Colors';

const CaseInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 258px;
  height: 200px;
  border: 1px solid ${OL.GREY11};
  background-color: ${OL.WHITE};
  padding: 20px 0;
  border-radius: 5px;
`;

const Header = styled.div`
  color: ${OL.GREY02};
  font-weight: 600;
  font-size: 16px;
  margin: 8px;
`;

const Number = styled.span`
  color: ${OL.BLACK};
  font-size: 18px;
  font-weight: 600;
  margin: 0 8px 0 0
`;

const NumberWrapper = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid ${OL.GREY08};
  padding-bottom: 15px;
  :last-of-type {
    border: none;
    padding-bottom: 0;
  }
`;

type Props = {
  caseNumber :string;
  hours :number;
};

const CaseInfo = ({ caseNumber, hours } :Props) => (
  <CaseInfoWrapper>
    <Header>Case Number</Header>
    <NumberWrapper>
      <Number>{ caseNumber }</Number>
    </NumberWrapper>
    <Header>Required Hours</Header>
    <NumberWrapper>
      <Number>{ formatNumericalValue(hours) }</Number>
    </NumberWrapper>
  </CaseInfoWrapper>
);

export default CaseInfo;
