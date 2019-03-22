// @flow
import React from 'react';
import styled from 'styled-components';

import { OL } from '../../utils/constants/Colors';

const CaseInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 258px;
  height: 200px;
  border: 1px solid ${OL.GREY08};
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

const Number = styled.div`
  color: ${OL.BLACK};
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  border-bottom: 1px solid ${OL.GREY08};
  padding-bottom: 15px;

  :last-of-type {
    border: none;
    padding-bottom: 0;
  }
`;

const CaseInfo = () => (
  <CaseInfoWrapper>
    <Header>Case Number</Header>
    <Number>1234567890123456</Number>
    <Header>Required Hours</Header>
    <Number>100</Number>
  </CaseInfoWrapper>
);

export default CaseInfo;
