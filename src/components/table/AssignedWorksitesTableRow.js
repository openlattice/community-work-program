/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import { Cell, Row } from './TableStyledComponents';
import { getEntityProperties } from '../../utils/DataUtils';
import { WORKSITE_PLAN_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const { HOURS_WORKED, REQUIRED_HOURS } = WORKSITE_PLAN_FQNS;

type Props = {
  worksiteName :string,
  worksitePlan :Map;
  small ? :boolean,
};

const WorksitesCell = styled(Cell)`
  padding: 12px 30px 12px 0;
`;

const TableRow = ({
  worksiteName,
  worksitePlan,
  small
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
    </Row>
  );
};

TableRow.defaultProps = {
  small: false,
};

export default TableRow;
