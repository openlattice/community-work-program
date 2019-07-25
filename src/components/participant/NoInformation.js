// @flow
import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen } from '@fortawesome/pro-light-svg-icons';

import { OL } from '../../core/style/Colors';

const FigureWrapper = styled.figure`
  text-align: center;
  margin: 50px auto;
  figcaption {
    margin: 20px auto;
    line-height: 22px;
    width: 100%;
    font-size: 16px;
    font-weight: 600;
    text-align: center;
    color: ${OL.GREY02};
  }
`;

type Props = {
  caption? :string;
}

const NoInformationFound = ({ caption } :Props) => (
  <FigureWrapper>
    <FontAwesomeIcon icon={faFolderOpen} color={OL.GREY02} size="3x" />
    <figcaption>{caption}</figcaption>
  </FigureWrapper>
);

NoInformationFound.defaultProps = {
  caption: 'No relevant information to display'
};

export default NoInformationFound;
