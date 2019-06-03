/*
 * @flow
 */
import React from 'react';
import { Map, List } from 'immutable';

import ViolationsParticipantsTableRow from './ViolationsParticipantsTableRow';

import { ENTITY_KEY_ID } from '../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties } from '../../utils/DataUtils';
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
  people :List;
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
            const { [ENTITY_KEY_ID]: personEntityKeyId } :UUID = getEntityProperties(person, [ENTITY_KEY_ID]);
            const violationsCount = violations ? violations.get(personEntityKeyId) : 0;
            const hours = hoursWorked.get(personEntityKeyId);
            return (
              <ViolationsParticipantsTableRow
                  key={personEntityKeyId}
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
