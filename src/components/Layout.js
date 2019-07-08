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
  width: ${SEARCH_CONTAINER_WIDTH}px;
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

/* Component Headers */

export const HeaderWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 15px;
`;

export const HeaderWrapperWithButtons = styled(HeaderWrapper)`
  margin-top: 15px;
  justify-content: space-between;
  align-items: center;
`;

export const ContainerHeader = styled.span`
  margin: 0 25px 0 0;
  font-size: 26px;
  font-weight: 600;
  color: ${OL.BLACK};
`;

export const ContainerSubHeader = styled(ContainerHeader)`
  color: ${OL.GREY02};
  font-size: 24px;
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
  color: ${statusColorVariation};
`;

/* Cards */

export const CardOuterWrapper = styled.div`
  width: 100%;
  border-radius: 5px;
  border: solid 1px ${OL.GREY11};
  background-color: ${OL.WHITE};
  margin-bottom: 20px;
`;

export const CardHeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const CardInnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 50px;
`;

export const CardInnerText = styled.div`
  margin-bottom: 30px;
  :last-of-type {
    margin-bottom: 0;
  }
`;

export const InnerSectionWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 50px;
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 150px;
`;

export const SectionHeaderWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 30px;
`;

export const SectionHeader = styled.span`
  color: ${OL.GREY15};
  font-weight: 600;
  font-size: 16px;
  margin: 0 20px;
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
  color: ${props => (props.selected ? OL.GREY15 : OL.GREY02)};
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
  font-size: ${props => (props.small ? '12' : '14')}px;
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
  margin: 0 20px 10px 20px;
  min-width: 250px;
`;

export const StyledTextArea = styled.textarea`
  background-color: ${OL.GREY10};
  border-radius: 3px;
  border: 1px solid ${props => (props.invalid ? OL.RED01 : OL.GREY05)};
  box-shadow: 0;
  box-sizing: border-box;
  color: ${OL.GREY01};
  display: flex;
  flex: 0 1 auto;
  font-size: 14px;
  line-height: 18px;
  padding: 10px 10px;
  text-overflow: ellipsis;
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
  width: 100%;

  :hover {
    background-color: ${OL.GREY08};
  }
  :focus {
    border: solid 1px ${OL.PURPLE02};
    background-color: white;
    outline: none;
  }
  :disabled {
    background-color: ${OL.GREY10};
    color: ${OL.GREY02};
    cursor: not-allowed;
  }
`;
