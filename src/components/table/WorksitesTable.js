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
  config :Object;
  worksites :List;
  worksitesInfo :Map;
  selectWorksite ? :(selectedWorksite :Map) => void;
  small :boolean;
  tableMargin ? :string;
};

const WorksitesTable = ({
  columnHeaders,
  config,
  worksites,
  worksitesInfo,
  selectWorksite,
  small,
  tableMargin,
} :Props) => (
  <WorksiteTableWrapper margin={tableMargin} width="100%">
    <Table>
      <Headers columnHeaders={columnHeaders} />
      {
        worksites.map((worksite :Map) => {
          const worksiteEKID :UUID = getEntityKeyId(worksite);
          const worksiteInfo :Map = worksitesInfo.get(worksiteEKID);
          return (
            <WorksitesTableRow
                key={worksiteEKID}
                config={config}
                worksite={worksite}
                worksiteInfo={worksiteInfo}
                selectWorksite={selectWorksite}
                small={small} />
          );
        })
      }
    </Table>
  </WorksiteTableWrapper>
);

WorksitesTable.defaultProps = {
  selectWorksite: () => {},
  tableMargin: '0 0 30px 0',
};

export default WorksitesTable;
