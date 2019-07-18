// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import ParticipantsTable from '../../components/table/ParticipantsTable';
import LogoLoader from '../../components/LogoLoader';

import { ToolBar } from '../../components/controls/index';
import { getSentences } from './ParticipantsActions';
import { goToRoute } from '../../core/router/RoutingActions';
import { PARTICIPANT_PROFILE } from '../../core/router/Routes';
import { SEARCH_CONTAINER_WIDTH } from '../../core/style/Sizes';
import { isDefined } from '../../utils/LangUtils';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import {
  ALL,
  ALL_PARTICIPANTS_COLUMNS,
  FILTERS,
  SORTABLE_PARTICIPANT_COLUMNS,
  statusFilterDropdown,
} from './ParticipantsConstants';
import { APP, PEOPLE, STATE } from '../../utils/constants/ReduxStateConsts';
import { ENROLLMENT_STATUSES, INFRACTIONS_CONSTS } from '../../core/edm/constants/DataModelConsts';
import {
  APP_TYPE_FQNS,
  ENROLLMENT_STATUS_FQNS,
  PEOPLE_FQNS,
  SENTENCE_TERM_FQNS,
} from '../../core/edm/constants/FullyQualifiedNames';

/*
 * constants
 */
const {
  ENROLLMENT_BY_PARTICIPANT,
  HOURS_WORKED,
  INFRACTION_COUNTS_BY_PARTICIPANT,
  PARTICIPANTS,
  SENTENCE_TERMS_BY_PARTICIPANT,
} = PEOPLE;
const { VIOLATION, WARNING } = INFRACTIONS_CONSTS;
const { EFFECTIVE_DATE, STATUS } = ENROLLMENT_STATUS_FQNS;
const { FIRST_NAME, LAST_NAME } = PEOPLE_FQNS;
const { DATETIME_START } = SENTENCE_TERM_FQNS;

const dropdowns :List = List().withMutations((list :List) => {
  list.set(0, statusFilterDropdown);
});
const defaultFilterOption :Map = statusFilterDropdown.get('enums')
  .find(obj => obj.value.toUpperCase() === ALL);

/*
 * styled components
 */

const ParticipantSearchOuterWrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

const ParticipantSearchInnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-top: 30px;
  min-width: ${SEARCH_CONTAINER_WIDTH}px;
  position: relative;
  align-self: center;
