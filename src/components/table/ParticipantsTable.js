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
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { ENROLLMENT_STATUSES, HOURS_CONSTS } from '../../core/edm/constants/DataModelConsts';
import { SORTABLE_PARTICIPANT_COLUMNS } from '../../containers/participants/ParticipantsConstants';

const {
  DATETIME_RECEIVED,
  EFFECTIVE_DATE,
  ENTITY_KEY_ID,
  STATUS,
} = PROPERTY_TYPE_FQNS;
const { REQUIRED, WORKED } = HOURS_CONSTS;

type HeaderProps = {
  columnHeaders :string[];
  selected :string;
  sort :(header :string) => void;
};

const Headers = ({ columnHeaders, selected, sort } :HeaderProps) => (
  <HeaderRow>
    <HeaderElement />
    {
      columnHeaders.map((header) => (
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
);

Headers.defaultProps = {
  selected: '',
  sort: () => {}
};

type Props = {
  ageRequired :boolean;
  alignCenter :boolean;
  bannerText :string;
  columnHeaders :string[];
  config :Object;
  courtTypeByParticipant :Map;
  currentDiversionPlansMap :Map;
  enrollment :Map;
  handleSelect :(personEKID :string) => void;
  hours :Map;
  noShows :List;
  people :List;
  selectedSortOption :string;
  small :boolean;
  sortByColumn :(header :string) => void;
  tag :string | void;
  totalTableItems :number;
  violations :Map;
  warnings :Map;
  width :string;
};

const ParticipantsTable = ({
  ageRequired,
  alignCenter,
  bannerText,
  columnHeaders,
  config,
  courtTypeByParticipant,
  currentDiversionPlansMap,
  enrollment,
  handleSelect,
  hours,
  noShows,
  people,
  selectedSortOption,
  small,
  sortByColumn,
  tag,
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
          const { [ENTITY_KEY_ID]: personEKID } = getEntityProperties(person, [ENTITY_KEY_ID]);

          /* Infractions
           * if violations and/or warnings (all participants) is defined, then we need to include violations count
           * if person not included in violations and/or warnings, but either is required, then return 0
           */
          const violationsCount = isDefined(violations)
            // $FlowFixMe
            ? violations.get(personEKID, 0)
            : undefined;
          const warningsCount = isDefined(warnings)
            // $FlowFixMe
            ? warnings.get(personEKID, 0)
            : undefined;

          /* Dates:
           * if sentenceTerms is defined and we need to include sentenceData:
           * get sentenceDate from sentenceTerms, and if doesn't exist, return empty ''
           */
          let sentenceDate = (isDefined(currentDiversionPlansMap) && includeSentenceDate)
            ? currentDiversionPlansMap.getIn([personEKID, DATETIME_RECEIVED, 0])
            : undefined;
          /* can only provide a valid sentenceEndDate if we have a valid sentenceDate
           * need to provide empty '' if sentenceEnd required but we don't have valid sentenceDate
           */
          // $FlowFixMe
          const sentenceDateObj = DateTime.fromISO(sentenceDate);
          if (!sentenceDateObj.isValid && includeSentenceDate) {
            sentenceDate = '';
          }
          let sentenceEndDate;
          if (sentenceDateObj.isValid && includeSentenceEndDate) {
            sentenceEndDate = sentenceDateObj.plus({ days: 90 }).toLocaleString();
          }
          if (!sentenceDateObj.isValid && includeSentenceEndDate) {
            sentenceEndDate = '';
          }
          /* can only provide a valid deadline date if we have a valid Sentence Date
           * need to provide empty '' if deadline required but we don't have valid sentenceDate
           */
          let enrollmentDeadline;
          if (sentenceDateObj.isValid && includeDeadline) {
            enrollmentDeadline = sentenceDateObj.plus({ hours: 48 }).toLocaleString();
          }
          if (!sentenceDateObj.isValid && includeDeadline) {
            enrollmentDeadline = '';
          }
          /* we only have a start date if enrollment status has valid effective date
           * pass empty '' if startDate required but no effective date\
           */
          const startDate = (isDefined(enrollment) && includeStartDate)
            ? enrollment.getIn([personEKID, EFFECTIVE_DATE, 0], '')
            : undefined;

          const dates = {
            enrollmentDeadline,
            sentenceDate,
            sentenceEndDate,
            startDate,
          };

          /* Status:
           * we can get enrollment status from enrollment or from absence of enrollment
           * need to pass empty '' if status is required
           */
          const enrollmentStatus = isDefined(enrollment)
            ? enrollment.getIn([personEKID, STATUS, 0], ENROLLMENT_STATUSES.AWAITING_CHECKIN)
            : undefined;

          /* Hours:
           * we get both required and worked hours in the same Object
           * for each, we need to pass an empty '' if they're not defined/found
           * required hours are always included
           */
          const individualPersonHours = (isDefined(hours) && hours.count() > 0) ? hours.get(personEKID) : Map();
          const individualHasHours = isDefined(individualPersonHours);
          const required = (individualHasHours && includeRequiredHours)
            ? individualPersonHours.get(REQUIRED, '')
            : '';
          const worked = (individualHasHours && includeWorkedHours)
            ? individualPersonHours.get(WORKED, '')
            : undefined;

          /* Court type */
          const courtType = (isDefined(courtTypeByParticipant))
            ? courtTypeByParticipant.get(personEKID, '')
            : undefined;

          /* Tags for Pening Completion Review and Violations Watch tables */
          let tagToInclude;
          if (isDefined(tag)) {
            tagToInclude = tag;
            if (isDefined(noShows) && !noShows.includes(person)) {
              tagToInclude = undefined;
            }
          }

          return (
            <ParticipantsTableRow
                ageRequired={ageRequired}
                courtType={courtType}
                dates={dates}
                key={personEKID}
                handleSelect={handleSelect}
                hoursRequired={required}
                hoursWorked={worked}
                person={person}
                status={enrollmentStatus}
                small={small}
                tag={tagToInclude}
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
  courtTypeByParticipant: undefined,
  currentDiversionPlansMap: undefined,
  enrollment: undefined,
  hours: Map(),
  noShows: undefined,
  tag: undefined,
  selectedSortOption: '',
  sortByColumn: () => {},
  violations: Map(),
  warnings: Map(),
  width: '100%',
};

export default ParticipantsTable;
