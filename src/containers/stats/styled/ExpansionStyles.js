// @flow
import React from 'react';

import styled from 'styled-components';
import { faChevronDown } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Colors, ExpansionPanelSummary } from 'lattice-ui-kit';

const { NEUTRAL } = Colors;

const expandIcon = <FontAwesomeIcon color={NEUTRAL.N900} icon={faChevronDown} size="xs" />;

const StyledExpansionPanelSummary = styled(ExpansionPanelSummary)`
  && {
    background-color: white;
  }
`;

const SpinnerWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  width: 100%;
`;

export {
  SpinnerWrapper,
  StyledExpansionPanelSummary,
  expandIcon,
};
