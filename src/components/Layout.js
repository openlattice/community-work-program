import styled from 'styled-components';
import { StyleUtils } from 'lattice-ui-kit';

import { APP_CONTENT_PADDING, SEARCH_CONTAINER_WIDTH } from '../core/style/Sizes';
import { OL } from '../core/style/Colors';
import { WORKSITE_STATUSES } from '../containers/worksites/WorksitesConstants';

const { getStyleVariation } = StyleUtils;

const statusColorVariation = getStyleVariation('status', {
  default: OL.GREY02,
  [WORKSITE_STATUSES.ACTIVE]: OL.GREEN02,
  [WORKSITE_STATUSES.INACTIVE]: OL.RED01,
});

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
  /* width: ${SEARCH_CONTAINER_WIDTH}px; */
  align-self: center;
`;

export const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
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
  color: ${OL.BLACK};
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
  color: ${OL.GREY02};
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
  color: ${OL.GREY02};
  font-size: 11px;
  font-weight: 600;
`;

export const BodyText = styled.span`
  color: ${OL.GREY15};
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
  display: flex;
  align-items: center;
`;

export const MenuItem = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
  color: ${(props) => (props.selected ? OL.GREY15 : OL.GREY02)};
  font-weight: 600;

  &:hover {
    cursor: pointer;
    color: ${OL.GREY01};
  }
`;

/* Table */

export const TableBanner = styled.tr`
  width: 100%;
  font-size: 24px;
  color: ${OL.BLACK};
  padding: 50px;
  display: flex;
`;

export const TableFooter = styled.div`
  border-top: 1px solid ${OL.GREY11};
  padding: 20px 50px;
  display: flex;
`;

export const FooterCell = styled.span`
  padding: 15px 0;
  font-family: 'Open Sans', sans-serif;
  font-size: ${(props) => (props.small ? '12' : '14')}px;
  font-weight: 600;
  text-align: left;
  color: ${OL.GREY15};
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
  display: flex;
  justify-content: space-between;
  align-items: center;
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
