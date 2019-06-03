/*
 * @flow
 */
import React from 'react';
import { Constants } from 'lattice';
import { Map, List } from 'immutable';

import ViolationsParticipantsTableRow from './ViolationsParticipantsTableRow';


const { OPENLATTICE_ID_FQN } = Constants;

import {
  TableWrapper,
  TableBanner,
  TotalParticipants,
  Table,
  HeaderRow,
  HeaderElement,
} from './TableStyledComponents';

const Headers = () => (
  <>
    <HeaderRow>
      <HeaderElement />
      <HeaderElement>NAME</HeaderElement>
      <HeaderElement># OF VIO.</HeaderElement>
      <HeaderElement>HRS. SERVED</HeaderElement>
    </HeaderRow>
  </>
);

type Props = {
  hoursWorked :Map;
  people :List<*, *>;
  small :boolean;
  totalParticipants :number;
  violations :Map;
};

const ViolationsParticipantsTable = ({
  hoursWorked,
  people,
  small,
  totalParticipants,
  violations,
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
          people.map((person :Map) => {
            const personId = person.getIn([OPENLATTICE_ID_FQN, 0], '');
            const violationsCount = violations ? violations.get(personId) : 0;
            const hours = hoursWorked.get(personId);
            return (
              <ViolationsParticipantsTableRow
                  key={personId}
                  hours={hours}
                  person={person}
                  small={small}
                  violationsCount={violationsCount} />
            );
          })
        }
      </tbody>
    </Table>
  </TableWrapper>
);

export default ViolationsParticipantsTable;
