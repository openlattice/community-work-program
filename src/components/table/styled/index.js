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
  Inactive: ENROLLMENT_STATUS_COLORS.UNSUCCESSFUL,
}, OL.GREY02);

const headersToCustomize = [
  'AGE',
  'SENT. DATE',
  'SENT. END DATE',
  '# OF WARN.',
  '# OF VIO.',
  'HRS. SERVED',
  'REQ. HRS.',
  'SCHED. PARTIC.',
  'PAST PARTIC.',
  'TOTAL HOURS'
];
const widthVariation = getStyleVariation('width', {
  default: 'auto',
  [headersToCustomize[0]]: '55px',
  [headersToCustomize[1]]: '105px',
  [headersToCustomize[2]]: '105px',
  [headersToCustomize[3]]: '98px',
  [headersToCustomize[4]]: '83px',
  [headersToCustomize[5]]: '95px',
  [headersToCustomize[6]]: '95px',
  [headersToCustomize[7]]: '130px',
  [headersToCustomize[8]]: '130px',
  [headersToCustomize[9]]: '130px',
}, 'auto');
const whiteSpaceVariation = getStyleVariation('whiteSpace', {
  default: 'normal',
  [headersToCustomize[0]]: 'nowrap',
  [headersToCustomize[1]]: '105px',
  [headersToCustomize[2]]: '105px',
  [headersToCustomize[3]]: 'nowrap',
  [headersToCustomize[4]]: 'nowrap',
  [headersToCustomize[5]]: 'nowrap',
  [headersToCustomize[6]]: 'nowrap',
  [headersToCustomize[7]]: 'nowrap',
  [headersToCustomize[8]]: 'nowrap',
  [headersToCustomize[9]]: 'nowrap',
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
  align-items: center;
`;

const TableName = styled.div`
  margin-right: 10px;
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

  :first-child {
    padding-left: 30px;
    width: 84px;
    white-space: nowrap;
  }

  :last-child {
    padding-right: 30px;
  }
`;

const StyledTableRow = styled.tr`
  background-color: ${OL.WHITE};
  border-bottom: 1px solid ${OL.GREY05};
  font-size: 12px;
  color: ${statusColorVariation};
  padding: 7px 30px;

  :last-of-type {
    border-bottom: none;
  }

  td,
  th {
    ${getStickyPosition}
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
  TableName,
};
