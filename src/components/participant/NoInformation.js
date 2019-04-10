// @flow
import React from 'react';
import styled from 'styled-components';
import NoInformation from '../../assets/svg/no-info-icon.svg';

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
    color: #8e929b;
  }
`;

type Props = {
  caption? :string;
}

const NoInformationFound = ({ caption } :Props) => (
  <FigureWrapper>
    <img src={NoInformation} alt="No relevant information" className="No-Info-Icon" />
    <figcaption>{caption}</figcaption>
  </FigureWrapper>
);

NoInformationFound.defaultProps = {
  caption: 'No relevant information to display'
};

export default NoInformationFound;
