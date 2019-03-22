// @flow
import React from 'react';
import styled from 'styled-components';

import { OL } from '../../utils/constants/Colors';

const ViolationsWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 320px;
  height: 200px;
  border: 1px solid ${OL.GREY08};
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

const ViolationsDisplay = () => (
  <ViolationsWrapper>
    <InfoBlock>
      <Header># Warnings</Header>
      <Number>2</Number>
    </InfoBlock>
    <InfoBlock>
      <Header># Violations</Header>
      <Number>0</Number>
    </InfoBlock>
  </ViolationsWrapper>
);

export default ViolationsDisplay;
