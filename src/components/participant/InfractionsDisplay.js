// @flow
import React from 'react';
import styled from 'styled-components';
import { List } from 'immutable';

import { formatNumericalValue } from '../../utils/FormattingUtils';
import { OL } from '../../core/style/Colors';

const ViolationsWrapper = styled.div`
  align-items: center;
  background-color: ${OL.WHITE};
  border-radius: 5px;
  border: 1px solid ${OL.GREY11};
  display: flex;
  height: 200px;
  justify-content: center;
  padding: 70px 0;
  width: 320px;
`;

const InfoBlock = styled.div`
  align-items: center;
  border-right: 1px solid ${OL.GREY08};
  display: flex;
  flex-direction: column;
  justify-content: center;
  :last-of-type {
    border: none;
  }
`;

const Header = styled.div`
  color: ${OL.GREY02};
  font-size: 16px;
  font-weight: 600;
  margin: 0 30px;
`;

const Number = styled.div`
  color: ${OL.BLACK};
  font-size: 18px;
  font-weight: 600;
  margin: 8px 30px;
`;

type Props = {
  violations :List;
  warnings :List;
};

const InfractionsDisplay = ({ violations, warnings } :Props) => {
  const warningsCount = formatNumericalValue(warnings.count());
  const violationsCount = formatNumericalValue(violations.count());
  return (
    <ViolationsWrapper>
      <InfoBlock>
        <Header># Warnings</Header>
        <Number>{ warningsCount }</Number>
      </InfoBlock>
      <InfoBlock>
        <Header># Violations</Header>
        <Number>{ violationsCount }</Number>
      </InfoBlock>
    </ViolationsWrapper>
  );
};

export default InfractionsDisplay;
