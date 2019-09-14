/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { EditButton, StyleUtils } from 'lattice-ui-kit';

import { Cell, Row } from './TableStyledComponents';
import { getEntityProperties } from '../../utils/DataUtils';
import { ENROLLMENT_STATUS_FQNS, WORKSITE_PLAN_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { WORKSITE_ENROLLMENT_STATUSES } from '../../core/edm/constants/DataModelConsts';
import { ENROLLMENT_STATUS_COLORS, OL } from '../../core/style/Colors';

const { STATUS } = ENROLLMENT_STATUS_FQNS;
const { HOURS_WORKED, REQUIRED_HOURS } = WORKSITE_PLAN_FQNS;

const { getStyleVariation } = StyleUtils;
const statusColorVariation = getStyleVariation('statusType', {
  default: OL.GREY02,
  [WORKSITE_ENROLLMENT_STATUSES.ACTIVE]: ENROLLMENT_STATUS_COLORS.ACTIVE,
  [WORKSITE_ENROLLMENT_STATUSES.CANCELED]: OL.GREY01,
  [WORKSITE_ENROLLMENT_STATUSES.COMPLETED]: ENROLLMENT_STATUS_COLORS.SUCCESSFULLY_COMPLETED,
  [WORKSITE_ENROLLMENT_STATUSES.ON_HOLD]: OL.YELLOW01,
  [WORKSITE_ENROLLMENT_STATUSES.PLANNED]: ENROLLMENT_STATUS_COLORS.AWAITING_CHECKIN,
});

const WorksitesRow = styled(Row)`
  &:hover {
    cursor: default;
    background: ${OL.WHITE};
  }
  &:active {
    background-color: ${OL.WHITE};
  }
`;

const WorksitesCell = styled(Cell)`
  padding: 12px 30px 12px 0;
`;

const Status = styled.div`
  color: ${statusColorVariation};
`;

const ButtonCell = styled(Cell)`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding-right: 30px;
`;

type Props = {
  worksiteName :string,
  worksitePlan :Map;
  small ? :boolean,
  worksitePlanStatus :Map;
};

const TableRow = ({
  worksiteName,
  worksitePlan,
  small,
  worksitePlanStatus,
} :Props) => {

  const {
    [HOURS_WORKED]: hoursWorked,
    [REQUIRED_HOURS]: requiredHours
  } = getEntityProperties(worksitePlan, [HOURS_WORKED, REQUIRED_HOURS]);
  const { [STATUS]: status } = getEntityProperties(worksitePlanStatus, [STATUS]);
  return (
    <WorksitesRow>
      <WorksitesCell small={small} />
      <WorksitesCell small={small}>{ worksiteName }</WorksitesCell>
      <WorksitesCell small={small}>{ hoursWorked }</WorksitesCell>
      <WorksitesCell small={small}>{ requiredHours }</WorksitesCell>
      <ButtonCell small={small}>
        <Status statusType={status}>{ status }</Status>
        <EditButton onClick={() => {}} />
      </ButtonCell>
    </WorksitesRow>
  );
};

TableRow.defaultProps = {
  small: false,
};

export default TableRow;
