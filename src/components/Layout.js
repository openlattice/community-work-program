import styled from 'styled-components';

import { APP_CONTENT_PADDING, SEARCH_CONTAINER_WIDTH } from '../core/style/Sizes';
import { OL } from '../core/style/Colors';

/* Component Wrappers */

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
  margin-bottom: 30px;
`;

export const ContainerHeader = styled.span`
  margin: 0 25px 0 0;
  font-size: 26px;
  font-weight: 600;
  color: ${OL.BLACK};
`;

export const ContainerSubHeader = styled(ContainerHeader)`
  color: ${OL.GREY02};
  margin: 0;
`;

export const Separator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${OL.GREY02};
  font-weight: 600;
  margin: 0 10px 0 10px;
`;

export const SubtitleWrapper = styled.span`
  display: flex;
`;

export const Subtitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${OL.GREY02};
`;

export const SmallSeparator = styled(Separator)`
  margin: 0 5px;
  font-weight: 300;
`;

export const Status = styled(Subtitle)`
  color: ${props => (props.active ? OL.GREEN02 : OL.RED01)};
`;

/* Cards */

export const CardOuterWrapper = styled.div`
  width: 100%;
  border-radius: 5px;
  border: solid 1px ${OL.GREY11};
  background-color: ${OL.WHITE};
  margin-bottom: 20px;
`;

export const CardInnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 50px;
`;

