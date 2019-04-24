/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Constants } from 'lattice';
import Immutable from 'immutable';

import ViolationsParticipantsTableRow from './ViolationsParticipantsTableRow';

import { OL } from '../../utils/constants/Colors';

const { OPENLATTICE_ID_FQN } = Constants;

const TableWrapper = styled.div`
  width: 100%;
  background-color: ${OL.WHITE};
  border: 1px solid ${OL.GREY11};
  border-radius: 5px;
  margin-top: 30px;
`;

const TableBanner = styled.tr`
  width: 100%;
  font-size: 24px;
  color: ${OL.BLACK};
  padding: 40px;
  display: flex;
  align-items: center;
  font-weight: 600;
`;

const TotalParticipants = styled.div`
  width: 30px;
  height: 20px;;
  border-radius: 10px;
  background-color: ${OL.PURPLE03};
  color: ${OL.WHITE};
  margin-left: 10px;
  font-size: 10px;
  padding: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
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
      <HeaderElement>NAME</HeaderElement>
      <HeaderElement># OF VIO.</HeaderElement>
      <HeaderElement>REQ. HRS.</HeaderElement>
    </HeaderRow>
  </>
);

type Props = {
  handleSelect :(person :Immutable.Map, entityKeyId :string, personId :string) => void;
  people :Immutable.List<*, *>;
  selectedPersonId :string;
  small :boolean;
  totalParticipants :number;
};

const ViolationsParticipantsTable = ({
  handleSelect,
  people,
  selectedPersonId,
  small,
  totalParticipants,
} :Props) => (
  <TableWrapper>
    <TableBanner>
      Violations Watch
      <TotalParticipants>{totalParticipants}</TotalParticipants>
    </TableBanner>
    <Table>
      <tbody>
        <Headers />
        {
          people.map((person :Map, index :number) => {
            const personId = person.getIn([OPENLATTICE_ID_FQN, 0], '');
            const selected = personId === selectedPersonId;
            return (
              <ViolationsParticipantsTableRow
                  key={`${personId}-${index}`}
                  handleSelect={handleSelect}
                  person={person}
                  selected={selected}
                  small={small} />
            );
          })
        }
      </tbody>
    </Table>
  </TableWrapper>
);

export default ViolationsParticipantsTable;
