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
  DATETIME_START,
  ENROLLMENT_STATUS_FQNS,
  ENTITY_KEY_ID,
} from '../../core/edm/constants/FullyQualifiedNames';
import { ENROLLMENT_STATUSES, HOURS_CONSTS } from '../../core/edm/constants/DataModelConsts';
import { SORTABLE_PARTICIPANT_COLUMNS } from '../../containers/participants/ParticipantsConstants';

const { EFFECTIVE_DATE, STATUS } = ENROLLMENT_STATUS_FQNS;
const { REQUIRED, WORKED } = HOURS_CONSTS;

type HeaderProps = {
  columnHeaders :string[];
  selected ? :string;
  sort ? :(header :string) => void;
};

const Headers = ({ columnHeaders, selected, sort } :HeaderProps) => (
  <>
    <HeaderRow>
      <HeaderElement />
      {
        columnHeaders.map(header => (
          <HeaderElement
              key={header}
              onClick={() => sort(header)}
              selected={selected === header && Object.values(SORTABLE_PARTICIPANT_COLUMNS)
                .indexOf(selected.toLowerCase()) !== -1}>
            { header }
          </HeaderElement>
        ))
      }
    </HeaderRow>
  </>
);

Headers.defaultProps = {
  selected: '',
  sort: () => {}
};

type Props = {
  ageRequired :boolean;
  alignCenter ? :boolean;
  bannerText :string;
  columnHeaders :string[];
  config :Object;
  courtType ? :string;
  enrollment ? :Map;
  handleSelect :(personEKID :string) => void;
  hours ? :Map;
  noShows ? :List;
  people :List;
  selectedSortOption ? :string;
  sentenceTerms ? :Map;
  small :boolean;
  sortByColumn ? :(header :string) => void;
  totalTableItems :number;
  violations ? :Map;
  warnings ? :Map;
  width ? :string;
};

const ParticipantsTable = ({
  ageRequired,
  alignCenter,
  bannerText,
  columnHeaders,
  config,
  courtType,
  enrollment,
  handleSelect,
  hours,
  noShows,
  people,
  selectedSortOption,
  sentenceTerms,
  small,
  sortByColumn,
  totalTableItems,
  violations,
  warnings,
  width,
} :Props) => (
  <TableWrapper alignCenter={alignCenter} width={width}>
    <TableBanner>
      { bannerText }
      <TotalTableItems>{ totalTableItems }</TotalTableItems>
    </TableBanner>
    <Table>
      <Headers columnHeaders={columnHeaders} selected={selectedSortOption} sort={sortByColumn} />
      {
        people.map((person :Map) => {

          const {
            includeDeadline,
            includeRequiredHours,
            includeSentenceDate,
            includeSentenceEndDate,
            includeStartDate,
            includeWorkedHours,
          } = config;
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
          const sentenceDate = (isDefined(sentenceTerms) && includeSentenceDate)
            ? sentenceTerms.getIn([personEntityKeyId, DATETIME_START, 0], '')
            : undefined;
          // can only provide a valid sentenceEndDate if we have a valid sentenceDate
          // need to provide empty '' if sentenceEnd required but we don't have valid sentenceDate
          const sentenceDateObj = DateTime.fromISO(sentenceDate);
          let sentenceEndDate;
          if (sentenceDateObj.isValid && includeSentenceEndDate) {
            sentenceEndDate = sentenceDateObj.plus({ days: 90 }).toLocaleString();
          }
          if (!sentenceDateObj.isValid && includeSentenceEndDate) {
            sentenceEndDate = '';
          }
          // can only provide a valid deadline date if we have a valid Sentence Date
          // need to provide empty '' if deadline required but we don't have valid sentenceDate
          let enrollmentDeadline;
          if (sentenceDateObj.isValid && includeDeadline) {
            enrollmentDeadline = sentenceDateObj.plus({ hours: 48 }).toLocaleString();
          }
          if (!sentenceDateObj.isValid && includeDeadline) {
            enrollmentDeadline = '';
          }
          // we only have a start date if enrollment status has valid effective date
          // pass empty '' if startDate required but no effective date
          const startDate = (isDefined(enrollment) && includeStartDate)
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
          const enrollmentStatus = isDefined(enrollment)
            ? enrollment.getIn([personEntityKeyId, STATUS, 0], ENROLLMENT_STATUSES.AWAITING_CHECKIN)
            : undefined;

          // Hours
          // we get both required and worked hours in the same Object
          // for each, we need to pass an empty '' if they're not defined/found
          // required hours are always included
          const individualPersonHours = (isDefined(hours) && hours.count() > 0) ? hours.get(personEntityKeyId) : Map();
          const individualHasHours = isDefined(individualPersonHours);
          const required = (individualHasHours && includeRequiredHours)
            ? individualPersonHours.get(REQUIRED, '')
            : '';
          const worked = (individualHasHours && includeWorkedHours)
            ? individualPersonHours.get(WORKED, '')
            : undefined;

          // Court type
          // TODO: more information is needed on this—for now just an empty column in All Participants table

          // No shows
          // if person is a no show, should display an exclamation warning in Violations Watch table
          const includeWarning :boolean = (isDefined(noShows) && noShows.includes(person));

          return (
            <ParticipantsTableRow
                ageRequired={ageRequired}
                courtType={courtType}
                dates={dates}
                key={personEntityKeyId}
                handleSelect={handleSelect}
                hoursRequired={required}
                hoursWorked={worked}
                includeWarning={includeWarning}
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
  alignCenter: false,
  courtType: undefined,
  enrollment: undefined,
  hours: Map(),
  noShows: undefined,
  selectedSortOption: '',
  sentenceTerms: Map(),
  sortByColumn: () => {},
  violations: undefined,
  warnings: undefined,
  width: '100%',
};

export default ParticipantsTable;
