// @flow
import React from 'react';
import styled from 'styled-components';

import {
  ContainerOuterWrapper,
  BodyText,
  ButtonWrapper,
} from '../Layout';
import { StyledSelect } from '../controls/index';
import { emotionStyles } from '../controls/dropdowns/StyledSelect';

const SelectWrapper = styled(ButtonWrapper)`
  position: fixed;
  z-index: 500;
  min-width: 450px;
  margin-top: 40px;
`;

const EditCaseNumber = () => (
  <ContainerOuterWrapper style={{ minHeight: '100px', justifyContent: 'flex-start' }}>
    <BodyText>Please select the case associated with this community work program.</BodyText>
    <SelectWrapper>
      <StyledSelect
          styles={emotionStyles} />
    </SelectWrapper>
  </ContainerOuterWrapper>
);

export default EditCaseNumber;
