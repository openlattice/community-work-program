/*
 * @flow
 */
import React from 'react';
import { Constants } from 'lattice';
import Immutable from 'immutable';

import NewParticipantsTableRow from './NewParticipantsTableRow';

import { SENTENCE_TERM_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import {
  TableWrapper,
  TableBanner,
  TotalParticipants,
  Table,
  HeaderRow,
  HeaderElement,
} from './TableStyledComponents';

const { OPENLATTICE_ID_FQN } = Constants;
const { DATETIME_START } = SENTENCE_TERM_FQNS;

const Headers = () => (
  <>
    <HeaderRow>
      <HeaderElement />
      <HeaderElement>NAME</HeaderElement>
      <HeaderElement>SENT. DATE</HeaderElement>
      <HeaderElement>ENROLL. DEADLINE</HeaderElement>
      <HeaderElement>REQ. HRS.</HeaderElement>
    </HeaderRow>
  </>
);

type Props = {
  hoursWorked :Map;
  people :List<*, *>;
  sentenceTerms :Map;
  small :boolean;
  totalParticipants :number;
};

const NewParticipantsTable = ({
  hoursWorked,
  people,
  sentenceTerms,
  small,
  totalParticipants,
} :Props) => (
  <TableWrapper>
    <TableBanner>
      New Participants
      <TotalParticipants>{totalParticipants}</TotalParticipants>
    </TableBanner>
    <Table>
      <tbody>
        <Headers />
        {
          people.map((person :Map) => {
            const personId = person.getIn([OPENLATTICE_ID_FQN, 0], '');
            const sentenceDate = sentenceTerms.getIn([personId, DATETIME_START.toString(), 0]);
            const hours = hoursWorked.get(personId);
            return (
              <NewParticipantsTableRow
                  key={personId}
                  hours={hours}
                  person={person}
                  sentenceDate={sentenceDate}
                  small={small} />
            );
          })
        }
      </tbody>
    </Table>
  </TableWrapper>
);

export default NewParticipantsTable;
