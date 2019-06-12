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
  courtType ? :string | void;
  datesToInclude :Object;
  enrollment ? :Map | void;
  handleSelect :(personEKID :string) => void;
  hours ? :Map;
  hoursToInclude :Object;
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
  courtType,
  datesToInclude,
  enrollment,
  handleSelect,
  hours,
  hoursToInclude,
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

          const {
            deadline,
            sentence,
            sentenceEnd,
            start
          } = datesToInclude;
          const { requiredHours, workedHours } = hoursToInclude;
          const { [ENTITY_KEY_ID]: personEntityKeyId } :UUID = getEntityProperties(person, [ENTITY_KEY_ID]);

          // Infractions
          // if violations and/or warnings (all participants) is defined, then we need to include violations count
          // if person not included in violations and/or warnings, but either is required, then return 0
          const violationsCount = isDefined(violations)
            ? violations.get(personEntityKeyId, 0)
            : undefined;
          const warningsCount = isDefined(warnings)
            ? warnings.get(personEntityKeyId, 0)
            : undefined;

          // Dates
          // if sentenceTerms is defined and we need to include sentenceData:
          // get sentenceDate from sentenceTerms, and if doesn't exist, return empty ''
          const sentenceDate = (isDefined(sentenceTerms) && sentence)
            ? sentenceTerms.getIn([personEntityKeyId, DATETIME_START, 0], '')
            : undefined;
          // can only provide a valid sentenceEndDate if we have a valid sentenceDate
          // need to provide empty '' if sentenceEnd required but we don't have valid sentenceDate
          let sentenceEndDate;
          if (DateTime.fromISO(sentenceDate).isValid && sentenceEnd) {
            sentenceEndDate = DateTime.fromISO(sentenceDate).plus({ days: 90 }).toLocaleString();
          }
          if (!DateTime.fromISO(sentenceDate).isValid && sentenceEnd) {
            sentenceEndDate = '';
          }
          // can only provide a valid deadline date if we have a valid Sentence Date
          // need to provide empty '' if deadline required but we don't have valid sentenceDate
          let enrollmentDeadline;
          if (DateTime.fromISO(sentenceDate).isValid && deadline) {
            enrollmentDeadline = DateTime.fromISO(sentenceDate).plus({ hours: 48 }).toLocaleString();
          }
          if (!DateTime.fromISO(sentenceDate).isValid && deadline) {
            enrollmentDeadline = '';
          }
          // we only have a start date if enrollment status has valid effective date
          // pass empty '' if startDate required but no effective date
          const startDate = (isDefined(enrollment) && start)
            ? enrollment.getIn([personEntityKeyId, EFFECTIVE_DATE, 0], '')
            : undefined;

          const dates = {
            enrollmentDeadline,
            sentenceDate,
            sentenceEndDate,
            startDate,
          };

          // Status
          // we can get enrollment status from enrollment or from absence of enrollment
          // need to pass empty '' if status is required
          const enrollmentStatus = (isDefined(enrollment) ||
            (isDefined(enrollment) && enrollment.get(personEntityKeyId).count() === 0))
            ? enrollment.getIn([personEntityKeyId, STATUS, 0], 'Awaiting enrollment')
            : undefined;

          // Hours
          // we get both required and worked hours in the same Object
          // for each, we need to pass an empty '' if they're not defined/found
          // required hours are always included
          const individualPersonHours = (isDefined(hours) && hours.count() > 0) ? hours.get(personEntityKeyId) : Map();
          const required = (isDefined(individualPersonHours) && requiredHours)
            ? individualPersonHours.get(REQUIRED, '')
            : '';
          const worked = (isDefined(individualPersonHours) && workedHours)
            ? individualPersonHours.get(WORKED, '')
            : undefined;

          // Court type
          // more information is needed on this, but it should be a field type in All Participants table

          return (
            <ParticipantsTableRow
                ageRequired={ageRequired}
                courtType={courtType}
                dates={dates}
                key={personEntityKeyId}
                handleSelect={handleSelect}
                hoursRequired={required}
                hoursWorked={worked}
                person={person}
                status={enrollmentStatus}
                small={small}
                violationsCount={violationsCount}
                warningsCount={warningsCount} />
          );
        })
      }
    </Table>
  </TableWrapper>
);

ParticipantsTable.defaultProps = {
  courtType: undefined,
  enrollment: undefined,
  hours: Map(),
  sentenceTerms: Map(),
  styles: {},
  violations: undefined,
  warnings: undefined,
};

export default ParticipantsTable;
