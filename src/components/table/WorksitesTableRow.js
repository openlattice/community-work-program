/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';

import { Cell, Row } from './TableStyledComponents';
import { formatImmutableValue } from '../../utils/FormattingUtils';
import { formatAsDate } from '../../utils/DateTimeUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { isDefined } from '../../utils/LangUtils';
import { WORKSITE_FQNS, WORKSITE_PLAN_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { WORKSITE_INFO_CONSTS } from '../../containers/worksites/WorksitesConstants';

const { DATETIME_END, DATETIME_START, NAME } = WORKSITE_FQNS;
const { HOURS_WORKED, REQUIRED_HOURS } = WORKSITE_PLAN_FQNS;
const { PAST, SCHEDULED, TOTAL_HOURS } = WORKSITE_INFO_CONSTS;

type Props = {
  config :Object;
  selectWorksite ? :(selectedWorksite :Map) => void;
  small ? :boolean,
  worksite :Map,
  worksiteInfo ? :Map;
  worksitePlan ? :Map;
};

const WorksitesCell = styled(Cell)`
  padding: 12px 30px 12px 0;
`;

const TableRow = ({
  config,
  selectWorksite,
  small,
  worksite,
  worksiteInfo,
  worksitePlan,
} :Props) => {

  let cellData :List = List();
  const { includeCounts, includeStartDate, includeStatus } = config;

  const scheduledParticipantCount = formatImmutableValue(worksiteInfo, SCHEDULED, 0);
  const pastParticipantCount = formatImmutableValue(worksiteInfo, PAST, 0);
  const totalHours = formatImmutableValue(worksiteInfo, TOTAL_HOURS, 0);

  const hoursWorked = isDefined(worksitePlan) ? formatImmutableValue(worksitePlan, HOURS_WORKED, 0) : '';
  const requiredHours = isDefined(worksitePlan) ? formatImmutableValue(worksitePlan, REQUIRED_HOURS, 0) : '';
  const hoursServed = `${hoursWorked} / ${requiredHours}`;

  if (isDefined(worksite)) {

    const {
      [DATETIME_END]: endDateTime,
      [DATETIME_START]: startDateTime,
      [NAME]: worksiteName
    } = getEntityProperties(worksite, [DATETIME_END, DATETIME_START, NAME]);

    const startDate = formatAsDate(startDateTime);
    const status = (startDateTime && !endDateTime) ? 'Active' : 'Inactive';

    cellData = List().withMutations((list :List) => {
      list.push('');
      if (isDefined(worksiteName)) list.push(worksiteName);
      if (includeStatus) list.push(status);
      if (includeStartDate) list.push(startDate);
      if (includeCounts) list.push(scheduledParticipantCount);
      if (includeCounts) list.push(pastParticipantCount);
      if (includeCounts) list.push(totalHours);
      if (isDefined(worksitePlan)) list.push(hoursServed);
    });
  }

  return (
    <Row
        onClick={() => {
          if (selectWorksite) {
            selectWorksite(worksite);
          }
        }}>
      {
        cellData.map((field :string, index :number) => (
          <WorksitesCell key={`${index}-${field}`} small={small} status={field}>{ field }</WorksitesCell>
        ))
      }
    </Row>
  );
};

TableRow.defaultProps = {
  selectWorksite: () => {},
  small: false,
  worksiteInfo: undefined,
  worksitePlan: undefined,
};

export default TableRow;
