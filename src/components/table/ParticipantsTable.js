/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Constants } from 'lattice';
import Immutable from 'immutable';

import ParticipantsTableRow from './ParticipantsTableRow';

import { OL } from '../../utils/constants/Colors';

const { OPENLATTICE_ID_FQN } = Constants;

const TableWrapper = styled.div`
  width: 100%;
  margin-bottom: 15px;
  background-color: ${OL.WHITE};
  border: 1px solid ${OL.GREY08};
  border-radius: 5px;
`;

const TableBanner = styled.tr`
  width: 100%;
  font-size: 24px;
  color: ${OL.BLACK};
  padding: 40px 80px;
  display: flex;
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
      <HeaderElement>AGE</HeaderElement>
      <HeaderElement>START DATE</HeaderElement>
      <HeaderElement>SENT. DATE</HeaderElement>
      <HeaderElement>SENT. END DATE</HeaderElement>
      <HeaderElement>STATUS</HeaderElement>
      <HeaderElement>HRS. SERVED</HeaderElement>
      <HeaderElement># OF WARN.</HeaderElement>
      <HeaderElement># OF VIO.</HeaderElement>
    </HeaderRow>
  </>
);

type Props = {
  contactInfo :Immutable.List<*, *>;
  handleSelect :(person :Immutable.Map, entityKeyId :string, personId :string) => void;
  people :Immutable.List<*, *>;
  selectPerson :(selectedPerson :Immutable.Map) => void;
  selectedPersonId :string;
  small :boolean;
  totalParticipants :number;
};

const ParticipantsTable = ({
  contactInfo,
  handleSelect,
  people,
  selectPerson,
  selectedPersonId,
  small,
  totalParticipants,
} :Props) => (
  <TableWrapper>
    <TableBanner>{totalParticipants.toString().concat(' Participants')}</TableBanner>
    <Table>
      <tbody>
        <Headers />
        {
          people.map((person :Map, index :number) => {
            const personId = person.getIn([OPENLATTICE_ID_FQN, 0], '');
            const selected = personId === selectedPersonId;
            const contact = contactInfo.find(value => value.get('personId') === person.get('personId'));
            return (
              <ParticipantsTableRow
                  key={`${personId}-${index}`}
                  contactInfo={contact}
                  handleSelect={handleSelect}
                  person={person}
                  selectPerson={selectPerson}
                  selected={selected}
                  small={small} />
            );
          })
        }
      </tbody>
    </Table>
  </TableWrapper>
);

export default ParticipantsTable;
