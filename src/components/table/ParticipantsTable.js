/*
 * @flow
 */
import React from 'react';
import { Map, List } from 'immutable';

import ParticipantsTableRow from './ParticipantsTableRow';

import { getEntityProperties } from '../../utils/DataUtils';
import { isDefined } from '../../utils/LangUtils';
import {
  TableWrapper,
  TableBanner,
  TotalTableItems,
  Table,
  HeaderRow,
  HeaderElement,
} from './TableStyledComponents';
import { ENTITY_KEY_ID, SENTENCE_TERM_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { HOURS_CONSTS } from '../../core/edm/constants/DataModelConsts';

const { DATETIME_START } = SENTENCE_TERM_FQNS;
const { REQUIRED, WORKED } = HOURS_CONSTS;

type HeaderProps = {
  columnHeaders :string[];
};

const Headers = ({ columnHeaders } :HeaderProps) => (
  <>
    <HeaderRow>
      <HeaderElement />
      {
        columnHeaders.map(header => (
          <HeaderElement key={header}>{ header }</HeaderElement>
        ))
      }
    </HeaderRow>
  </>
);

type Props = {
  bannerText :string;
  columnHeaders :string[];
  hours ? :Map;
  includeDeadline ? :boolean;
  onlyReqHours :boolean;
  people :List;
  sentenceTerms ? :Map;
  small :boolean;
  totalTableItems :number;
  violations ? :Map;
};

const ParticipantsTable = ({
  bannerText,
  columnHeaders,
  hours,
  includeDeadline,
  onlyReqHours,
  people,
  sentenceTerms,
  small,
  totalTableItems,
  violations,
} :Props) => (
  <TableWrapper>
    <TableBanner>
      { bannerText }
      <TotalTableItems>{ totalTableItems }</TotalTableItems>
    </TableBanner>
    <Table>
      <Headers columnHeaders={columnHeaders} />
      {
        people.map((person :Map) => {

          const { [ENTITY_KEY_ID]: personEntityKeyId } :UUID = getEntityProperties(person, [ENTITY_KEY_ID]);
          const sentenceDate = (isDefined(sentenceTerms) && sentenceTerms.count() > 0) ? sentenceTerms
            .getIn([personEntityKeyId, DATETIME_START, 0]) : '';
          const violationsCount = (isDefined(violations) && violations.count() > 0) ? violations
            .get(personEntityKeyId) : 0;

          const personHours = (isDefined(hours) && hours.count() > 0) ? hours.get(personEntityKeyId) : Map();
          const required = (isDefined(personHours) && personHours.count() > 0) ? personHours.get(REQUIRED) : 0;
          const hoursWorked = (isDefined(personHours) && personHours.count() > 0) ? personHours.get(WORKED) : 0;
          const worked = onlyReqHours ? undefined : hoursWorked;

          return (
            <ParticipantsTableRow
                key={personEntityKeyId}
                hoursRequired={required}
                hoursWorked={worked}
                includeDeadline={includeDeadline}
                person={person}
                sentenceDate={sentenceDate}
                small={small}
                violationsCount={violationsCount} />
          );
        })
      }
    </Table>
  </TableWrapper>
);

ParticipantsTable.defaultProps = {
  hours: Map(),
  includeDeadline: false,
  sentenceTerms: Map(),
  violations: Map(),
};

export default ParticipantsTable;
