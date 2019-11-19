import styled from 'styled-components';
import {
  Card,
  CardSegment,
  Table,
  StyleUtils,
} from 'lattice-ui-kit';

import { ENROLLMENT_STATUS_COLORS, OL } from '../../../core/style/Colors';
import { ENROLLMENT_STATUSES } from '../../../core/edm/constants/DataModelConsts';

const { getStickyPosition, getStyleVariation } = StyleUtils;

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
}, OL.GREY02);

const shortHeaders = ['AGE', 'SENT. DATE', 'SENT. END DATE', '# OF WARN.', '# OF VIO.', 'HRS. SERVED'];
const widthVariation = getStyleVariation('width', {
  default: 'auto',
  [shortHeaders[0]]: '55px',
  [shortHeaders[1]]: '105px',
  [shortHeaders[2]]: '105px',
  [shortHeaders[3]]: '98px',
  [shortHeaders[4]]: '83px',
  [shortHeaders[5]]: '95px',
}, 'auto');
const whiteSpaceVariation = getStyleVariation('whiteSpace', {
  default: 'normal',
  [shortHeaders[0]]: 'nowrap',
  [shortHeaders[1]]: '105px',
  [shortHeaders[2]]: '105px',
  [shortHeaders[3]]: 'nowrap',
  [shortHeaders[4]]: 'nowrap',
  [shortHeaders[5]]: 'nowrap',
}, 'normal');

const TableCard = styled(Card)`
  & > ${CardSegment} {
    border: none;
  }
`;

const TableHeader = styled(CardSegment)`
  color: ${OL.BLACK};
  font-size: 24px;
  font-weight: 600;
`;

const CustomTable = styled(Table)`
  font-size: 12px;
  color: ${OL.GREY02};
`;

const TableCell = styled.td`
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  padding: 7px 30px 7px 0;
  text-align: left;
  vertical-align: middle;
  word-wrap: break-word;
  color: ${statusColorVariation};
  width: ${widthVariation};
  white-space: ${whiteSpaceVariation};
  ${(props) => props.cellStyle};
`;

const StyledTableRow = styled.tr`
  background-color: ${OL.WHITE};
  border-bottom: 1px solid ${OL.GREY05};
  font-size: 12px;
  color: ${statusColorVariation};
  padding: 7px 30px;

  td,
  th {
    ${getStickyPosition}
  }

  ${TableCell}:first-child {
    padding-left: 30px;
    width: 84px;
    white-space: nowrap;
  }

  ${TableCell}:last-child {
    padding-right: 30px;
  }

  &:hover {
    cursor: pointer;
    background: ${OL.GREY14};
  }

  &:active {
    background-color: ${OL.PURPLE06};
  }
`;

export {
  CustomTable,
  StyledTableRow,
  TableCard,
  TableCell,
  TableHeader,
};
