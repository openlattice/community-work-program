import styled from 'styled-components';

export const NavButton = styled.button`
  border: none;
  font-family: 'Open Sans', sans-serif;
  color: ${props => (props.disabled ? '#8e929b' : '#6124e2')};
  font-size: 14px;
  font-weight: 600;
  padding: 0;
  background: transparent;
  span {
    margin-left: 7px;
  }
  &:focus {
    outline: none;
  }
  &:hover {
    cursor: ${props => (props.disabled ? 'default' : 'pointer')};
    color: ${props => (props.disabled ? '#8e929b' : '#361876')};
  }
`;
