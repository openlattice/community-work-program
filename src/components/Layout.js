// @flow
import styled from 'styled-components';
import { Colors, StyleUtils } from 'lattice-ui-kit';

import { WORKSITE_STATUSES } from '../containers/worksites/WorksitesConstants';
import { APP_CONTENT_PADDING, SEARCH_CONTAINER_WIDTH } from '../core/style/Sizes';

const { getStyleVariation } = StyleUtils;
const { GREEN, NEUTRAL, RED } = Colors;

const statusColorVariation = getStyleVariation('status', {
  default: NEUTRAL.N700,
  [WORKSITE_STATUSES.ACTIVE]: GREEN.G300,
  [WORKSITE_STATUSES.INACTIVE]: RED.R300,
});

/* Component Wrappers */

export const ContainerOuterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const ContainerInnerWrapper = styled.div`
  align-self: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 30px;
  padding: ${APP_CONTENT_PADDING}px;
  width: ${SEARCH_CONTAINER_WIDTH}px;
`;

export const ButtonWrapper = styled.div`
  align-items: center;
  display: flex;
  margin-left: 15px;

  &:hover {
    cursor: pointer;
  }
`;

export const ButtonsWrapper = styled.div`
  align-items: center;
  display: flex;
`;

export const ContainerHeader = styled.span`
  color: ${NEUTRAL.N900};
  font-size: 26px;
  font-weight: 600;
`;

/* Component Headers */

export const SubtitleWrapper = styled.span`
  display: flex;
`;

export const Subtitle = styled.span`
  font-size: 14px;
  font-weight: 600;
`;

export const Status = styled(Subtitle)`
  color: ${statusColorVariation};
`;

/* Body */

export const BodyTextSegment = styled.span`
  display: flex;
  flex-direction: column;
`;

export const BodyTextHeader = styled.span`
  font-size: 11px;
  font-weight: 600;
`;

export const BodyText = styled.span`
  color: ${NEUTRAL.N900};
  font-size: 14px;
  margin: 5px 0;
`;

/* Horizontal Menu */

export const RowWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 15px 0 20px 0;
`;

export const Menu = styled.div`
  align-items: center;
  display: flex;
`;

export const MenuItem = styled.span`
  align-items: center;
  color: ${(props) => (props.selected ? NEUTRAL.N900 : NEUTRAL.N700)};
  display: flex;
  font-weight: 600;
  justify-content: center;
  margin-right: 20px;

  &:hover {
    color: ${NEUTRAL.N900};
    cursor: pointer;
  }
`;

/* Table */

export const TableBanner = styled.tr`
  color: ${NEUTRAL.N900};
  display: flex;
  font-size: 24px;
  padding: 50px;
  width: 100%;
`;

export const TableFooter = styled.div`
  border-top: 1px solid ${NEUTRAL.N100};
  display: flex;
  padding: 20px 50px;
`;

export const FooterCell = styled.span`
  color: ${NEUTRAL.N900};
  font-family: 'Open Sans', sans-serif;
  font-size: ${(props) => (props.small ? '12' : '14')}px;
  font-weight: 600;
  padding: 15px 0;
  text-align: left;
`;

/* Messages */

export const ErrorMessage = styled.div`
  padding-top: 20px;
  text-align: center;
`;

/* Forms */

export const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
  padding: 0;
`;

export const FormRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

export const ButtonsRow = styled(FormRow)`
  margin-top: 20px;
`;

export const RowContent = styled.div`
  flex-grow: 1;
  margin: 0 20px 10px 0;
  min-width: 250px;

  :last-of-type {
    margin-right: 0;
  }
`;
