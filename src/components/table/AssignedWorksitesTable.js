/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';

import AssignedWorksitesTableRow from './AssignedWorksitesTableRow';

import {
  TableWrapper,
  Table,
  HeaderRow,
  HeaderElement,
} from './TableStyledComponents';
import { getEntityKeyId } from '../../utils/DataUtils';
import { WORKSITE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const { NAME } = WORKSITE_FQNS;

const WorksiteTableWrapper = styled(TableWrapper)`
  border: none;
`;

type HeaderProps = {
  columnHeaders :string[];
};

const Headers = ({ columnHeaders } :HeaderProps) => (
  <HeaderRow>
    <HeaderElement />
    {
      columnHeaders.map(header => (
        <HeaderElement key={header}>
          { header }
        </HeaderElement>
      ))
    }
  </HeaderRow>
);

type Props = {
  columnHeaders :string[];
  small :boolean;
  tableMargin ? :string;
  worksitePlanStatuses :Map;
  worksitePlans :List;
  worksitesByWorksitePlan :Map;
};

const WorksitesTable = ({
  columnHeaders,
  small,
  tableMargin,
  worksitePlanStatuses,
  worksitePlans,
  worksitesByWorksitePlan,
} :Props) => (
  <WorksiteTableWrapper margin={tableMargin} width="100%">
    <Table>
      <Headers columnHeaders={columnHeaders} />
      {
        worksitePlans.map((worksitePlan :Map) => {
          const worksitePlanEKID :UUID = getEntityKeyId(worksitePlan);
          const worksiteName :string = worksitesByWorksitePlan.getIn([worksitePlanEKID, NAME, 0], '');
          const worksitePlanStatus :Map = worksitePlanStatuses.get(worksitePlanEKID, Map());
          return (
            <AssignedWorksitesTableRow
                key={worksitePlanEKID}
                worksitePlanStatus={worksitePlanStatus}
                worksiteName={worksiteName}
                worksitePlan={worksitePlan}
                small={small} />
          );
        })
      }
    </Table>
  </WorksiteTableWrapper>
);

WorksitesTable.defaultProps = {
  tableMargin: '0 0 30px 0',
};

export default WorksitesTable;
