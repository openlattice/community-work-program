/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';

import WorksitesTableRow from './WorksitesTableRow';

import {
  TableWrapper,
  Table,
  HeaderRow,
  HeaderElement,
} from './TableStyledComponents';
import { getEntityKeyId } from '../../utils/DataUtils';

const WorksiteTableWrapper = styled(TableWrapper)`
  border: none;
`;

type HeaderProps = {
  columnHeaders :string[];
};

const Headers = ({ columnHeaders } :HeaderProps) => (
  <>
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
  </>
);

type Props = {
  columnHeaders :string[];
  worksites :List;
  selectWorksite :(selectedWorksite :Map) => void;
  small :boolean;
  tableMargin :string;
};

const WorksitesTable = ({
  columnHeaders,
  worksites,
  selectWorksite,
  small,
  tableMargin,
} :Props) => (
  <WorksiteTableWrapper margin={tableMargin}>
    <Table>
      <Headers columnHeaders={columnHeaders} />
      {
        worksites.map((worksite :Map) => {
          const worksiteEKID :UUID = getEntityKeyId(worksite);
          return (
            <WorksitesTableRow
                key={worksiteEKID}
                worksite={worksite}
                selectWorksite={selectWorksite}
                small={small} />
          );
        })
      }
    </Table>
  </WorksiteTableWrapper>
);

export default WorksitesTable;
