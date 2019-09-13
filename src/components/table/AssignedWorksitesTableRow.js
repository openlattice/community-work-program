/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { StyleUtils } from 'lattice-ui-kit';

import { Cell, Row } from './TableStyledComponents';
import { getEntityProperties } from '../../utils/DataUtils';
import { WORKSITE_PLAN_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { WORKSITE_ENROLLMENT_STATUSES } from '../../core/edm/constants/DataModelConsts';
import { ENROLLMENT_STATUS_COLORS, OL } from '../../core/style/Colors';

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

const WorksitesCell = styled(Cell)`
  padding: 12px 30px 12px 0;
`;

const Status = styled.div`
  color: ${statusColorVariation};
`;

type Props = {
  worksiteName :string,
  worksitePlan :Map;
  small ? :boolean,
  status :string;
};

const TableRow = ({
  worksiteName,
  worksitePlan,
  small,
  status,
} :Props) => {

  const {
    [HOURS_WORKED]: hoursWorked,
    [REQUIRED_HOURS]: requiredHours
  } = getEntityProperties(worksitePlan, [HOURS_WORKED, REQUIRED_HOURS]);

  return (
    <Row>
      <WorksitesCell small={small} />
      <WorksitesCell small={small}>{ worksiteName }</WorksitesCell>
      <WorksitesCell small={small}>{ hoursWorked }</WorksitesCell>
      <WorksitesCell small={small}>{ requiredHours }</WorksitesCell>
      <WorksitesCell small={small}>
        <Status statusType={status}>{ status }</Status>
      </WorksitesCell>
    </Row>
  );
};

TableRow.defaultProps = {
  small: false,
};

export default TableRow;
