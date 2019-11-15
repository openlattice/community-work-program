import styled from 'styled-components';

export const PersonPicture = styled.img`
  height: 100%;
  width: 100%;
`;

export const PersonPhoto = styled.div`
  border-radius: 10%;
  width: 68px;
  height: 78px;
  position: relative;
  overflow: hidden;

  img {
    display: inline;
    margin: 0 auto;
  }
`;

export const StyledPersonPhoto = styled(PersonPhoto)`
  width: ${(props) => (props.small ? 30 : 36)}px;
  ${(props) => (props.small
    ? (
      `min-width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;`
    )
    : ''
  )}
`;
