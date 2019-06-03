/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Constants } from 'lattice';
import Immutable from 'immutable';

import PendingReviewParticipantsTableRow from './PendingReviewParticipantsTableRow';

import { SENTENCE_TERM_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { OL } from '../../utils/constants/Colors';

const { OPENLATTICE_ID_FQN } = Constants;
const { DATETIME_START } = SENTENCE_TERM_FQNS;

const TableWrapper = styled.div`
  width: 100%;
  background-color: ${OL.WHITE};
  border: 1px solid ${OL.GREY11};
  border-radius: 5px;
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
      <HeaderElement>SENT. DATE</HeaderElement>
      <HeaderElement>REQ. HRS.</HeaderElement>
    </HeaderRow>
  </>
);

type Props = {
  handleSelect :(person :Immutable.Map, entityKeyId :string, personId :string) => void;
  hoursWorked :Map;
  people :Immutable.List<*, *>;
  selectedPersonId :string;
  small :boolean;
  sentenceTerms :Map;
  totalParticipants :number;
};

const PendingReviewParticipantsTable = ({
  handleSelect,
  hoursWorked,
  people,
  sentenceTerms,
  selectedPersonId,
  small,
  totalParticipants,
} :Props) => (
  <TableWrapper>
    <TableBanner>
      Pending Completion Review
      <TotalParticipants>{totalParticipants}</TotalParticipants>
    </TableBanner>
    <Table>
      <tbody>
        <Headers />
        {
          people.map((person :Map, index :number) => {
            const personId = person.getIn([OPENLATTICE_ID_FQN, 0], '');
            const selected = personId === selectedPersonId;
            const sentenceDate = sentenceTerms.getIn([personId, DATETIME_START.toString(), 0]);
            const hours = hoursWorked.get(personId);
            return (
              <PendingReviewParticipantsTableRow
                  key={`${personId}-${index}`}
                  handleSelect={handleSelect}
                  hours={hours}
                  person={person}
                  selected={selected}
                  sentenceDate={sentenceDate}
                  small={small} />
            );
          })
        }
      </tbody>
    </Table>
  </TableWrapper>
);

export default PendingReviewParticipantsTable;
