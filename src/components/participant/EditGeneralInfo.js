// @flow
import React from 'react';

import {
  ContainerOuterWrapper,
  BodyTextSegment,
  BodyText,
} from '../Layout';
import { StyledInput } from '../controls/index';
import { emotionStyles } from '../controls/dropdowns/StyledSelect';

const EditGeneralInfo = () => (
  <ContainerOuterWrapper style={{ width: '300px' }}>
    <BodyTextSegment style={{ marginBottom: '10px' }}>
      <BodyText>Please enter a valid email address.</BodyText>
      <StyledInput
          styles={emotionStyles} />
    </BodyTextSegment>
  </ContainerOuterWrapper>
);

export default EditGeneralInfo;
