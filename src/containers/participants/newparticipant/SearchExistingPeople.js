// @flow
import React, { Component } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Button,
  Card,
  CardSegment,
  CardStack,
  DatePicker,
  Input,
  Label,
  PaginationToolbar,
  SearchResults,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import { SEARCH_EXISTING_PEOPLE, searchExistingPeople, selectExistingPerson } from './NewParticipantActions';

import NoParticipantsFound from '../../dashboard/NoParticipantsFound';
import { isNonEmptyString } from '../../../utils/LangUtils';
import { requestIsFailure, requestIsPending, requestIsSuccess } from '../../../utils/RequestStateUtils';
import { PEOPLE, SHARED, STATE } from '../../../utils/constants/ReduxStateConsts';
import { formatExistingPeopleData } from '../utils/NewParticipantUtils';

const { PEOPLE_ALREADY_IN_ENTITY_SET } = PEOPLE;
const { ACTIONS, REQUEST_STATE } = SHARED;

const MAX_HITS :number = 10;
const labels = Map({
  lastName: 'Last name',
  firstName: 'First name',
  dob: 'Date of birth',
  race: 'Race',
  ethnicity: 'Ethnicity',
  sex: 'Sex'
});

const FieldsGrid = styled.div`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(4, 1fr);
  margin-bottom: 20px;
  width: 100%;
`;

const StyledSearchButton = styled(Button)`
  height: 40px;
  width: 100%;
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

type Props = {
  actions :{
    searchExistingPeople :RequestSequence;
    selectExistingPerson :(object :Object) => { type :string };
  };
  peopleAlreadyInEntitySet :List;
  requestStates :{
    SEARCH_EXISTING_PEOPLE :RequestState;
  };
  setFormPage :(pageNumber :number) => void;
};

type State = {
  dob :string;
  firstName :string;
  lastName :string;
  page :number;
};

class SearchExistingPeople extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      dob: '',
      firstName: '',
      lastName: '',
      page: 0,
    };
  }

  onInputChange = (e :SyntheticEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    this.setState({ [name]: value });
  }

  setDOB = (date :string) => {
    this.setState({ dob: date });
  }

  searchExistingPeople = (e :SyntheticEvent<HTMLInputElement> | void, startIndex :?number = 0) => {
    const { actions } = this.props;
    const { dob, firstName, lastName } = this.state;

    if (isNonEmptyString(firstName) || isNonEmptyString(lastName) || isNonEmptyString(dob)) {
      actions.searchExistingPeople({
        dob,
        firstName,
        lastName,
        maxHits: MAX_HITS,
        start: startIndex,
      });
    }
  }

  setPage = (page :number) => {
    this.setState({ page });
  }

  onPageChange = ({ page: newPage, start } :Object) => {
    this.searchExistingPeople(undefined, start);
    this.setPage(newPage);
  }

  goToNextPageWithExistingPersonData = (searchResult :Map) => {
    const { actions, setFormPage } = this.props;
    const entity :Map = searchResult.get('entity');
    actions.selectExistingPerson({ existingPerson: entity });
    setFormPage(1);
  }

  render() {
    const { peopleAlreadyInEntitySet, requestStates } = this.props;
    const { page } = this.state;

    const isSearching :boolean = requestIsPending(requestStates[SEARCH_EXISTING_PEOPLE]);
    const hasSearched :boolean = requestIsSuccess(requestStates[SEARCH_EXISTING_PEOPLE])
      || requestIsFailure(requestStates[SEARCH_EXISTING_PEOPLE]);

    const existingPeopleData :List = formatExistingPeopleData(peopleAlreadyInEntitySet);
    return (
      <CardStack>
        <div>
          Search for someone in the database before creating a new profile.
          If person is found, click on their information card. If not,
          go to the next page and add them to the database.
        </div>
        <Card>
          <CardSegment>
            <FieldsGrid>
              <div>
                <Label>Last name</Label>
                <Input
                    name="lastName"
                    onChange={this.onInputChange} />
              </div>
              <div>
                <Label>First name</Label>
                <Input
                    name="firstName"
                    onChange={this.onInputChange} />
              </div>
              <div>
                <Label>Date of birth</Label>
                <DatePicker
                    name="dob"
                    onChange={this.setDOB} />
              </div>
              <ButtonWrapper>
                <StyledSearchButton onClick={this.searchExistingPeople}>Search</StyledSearchButton>
              </ButtonWrapper>
            </FieldsGrid>
          </CardSegment>
        </Card>
        {
          (hasSearched && !peopleAlreadyInEntitySet.isEmpty()) && (
            <PaginationToolbar
                count={existingPeopleData.count()}
                onPageChange={this.onPageChange}
                page={page}
                rowsPerPage={MAX_HITS} />
          )
        }
        <SearchResults
            hasSearched={hasSearched}
            isLoading={isSearching}
            noResults={NoParticipantsFound}
            onResultClick={this.goToNextPageWithExistingPersonData}
            resultLabels={labels}
            results={existingPeopleData} />
      </CardStack>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const people = state.get(STATE.PEOPLE);
  return ({
    [PEOPLE_ALREADY_IN_ENTITY_SET]: people.get(PEOPLE_ALREADY_IN_ENTITY_SET),
    requestStates: {
      [SEARCH_EXISTING_PEOPLE]: people.getIn([ACTIONS, SEARCH_EXISTING_PEOPLE, REQUEST_STATE]),
    }
  });
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    searchExistingPeople,
    selectExistingPerson,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(SearchExistingPeople);