`;

/*
 * Props
 */

type Props = {
  actions:{
    getSentences :RequestSequence;
    goToRoute :RequestSequence;
  };
  app :Map;
  enrollmentByParticipant :Map;
  getInitializeAppRequestState :RequestState;
  getSentencesRequestState :RequestState;
  hoursWorked :Map;
  infractionCountsByParticipant :Map;
  participants :List;
  sentenceTermsByParticipant :Map;
};

type State = {
  peopleToRender :List;
  selectedFilterOption :Map;
  selectedSortOption :Map;
};

/*
 * React component
 */

class ParticipantsSearchContainer extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      peopleToRender: props.participants,
      selectedFilterOption: defaultFilterOption,
      selectedSortOption: SORTABLE_PARTICIPANT_COLUMNS.STATUS,
    };
  }

  componentDidMount() {
    const { actions, app } = this.props;
    this.handleOnSort(SORTABLE_PARTICIPANT_COLUMNS.STATUS.toUpperCase());
    if (app.get(APP_TYPE_FQNS.PEOPLE)) {
      actions.getSentences();
    }
  }

  componentDidUpdate(prevProps :Props) {
    const { app, actions, participants } = this.props;
    if (prevProps.app.count() !== app.count()) {
      actions.getSentences();
    }
    if (prevProps.participants.count() !== participants.count()) {
      this.handleOnSort(SORTABLE_PARTICIPANT_COLUMNS.STATUS.toUpperCase());
    }
  }

  handleOnFilter = (clickedProperty :Map, selectEvent :Object, peopleToFilter :List) => {
    const { enrollmentByParticipant, participants } = this.props;
    const peopleList :List = isDefined(peopleToFilter) ? peopleToFilter : participants;
    const filter :string = clickedProperty.filter.toLowerCase();
    let property :string = clickedProperty.label.toUpperCase();
    property = property.split(' ').length > 1 ? property.split(' ').join('_') : property;
    let filteredPeople :List = List();

    if (property === ALL) {
      this.setState({ peopleToRender: participants, selectedFilterOption: clickedProperty });
      return peopleList;
    }
    if (filter === FILTERS.STATUS) {
      filteredPeople = peopleList.filter((person :Map) => {
        const statusTypeToInclude = ENROLLMENT_STATUSES[property];
        const personEKID :UUID = getEntityKeyId(person);
        const personEnrollment :Map = enrollmentByParticipant.get(personEKID, Map());
        let { [STATUS]: status } = getEntityProperties(personEnrollment, [STATUS]);
        status = !isDefined(status) ? ENROLLMENT_STATUSES.AWAITING_ENROLLMENT : status;
        return status === statusTypeToInclude;
      });
    }

    this.setState({ peopleToRender: filteredPeople, selectedFilterOption: clickedProperty });
    return filteredPeople;
  }

  handleOnSelectPerson = (personEKID :string) => {
    const { actions } = this.props;
    actions.goToRoute(PARTICIPANT_PROFILE.replace(':subjectId', personEKID));
  }

  handleOnSort = (clickedColumnHeader :Map, selectEvent :Object, peopleToSort :List) => {
    const { participants } = this.props;
    const column = clickedColumnHeader.toLowerCase();
    const peopleList :List = isDefined(peopleToSort) ? peopleToSort : participants;
    let sortedPeople :List = List();

    if (column === SORTABLE_PARTICIPANT_COLUMNS.NAME) {
      sortedPeople = this.sortByName(peopleList);
    }
    if (column === SORTABLE_PARTICIPANT_COLUMNS.START_DATE) {
      sortedPeople = this.sortByStartDate(peopleList);
    }
    if (column === SORTABLE_PARTICIPANT_COLUMNS.SENT_END_DATE) {
      sortedPeople = this.sortBySentenceEndDate(peopleList);
    }
    if (column === SORTABLE_PARTICIPANT_COLUMNS.STATUS) {
      sortedPeople = this.sortByStatus(peopleList);
    }
    if (Object.values(SORTABLE_PARTICIPANT_COLUMNS).indexOf(column) === -1) {
      // TODO: sort by court type when the data model accomodates court type
      return;
    }

    this.setState({ peopleToRender: sortedPeople, selectedSortOption: clickedColumnHeader });
    return sortedPeople;
  }

  searchParticipantList = (input :string) => {
    const { participants } = this.props;
    const { selectedFilterOption, selectedSortOption } = this.state;

    const matches = participants.filter((p) => {
      const { [FIRST_NAME]: firstName, [LAST_NAME]: lastName } = getEntityProperties(p, [FIRST_NAME, LAST_NAME]);
      const fullName = (`${firstName} ${lastName}`).trim().toLowerCase();

      const trimmedInput = input.trim().toLowerCase();
      const match = firstName.toLowerCase().includes(trimmedInput) || lastName.toLowerCase().includes(trimmedInput)
        || fullName.includes(trimmedInput);

      return match;
    });

    // preserve any filters or sorting that was selected before search
    const sortedSearchedPeople = this.handleOnSort(selectedSortOption, null, matches);
    const fullyProcessedPeople = this.handleOnFilter(selectedFilterOption, null, sortedSearchedPeople);
    this.setState({ peopleToRender: fullyProcessedPeople });

  }

  sortByName = (people :List) => {
    const sortedByName :List = people.sort((personA, personB) => {
      const { [FIRST_NAME]: firstNameA, [LAST_NAME]: lastNameA } = getEntityProperties(
        personA, [FIRST_NAME, LAST_NAME]
      );
      const { [FIRST_NAME]: firstNameB, [LAST_NAME]: lastNameB } = getEntityProperties(
        personB, [FIRST_NAME, LAST_NAME]
      );
      if (lastNameA === lastNameB) {
        return firstNameA.localeCompare(firstNameB, undefined, { sensitivity: 'base' });
      }
      return lastNameA.localeCompare(lastNameB, undefined, { sensitivity: 'base' });
    });
    return sortedByName;
  }

  sortBySentenceEndDate = (people :List) => {
    const { sentenceTermsByParticipant } = this.props;
    const sortedBySentEndDate :List = people.sort((personA, personB) => {
      const personAEKID :UUID = getEntityKeyId(personA);
      const personBEKID :UUID = getEntityKeyId(personB);
      const { [DATETIME_START]: personASentDate } = getEntityProperties(
        sentenceTermsByParticipant.get(personAEKID), [DATETIME_START]
      );
      const { [DATETIME_START]: personBSentDate } = getEntityProperties(
        sentenceTermsByParticipant.get(personBEKID), [DATETIME_START]
      );
      const sentEndDateA = DateTime.fromISO(personASentDate).plus({ days: 90 });
      const sentEndDateB = DateTime.fromISO(personBSentDate).plus({ days: 90 });
      if (sentEndDateB.isValid && !sentEndDateA.isValid) {
        return -1;
      }
      if (sentEndDateA.isValid && !sentEndDateB.isValid) {
        return 1;
      }
      if ((!sentEndDateA.isValid && !sentEndDateB.isValid) || (sentEndDateA.hasSame(sentEndDateB, 'millisecond'))) {
        return 0;
      }
      return (sentEndDateA < sentEndDateB) ? 1 : -1;
    });
    return sortedBySentEndDate;
  }

  sortByStartDate = (people :List) => {
    const { enrollmentByParticipant } = this.props;
    const sortedByStartDate :List = people.sort((personA, personB) => {
      const personAEKID :UUID = getEntityKeyId(personA);
      const personBEKID :UUID = getEntityKeyId(personB);
      const { [EFFECTIVE_DATE]: personAStartDate } = getEntityProperties(
        enrollmentByParticipant.get(personAEKID), [EFFECTIVE_DATE]
      );
      const { [EFFECTIVE_DATE]: personBStartDate } = getEntityProperties(
        enrollmentByParticipant.get(personBEKID), [EFFECTIVE_DATE]
      );
      const startDateA = DateTime.fromISO(personAStartDate);
      const startDateB = DateTime.fromISO(personBStartDate);
      if (startDateB.isValid && !startDateA.isValid) {
        return 1;
      }
      if (startDateA.isValid && !startDateB.isValid) {
        return -1;
      }
      if ((!startDateA.isValid && !startDateB.isValid) || (+startDateA === +startDateB)) {
        return 0;
      }
      return (startDateA < startDateB) ? 1 : -1;
    });
    return sortedByStartDate;
  }

  sortByStatus = (people :List) => {
    const { enrollmentByParticipant } = this.props;
    const sortedByStatus :List = people.sort((personA, personB) => {
      const personAEKID :UUID = getEntityKeyId(personA);
      const personBEKID :UUID = getEntityKeyId(personB);
      let { [STATUS]: personAStatus } = getEntityProperties(
        enrollmentByParticipant.get(personAEKID), [STATUS]
      );
      let { [STATUS]: personBStatus } = getEntityProperties(
        enrollmentByParticipant.get(personBEKID), [STATUS]
      );
      personAStatus = !isDefined(personAStatus) ? ENROLLMENT_STATUSES.AWAITING_ENROLLMENT : personAStatus;
      personBStatus = !isDefined(personBStatus) ? ENROLLMENT_STATUSES.AWAITING_ENROLLMENT : personBStatus;
      return personAStatus.localeCompare(personBStatus, undefined, { sensitivity: 'base' });
    });
    return sortedByStatus;
  }

  render() {
    const {
      enrollmentByParticipant,
      getInitializeAppRequestState,
      getSentencesRequestState,
      hoursWorked,
      infractionCountsByParticipant,
      sentenceTermsByParticipant
    } = this.props;
    const { peopleToRender, selectedSortOption } = this.state;
    const onSelectFunctions = Map().withMutations((map :Map) => {
      map.set(FILTERS.STATUS, this.handleOnFilter);
    });
    const warningMap :Map = infractionCountsByParticipant.map((count :Map) => count.get(WARNING));
    const violationMap :Map = infractionCountsByParticipant.map((count :Map) => count.get(VIOLATION));

    if (getSentencesRequestState === RequestStates.PENDING || getInitializeAppRequestState === RequestStates.PENDING) {
      return (
        <LogoLoader
            loadingText="Please wait..."
            size={60} />
      );
    }

    return (
      <ParticipantSearchOuterWrapper>
        <ToolBar
            dropdowns={dropdowns}
            onSelectFunctions={onSelectFunctions}
            primaryButtonAction={() => {}}
            primaryButtonText="Add Participant"
            search={this.searchParticipantList} />
        <ParticipantSearchInnerWrapper>
          <ParticipantsTable
              ageRequired
              alignCenter
              bannerText="All Participants"
              columnHeaders={ALL_PARTICIPANTS_COLUMNS}
              config={{
                includeDeadline: false,
                includeRequiredHours: true,
                includeSentenceDate: true,
                includeSentenceEndDate: true,
                includeStartDate: true,
                includeWorkedHours: true
              }}
              courtType=""
              enrollment={enrollmentByParticipant}
              handleSelect={this.handleOnSelectPerson}
              hours={hoursWorked}
              people={peopleToRender}
              selectedSortOption={selectedSortOption}
              sentenceTerms={sentenceTermsByParticipant}
              small
              sortByColumn={this.handleOnSort}
              totalTableItems={peopleToRender.count()}
              violations={violationMap}
              warnings={warningMap}
              width="100%" />
        </ParticipantSearchInnerWrapper>
      </ParticipantSearchOuterWrapper>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => {
  const app = state.get(STATE.APP);
  const people = state.get(STATE.PEOPLE);
  return {
    app,
    [ENROLLMENT_BY_PARTICIPANT]: people.get(ENROLLMENT_BY_PARTICIPANT),
    getInitializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
    getSentencesRequestState: people.getIn([PEOPLE.ACTIONS, PEOPLE.GET_SENTENCES, PEOPLE.REQUEST_STATE]),
    [HOURS_WORKED]: people.get(HOURS_WORKED),
    [INFRACTION_COUNTS_BY_PARTICIPANT]: people.get(INFRACTION_COUNTS_BY_PARTICIPANT),
    [PARTICIPANTS]: people.get(PARTICIPANTS),
    [SENTENCE_TERMS_BY_PARTICIPANT]: people.get(SENTENCE_TERMS_BY_PARTICIPANT),
  };
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    getSentences,
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ParticipantsSearchContainer);
