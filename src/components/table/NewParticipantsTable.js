/*
 * @flow
 */
import React from 'react';
import { Map, List } from 'immutable';

import NewParticipantsTableRow from './NewParticipantsTableRow';

import { ENTITY_KEY_ID, SENTENCE_TERM_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties } from '../../utils/DataUtils';
import {
  TableWrapper,
  TableBanner,
  TotalParticipants,
  Table,
  HeaderRow,
  HeaderElement,
} from './TableStyledComponents';

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
  people :List;
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
            const { [ENTITY_KEY_ID]: personEntityKeyId } = getEntityProperties(person, [ENTITY_KEY_ID]);
            const sentenceDate = sentenceTerms ? sentenceTerms
              .getIn([personEntityKeyId, DATETIME_START.toString(), 0]) : '';
            const hours = hoursWorked ? hoursWorked.get(personEntityKeyId) : '';
            return (
              <NewParticipantsTableRow
                  key={personEntityKeyId}
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
