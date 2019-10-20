import styled from 'styled-components';

export const PersonPicture = styled.img`
  /* width: ${props => (props.small ? 30 : 36)}px; */
  height: 100%;
  width: 100%;
`;

export const PersonPhoto = styled.div`
  border-radius: 3px;
  width: 152px;
  height: 120px;
  position: relative;
  overflow: hidden;
  img {
      display: inline;
      margin: 0 auto;
  }
`;
