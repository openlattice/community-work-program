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

const HEADERS_TO_CUSTOMIZE = {
  AGE: 'AGE',
  SENT_DATE: 'SENT. DATE',
  SENT_END_DATE: 'SENT. END DATE',
  NUM_OF_WARN: '# OF WARN.',
  NUM_OF_VIO: '# OF VIO.',
  HRS_SERVED: 'HRS. SERVED',
  REQ_HRS: 'REQ. HRS.',
  SCHED_PARTIC: 'SCHED. PARTIC.',
  PAST_PARTIC: 'PAST PARTIC.',
  TOTAL_HOURS: 'TOTAL HOURS',
  COURT_TYPE: 'COURT TYPE',
  CHECK_IN_DEADLINE: 'CHECK-IN DEADLINE',
};
const widthVariation = getStyleVariation('width', {
  default: 'auto',
  [HEADERS_TO_CUSTOMIZE.AGE]: '55px',
  [HEADERS_TO_CUSTOMIZE.SENT_DATE]: '95px',
  [HEADERS_TO_CUSTOMIZE.SENT_END_DATE]: '95px',
  [HEADERS_TO_CUSTOMIZE.NUM_OF_WARN]: '80px',
  [HEADERS_TO_CUSTOMIZE.NUM_OF_VIO]: '70px',
  [HEADERS_TO_CUSTOMIZE.HRS_SERVED]: '95px',
  [HEADERS_TO_CUSTOMIZE.REQ_HRS]: '70px',
  [HEADERS_TO_CUSTOMIZE.SCHED_PARTIC]: '130px',
  [HEADERS_TO_CUSTOMIZE.PAST_PARTIC]: '130px',
  [HEADERS_TO_CUSTOMIZE.TOTAL_HOURS]: '130px',
  [HEADERS_TO_CUSTOMIZE.COURT_TYPE]: '110px',
  [HEADERS_TO_CUSTOMIZE.CHECK_IN_DEADLINE]: '95px',
}, 'auto');
const whiteSpaceVariation = getStyleVariation('whiteSpace', {
  default: 'normal',
  [HEADERS_TO_CUSTOMIZE.AGE]: 'nowrap',
  [HEADERS_TO_CUSTOMIZE.SENT_DATE]: 'nowrap',
  [HEADERS_TO_CUSTOMIZE.SENT_END_DATE]: 'nowrap',
  [HEADERS_TO_CUSTOMIZE.NUM_OF_WARN]: 'nowrap',
  [HEADERS_TO_CUSTOMIZE.NUM_OF_VIO]: 'nowrap',
  [HEADERS_TO_CUSTOMIZE.HRS_SERVED]: 'nowrap',
  [HEADERS_TO_CUSTOMIZE.REQ_HRS]: 'nowrap',
  [HEADERS_TO_CUSTOMIZE.SCHED_PARTIC]: 'nowrap',
  [HEADERS_TO_CUSTOMIZE.PAST_PARTIC]: 'nowrap',
  [HEADERS_TO_CUSTOMIZE.TOTAL_HOURS]: 'nowrap',
  [HEADERS_TO_CUSTOMIZE.COURT_TYPE]: 'nowrap',
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
  TableName,
};
