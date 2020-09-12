// @flow
import React from 'react';

import styled from 'styled-components';
import { faUserSlash } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CardSegment, Colors } from 'lattice-ui-kit';

const { NEUTRAL } = Colors;

const Wrapper = styled(CardSegment)`
  align-items: center;
  justify-content: center;
`;

type Props = {
  text :string;
};

const NoParticipantsFound = ({ text } :Props) => (
  <Wrapper>
    <FontAwesomeIcon icon={faUserSlash} color={NEUTRAL.N700} size="2x" />
    { text }
  </Wrapper>
);

export default NoParticipantsFound;
