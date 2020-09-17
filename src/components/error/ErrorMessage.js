// @flow
import React from 'react';

import styled from 'styled-components';
import { faExclamationCircle } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CardSegment, Colors } from 'lattice-ui-kit';

const { RED } = Colors;

const ErrorWrapper = styled.div`
  align-items: center;
  display: flex;
`;

const Error = styled.div`
  color: ${RED.R300};
  margin-left: 10px;
`;

type Props = {
  errorMessage ? :string;
  padding ? :string;
};

const ErrorMessage = ({ errorMessage, padding } :Props) => (
  <CardSegment padding={padding}>
    <ErrorWrapper>
      <FontAwesomeIcon icon={faExclamationCircle} color={RED.R300} />
      <Error>{ errorMessage }</Error>
    </ErrorWrapper>
  </CardSegment>
);

ErrorMessage.defaultProps = {
  errorMessage: 'An error occurred. Please refresh the page and try again.',
  padding: 'sm'
};

export default ErrorMessage;
