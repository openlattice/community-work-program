/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import { Cell, Row } from './TableStyledComponents';
import { formatNumericalValue } from '../../utils/FormattingUtils';
import { formatAsDate } from '../../utils/DateTimeUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { WORKSITE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { WORKSITE_INFO_CONSTS } from '../../containers/worksites/WorksitesConstants';

const { DATETIME_END, DATETIME_START, NAME } = WORKSITE_FQNS;
const { PAST, SCHEDULED, TOTAL_HOURS } = WORKSITE_INFO_CONSTS;

type Props = {
  worksite :Map,
  worksiteInfo :Map;
  selectWorksite ? :(selectedWorksite :Map) => void;
  small? :boolean,
};

const WorksitesCell = styled(Cell)`
  padding: 12px 30px 12px 0;
`;

const TableRow = ({
  worksite,
  worksiteInfo,
  selectWorksite,
  small
} :Props) => {

  const {
    [DATETIME_END]: endDateTime,
    [DATETIME_START]: startDateTime,
    [NAME]: worksiteName
  } = getEntityProperties(worksite, [DATETIME_END, DATETIME_START, NAME]);

  const startDate = startDateTime ? formatAsDate(startDateTime) : '';
  const status = (startDateTime && !endDateTime) ? 'Active' : 'Inactive';
  const scheduledParticipantCount = (worksiteInfo && worksiteInfo.get(SCHEDULED))
    ? formatNumericalValue(worksiteInfo.get(SCHEDULED))
    : formatNumericalValue(0);
  const pastParticipantCount = (worksiteInfo && worksiteInfo.get(PAST))
    ? formatNumericalValue(worksiteInfo.get(PAST))
    : formatNumericalValue(0);
  const totalHours = (worksiteInfo && worksiteInfo.get(TOTAL_HOURS))
    ? formatNumericalValue(worksiteInfo.get(TOTAL_HOURS))
    : formatNumericalValue(0);

  return (
    <Row
        onClick={() => {
          if (selectWorksite) {
            selectWorksite(worksite);
          }
        }}>
      <WorksitesCell small={small} />
      <WorksitesCell small={small}>{ worksiteName }</WorksitesCell>
      <WorksitesCell small={small} status={status}>{ status }</WorksitesCell>
      <WorksitesCell small={small}>{ startDate }</WorksitesCell>
      <WorksitesCell small={small}>{ scheduledParticipantCount }</WorksitesCell>
      <WorksitesCell small={small}>{ pastParticipantCount }</WorksitesCell>
      <WorksitesCell small={small}>{ totalHours }</WorksitesCell>
    </Row>
  );
};

TableRow.defaultProps = {
  selectWorksite: () => {},
  small: false
};

export default TableRow;
