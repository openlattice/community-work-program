// @flow
import styled from 'styled-components';
import { StyleUtils } from 'lattice-ui-kit';

import { ENROLLMENT_STATUS_COLORS, OL } from '../../core/style/Colors';
import { PersonPhoto } from '../picture/PersonPicture';
import { ENROLLMENT_STATUSES } from '../../core/edm/constants/DataModelConsts';
import { WORKSITE_STATUSES } from '../../containers/worksites/WorksitesConstants';

const { getStyleVariation } = StyleUtils;

/* Table Styles */

export const TableWrapper = styled.div`
  width: ${props => (props.width ? props.width : '100%')};
  background-color: ${OL.WHITE};
  border: 1px solid ${OL.GREY11};
  border-radius: 5px;
  margin: ${props => (props.margin ? props.margin : '0 0 30px 0')};
  align-self: ${props => (props.alignCenter ? 'center' : 'start')};
`;

export const TableBanner = styled.div`
  width: 100%;
  font-size: 24px;
  color: ${OL.BLACK};
  padding: 40px;
  display: flex;
  align-items: center;
  font-weight: 600;
`;

export const TotalTableItems = styled.div`
  width: 30px;
  height: 20px;
  border-radius: 10px;
  background-color: ${OL.PURPLE03};
  color: ${OL.WHITE};
  margin-left: 10px;
  font-size: 10px;
  padding: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Table = styled.div`
  width: 100%;
  border-collapse: collapse;
  display: table;
`;

export const HeaderElement = styled.span`
  display: table-cell;
  font-size: 10px;
  font-weight: 600;
  font-family: 'Open Sans', sans-serif;
  color: ${props => (props.selected ? OL.PURPLE02 : OL.BLACK)};
  text-transform: uppercase;
  padding: 12px 30px 12px 0;
  border-bottom: 1px solid ${OL.BLACK};
  text-align: left;
  &:hover {
    cursor: pointer;
  }
  &:active {
    color: ${OL.PURPLE03};
  }
`;

export const HeaderRow = styled.div`
  display: table-row;
  border-bottom: 1px solid ${OL.BLACK};
`;

/* Table Row Styles */

const statusColorVariation = getStyleVariation('status', {
  default: OL.GREY02,
  [ENROLLMENT_STATUSES.ACTIVE]: ENROLLMENT_STATUS_COLORS.ACTIVE,
  [ENROLLMENT_STATUSES.ACTIVE_REOPENED]: ENROLLMENT_STATUS_COLORS.ACTIVE_REOPENED,
  [ENROLLMENT_STATUSES.AWAITING_CHECKIN]: ENROLLMENT_STATUS_COLORS.AWAITING_CHECKIN,
  [ENROLLMENT_STATUSES.AWAITING_ORIENTATION]: ENROLLMENT_STATUS_COLORS.AWAITING_ORIENTATION,
  [ENROLLMENT_STATUSES.COMPLETED]: ENROLLMENT_STATUS_COLORS.COMPLETED,
  [ENROLLMENT_STATUSES.JOB_SEARCH]: ENROLLMENT_STATUS_COLORS.JOB_SEARCH,
  [ENROLLMENT_STATUSES.REMOVED_NONCOMPLIANT]: ENROLLMENT_STATUS_COLORS.REMOVED_NONCOMPLIANT,
  [ENROLLMENT_STATUSES.SUCCESSFUL]: ENROLLMENT_STATUS_COLORS.SUCCESSFUL,
  [ENROLLMENT_STATUSES.UNSUCCESSFUL]: ENROLLMENT_STATUS_COLORS.UNSUCCESSFUL,
});

export const Cell = styled.span`
  display: table-cell;
  padding: 7px 30px 7px 0;
  font-family: 'Open Sans', sans-serif;
  font-size: ${props => (props.small ? '12' : '14')}px;
  text-align: left;
  vertical-align: middle;
  color: ${statusColorVariation};
`;

export const Row = styled.div`
  display: table-row;
  padding: 7px 30px;
  border-bottom: 1px solid ${OL.GREY11};
  ${Cell}:first-child {
    padding-left: 30px;
  }
  ${Cell}:last-child {
    padding-right: 30px;
  }
  &:hover {
    cursor: pointer;
    background: ${OL.GREY14};
  }
  &:active {
    background-color: ${OL.PURPLE06};
  }
  :last-of-type {
    border: none;
  }
`;

export const StyledPersonPhoto = styled(PersonPhoto)`
  width: ${props => (props.small ? 30 : 36)}px;
  ${props => (props.small
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
