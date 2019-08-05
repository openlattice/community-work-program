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
  worksitesByWorksitePlan :Map;
  worksitePlans :List;
  small :boolean;
  tableMargin ? :string;
};

const WorksitesTable = ({
  columnHeaders,
  worksitesByWorksitePlan,
  worksitePlans,
  small,
  tableMargin,
} :Props) => (
  <WorksiteTableWrapper margin={tableMargin} width="100%">
    <Table>
      <Headers columnHeaders={columnHeaders} />
      {
        worksitePlans.map((worksitePlan :Map) => {
          const worksitePlanEKID :UUID = getEntityKeyId(worksitePlan);
          const worksiteName :string = worksitesByWorksitePlan.getIn([worksitePlanEKID, NAME, 0], '');
          return (
            <AssignedWorksitesTableRow
                key={worksitePlanEKID}
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
