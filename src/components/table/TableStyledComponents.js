// @flow
import styled from 'styled-components';

import { OL } from '../../core/style/Colors';
import { PersonPhoto } from '../picture/PersonPicture';

/* Table Styles */

export const TableWrapper = styled.div`
  width: ${props => (props.width ? props.width : '600')}px;
  background-color: ${OL.WHITE};
  border: 1px solid ${OL.GREY11};
  border-radius: 5px;
  margin-bottom: 30px;
  align-self: ${props => (props.align ? props.align : 'start')};
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
  color: ${OL.BLACK};
  text-transform: uppercase;
  padding: 12px 0;
  border-bottom: 1px solid ${OL.BLACK};
  text-align: left;
`;

export const HeaderRow = styled.div`
  display: table-row;
  border-bottom: 1px solid ${OL.BLACK};
`;

/* Table Row Styles */

export const Cell = styled.span`
  display: table-cell;
  padding: 7px 0;
  font-family: 'Open Sans', sans-serif;
  font-size: ${props => (props.small ? '12' : '14')}px;
  text-align: left;
  vertical-align: middle;
  color: ${(props) => {
    if (props.status === 'Active') {
      return `${OL.GREEN02};`;
    }
    if (props.status === 'Completed') {
      return `${OL.BLUE02};`;
    }
    if (props.status === 'Active — noncompliant') {
      return `${OL.YELLOW01};`;
    }
    if (props.status === 'Removed — noncompliant') {
      return `${OL.RED01};`;
    }
    if (props.status === 'Awaiting enrollment') {
      return `${OL.PURPLE03};`;
    }
    return `${OL.GREY02};`;
  }}
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
