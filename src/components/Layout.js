import styled from 'styled-components';

import { APP_CONTENT_PADDING, SEARCH_CONTAINER_WIDTH } from '../core/style/Sizes';
import { OL } from '../core/style/Colors';

export const ContainerOuterWrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

export const ContainerInnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: ${APP_CONTENT_PADDING}px;
  margin-top: 30px;
  width: ${SEARCH_CONTAINER_WIDTH}px;
  align-self: center;
`;

export const HeaderWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
`;

export const ContainerHeader = styled.span`
  margin: 0 25px 40px 0;
  font-size: 26px;
  font-weight: 600;
  color: ${OL.BLACK};
`;

export const ContainerSubHeader = styled(ContainerHeader)`
  color: ${OL.GREY02};
  margin: 0 0 40px 0;
`;
