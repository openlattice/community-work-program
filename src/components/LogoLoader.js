/*
 * @flow
 */

import React from 'react';
import styled, { keyframes } from 'styled-components';

const KeyFrames = keyframes`
  0% {
    transform: scale(0.5) rotate(-45deg);
    opacity: 0;
  }

  50% {
    transform: scale(1.2) rotate(-45deg);
    opacity: 0.75;
  }

  100% {
    transform: scale(0.5) rotate(-45deg);
    opacity: 0;
  }
`;

const Ellipse = styled.div`
  animation: ${KeyFrames} 3s ease-in-out 3s infinite;
  animation-delay: 0.3s;
  background: #b898ff;
  border-radius: 500px;
  display: block;
  height: ${(props :Object) => (props.size ? (parseFloat(props.size) * 0.5).toString() : (25).toString())}px;
  opacity: 0;
  transform-origin: center;
  transform: rotate(-45deg);
  width: ${(props :Object) => (props.size ? props.size : (50).toString())}px;
`;

const EllipseTop = styled(Ellipse)`
  animation-delay: 0.6s;
`;

const EllipseBottom = styled(Ellipse)`
  animation-delay: 0s;
`;


const LoadingText = styled.div`
  font-size: 16px;
  margin-bottom: 20%;
  margin-top: 30px;
  text-align: center;
  width: 100%;
`;

const Container = styled.div`
  width: 100%;
  min-height: ${(props :Object) => (props.size ? (parseFloat(props.size) * 1.5).toString() : (75).toString())}px;
  margin-top: 20%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

type Props = {
  loadingText :string,
  size :number
}

const LogoLoader = ({ size, loadingText } :Props) => (
  <>
    <Container>
      <EllipseTop size={size} />
      <Ellipse size={size} />
      <EllipseBottom size={size} />
    </Container>
    { loadingText ? <LoadingText size={size}>{loadingText}</LoadingText> : null }
  </>
);

export default LogoLoader;
