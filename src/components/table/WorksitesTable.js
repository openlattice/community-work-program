/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Constants } from 'lattice';
import Immutable from 'immutable';

import WorksitesTableRow from './WorksitesTableRow';

import { OL } from '../../core/style/Colors';

const { OPENLATTICE_ID_FQN } = Constants;

const TableWrapper = styled.div`
  width: 100%;
  margin-bottom: ${props => props.margin}px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const HeaderRow = styled.tr`
  border-bottom: 1px solid ${OL.BLACK};
`;

const HeaderElement = styled.th`
  font-size: 10px;
  font-weight: 600;
  font-family: 'Open Sans', sans-serif;
  color: ${OL.BLACK};
  text-transform: uppercase;
  padding: 12px 0;
  border-bottom: 1px solid ${OL.BLACK};
  text-align: left;
`;

const Headers = () => (
  <>
    <HeaderRow>
      <HeaderElement />
      <HeaderElement>WORKSITE NAME</HeaderElement>
      <HeaderElement>STATUS</HeaderElement>
      <HeaderElement>START DATE</HeaderElement>
      <HeaderElement>LAST ACTIVE DATE</HeaderElement>
      <HeaderElement>SCHED. PARTIC.</HeaderElement>
      <HeaderElement>PAST PARTIC.</HeaderElement>
      <HeaderElement>TOTAL HOURS</HeaderElement>
    </HeaderRow>
  </>
);

type Props = {
  handleSelect :(worksite :Immutable.Map, entityKeyId :string, personId :string) => void;
  worksites :Immutable.List<*, *>;
  selectWorksite :(selectedWorksite :Immutable.Map) => void;
  selectedWorksiteId :string;
  small :boolean;
  tableMargin :string;
};

const WorksitesTable = ({
  handleSelect,
  worksites,
  selectWorksite,
  selectedWorksiteId,
  small,
  tableMargin,
} :Props) => (
  <TableWrapper margin={tableMargin}>
    <Table>
      <tbody>
        <Headers />
        {
          worksites.map((worksite :Immutable.Map, index :number) => {
            const worksiteId = worksite.getIn([OPENLATTICE_ID_FQN, 0], '');
            const selected = worksiteId === selectedWorksiteId;
            return (
              <WorksitesTableRow
                  key={`${worksiteId}-${index}`}
                  handleSelect={handleSelect}
                  worksite={worksite}
                  selectWorksite={selectWorksite}
                  selected={selected}
                  small={small} />
            );
          })
        }
      </tbody>
    </Table>
  </TableWrapper>
);

export default WorksitesTable;
