import styled from 'styled-components';

export const PersonPicture = styled.img`
  width: ${props => (props.small ? 30 : 36)}px;
  height: auto;
`;

export const PersonPhoto = styled.div`
  margin-right: 20px;
  border-radius: 50%;
  min-width: 36px;
  height: 36px;
  position: relative;
  overflow: hidden;
  img {
      display: inline;
      margin: 0 auto;
  }
`;
