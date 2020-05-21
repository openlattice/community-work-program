// @flow
import React from 'react';
import styled from 'styled-components';
import { ExpansionPanelSummary } from 'lattice-ui-kit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/pro-light-svg-icons';

const expandIcon = <FontAwesomeIcon icon={faChevronDown} size="xs" />;

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
