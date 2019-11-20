// @flow
import React from 'react';
import styled from 'styled-components';
import { CardSegment } from 'lattice-ui-kit';
import { faUserSlash } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { OL } from '../../core/style/Colors';

const Wrapper = styled(CardSegment)`
  border-top: 1px solid ${OL.BLACK};
  align-items: center;
  justify-content: center;
`;

type Props = {
  text :string;
};

const NoParticipantsFound = ({ text } :Props) => (
  <Wrapper vertical>
    <FontAwesomeIcon icon={faUserSlash} color={OL.GREY01} size="2x" />
    { text }
  </Wrapper>
);

export default NoParticipantsFound;