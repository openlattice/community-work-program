/*
 * @flow
 */
import React from 'react';
import { Map, List } from 'immutable';
import { DateTime } from 'luxon';

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
import {
  ENROLLMENT_STATUS_FQNS,
  ENTITY_KEY_ID,
  SENTENCE_TERM_FQNS
} from '../../core/edm/constants/FullyQualifiedNames';
import { HOURS_CONSTS } from '../../core/edm/constants/DataModelConsts';

const { EFFECTIVE_DATE, STATUS } = ENROLLMENT_STATUS_FQNS;
const { REQUIRED, WORKED } = HOURS_CONSTS;
const { DATETIME_START } = SENTENCE_TERM_FQNS;

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
  ageRequired :boolean;
  bannerText :string;
  columnHeaders :string[];
  enrollment ? :Map;
  handleSelect :(personEKID :string) => void;
  hours ? :Map;
  includeDeadline ? :boolean;
  includeSentenceEndDate ? :boolean;
  onlyReqHours :boolean;
  people :List;
  sentenceTerms ? :Map;
  small :boolean;
  styles ? :Object;
  totalTableItems :number;
  violations ? :Map;
  warnings ? :Map;
};

const ParticipantsTable = ({
  ageRequired,
  bannerText,
  columnHeaders,
  enrollment,
  handleSelect,
  hours,
  includeDeadline,
  includeSentenceEndDate,
  onlyReqHours,
  people,
  sentenceTerms,
  small,
  styles,
  totalTableItems,
  violations,
  warnings,
} :Props) => (
  <TableWrapper align={styles ? styles.align : 'start'} width={styles ? styles.width : '600'}>
    <TableBanner>
      { bannerText }
      <TotalTableItems>{ totalTableItems }</TotalTableItems>
    </TableBanner>
    <Table>
      <Headers columnHeaders={columnHeaders} />
      {
        people.map((person :Map) => {

          const { [ENTITY_KEY_ID]: personEntityKeyId } :UUID = getEntityProperties(person, [ENTITY_KEY_ID]);
          const sentenceDate = (isDefined(sentenceTerms) && sentenceTerms.count() > 0)
            ? sentenceTerms.getIn([personEntityKeyId, DATETIME_START, 0])
            : undefined;
          const violationsCount = (isDefined(violations) && isDefined(violations.get(personEntityKeyId)))
            ? violations.get(personEntityKeyId)
            : undefined;
          const warningsCount = (isDefined(warnings) && isDefined(warnings.get(personEntityKeyId)))
            ? warnings.get(personEntityKeyId)
            : undefined;
          const enrollmentStatus = (isDefined(enrollment) && enrollment.count() > 0)
            ? enrollment.getIn([personEntityKeyId, STATUS, 0])
            : undefined;
          const effectiveDate = (isDefined(enrollment) && enrollment.count() > 0)
            ? enrollment.getIn([personEntityKeyId, EFFECTIVE_DATE, 0], '')
            : undefined;
          const sentenceEndDate = (includeSentenceEndDate && isDefined(sentenceDate))
            ? DateTime.fromISO(sentenceDate).plus({ days: 90 }).toLocaleString()
            : undefined;

          const personHours = (isDefined(hours) && hours.count() > 0) ? hours.get(personEntityKeyId) : Map();
          const required = (isDefined(personHours) && personHours.count() > 0) ? personHours.get(REQUIRED) : 0;
          const hoursWorked = (isDefined(personHours) && personHours.count() > 0) ? personHours.get(WORKED) : 0;
          const worked = onlyReqHours ? undefined : hoursWorked;
          return (
            <ParticipantsTableRow
                ageRequired={ageRequired}
                key={personEntityKeyId}
                handleSelect={handleSelect}
                hoursRequired={required}
                hoursWorked={worked}
                includeDeadline={includeDeadline}
                person={person}
                sentenceDate={sentenceDate}
                sentenceEndDate={sentenceEndDate}
                small={small}
                startDate={effectiveDate}
                status={enrollmentStatus}
                violationsCount={violationsCount}
                warningsCount={warningsCount} />
          );
        })
      }
    </Table>
  </TableWrapper>
);

ParticipantsTable.defaultProps = {
  enrollment: Map(),
  hours: Map(),
  includeDeadline: false,
  includeSentenceEndDate: false,
  sentenceTerms: Map(),
  styles: {},
  violations: Map(),
  warnings: Map(),
};

export default ParticipantsTable;
