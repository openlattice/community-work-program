// @flow
import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import { formatNumericalValue } from '../../utils/FormattingUtils';
import { INFRACTIONS_CONSTS } from '../../core/edm/constants/DataModelConsts';
import { OL } from '../../core/style/Colors';

const ViolationsWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 320px;
  height: 200px;
  border: 1px solid ${OL.GREY11};
  background-color: ${OL.WHITE};
  padding: 70px 0;
  border-radius: 5px;
`;

const InfoBlock = styled.div`
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
  margin: 0 30px;
`;

const Number = styled.div`
  color: ${OL.BLACK};
  font-size: 18px;
  font-weight: 600;
  margin: 8px 30px;
`;

type Props = {
  infractions :Map;
};

const InfractionsDisplay = ({ infractions } :Props) => {
  const warnings = formatNumericalValue(infractions.get(`${INFRACTIONS_CONSTS.WARNING}s`, 0));
  const violations = formatNumericalValue(infractions.get(`${INFRACTIONS_CONSTS.VIOLATION}s`, 0));
  return (
    <ViolationsWrapper>
      <InfoBlock>
        <Header># Warnings</Header>
        <Number>{ warnings }</Number>
      </InfoBlock>
      <InfoBlock>
        <Header># Violations</Header>
        <Number>{ violations }</Number>
      </InfoBlock>
    </ViolationsWrapper>
  );
}

export default InfractionsDisplay;
