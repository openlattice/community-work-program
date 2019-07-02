/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import {
  Cell,
  Row,
} from './TableStyledComponents';
// import { formatValue, formatNumericalValue } from '../../utils/FormattingUtils';
import { formatAsDate } from '../../utils/DateTimeUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { WORKSITE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const { DATETIME_END, DATETIME_START, NAME } = WORKSITE_FQNS;

type Props = {
  worksite :Map,
  selectWorksite :(selectedWorksite :Map) => void;
  small? :boolean,
};

const WorksitesCell = styled(Cell)`
  padding: 12px 30px 12px 0;
`;

const TableRow = ({
  worksite,
  selectWorksite,
  small
} :Props) => {

  const scheduledParticipantCount = '';
  const pastParticipantCount = '';
  const totalHours = '';

  const {
    [DATETIME_END]: endDateTime,
    [DATETIME_START]: startDateTime,
    [NAME]: worksiteName
  } = getEntityProperties(worksite, [DATETIME_END, DATETIME_START, NAME]);

  const startDate = startDateTime ? formatAsDate(startDateTime) : '';
  const status = (startDateTime && !endDateTime) ? 'Active' : 'Inactive';

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
  small: false
};

export default TableRow;
