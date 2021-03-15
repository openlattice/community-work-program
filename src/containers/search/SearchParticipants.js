// @flow
import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Button,
  Card,
  CardHeader,
  CardSegment,
  DatePicker,
  Input,
  Label,
  PaginationToolbar,
  SearchResults,
  Typography,
} from 'lattice-ui-kit';
import {
  DataUtils,
  ReduxUtils,
  useRequestState,
} from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';

import { SEARCH_PARTICIPANTS, clearSearchedDataAndRequestState, searchParticipants } from './actions';

import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { PARTICIPANT_PROFILE } from '../../core/router/Routes';
import { goToRoute } from '../../core/router/RoutingActions';
import { getPersonFullName } from '../../utils/PeopleUtils';
import { SEARCH } from '../../utils/constants/ReduxStateConsts';

const { DOB } = PROPERTY_TYPE_FQNS;
const { SEARCHED_PARTICIPANTS, TOTAL_HITS } = SEARCH;
const { isFailure, isPending, isSuccess } = ReduxUtils;
const { getEntityKeyId, getPropertyValue } = DataUtils;

const MAX_HITS = 10;
const resultLabels = Map({
  name: 'Name',
  personDOB: 'Date of Birth',
});

const SearchGrid = styled.div`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(4, 1fr);
  margin-top: 20px;
  margin-bottom: 20px;
  width: 100%;

  span:last-child {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
`;

const SearchParticipants = () => {

  const [formInputs, setFormInputs] = useState({ firstName: '', lastName: '' });
  const [dob, setDOB] = useState('');
  const [page, setPage] = useState(1);

  const onInputChange = (e :SyntheticEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormInputs({ ...formInputs, [name]: value });
  };

  const dispatch = useDispatch();

  const searchCWPParticipants = (e :SyntheticEvent<HTMLInputElement> | void, startIndex :?number) => {
    const start = startIndex || 0;
    dispatch(searchParticipants({
      dob,
      firstName: formInputs.firstName,
      lastName: formInputs.lastName,
      maxHits: MAX_HITS,
      start,
    }));
  };

  const onPageChange = ({ page: newPage, start } :Object) => {
    searchCWPParticipants(undefined, start);
    setPage(newPage);
  };

  const searchedParticipants :List = useSelector((store) => store.getIn([SEARCH.SEARCH, SEARCHED_PARTICIPANTS]));
  const totalHits :List = useSelector((store) => store.getIn([SEARCH.SEARCH, TOTAL_HITS]));

  const data = searchedParticipants.map((searchedPerson :Map) => {
    const name = getPersonFullName(searchedPerson);
    const personDOB = getPropertyValue(searchedPerson, [DOB, 0]);
    return Map({ name, id: getEntityKeyId(searchedPerson), personDOB });
  });

  const goToProfile = (clickedPerson :Map) => {
    dispatch(goToRoute(
      PARTICIPANT_PROFILE.replace(':participantId', clickedPerson.get('id'))
    ));
  };

  const searchRequestState = useRequestState([SEARCH.SEARCH, SEARCH_PARTICIPANTS]);

  const isSearching :boolean = isPending(searchRequestState);
  const hasSearched :boolean = isSuccess(searchRequestState) || isFailure(searchRequestState);

  useEffect(() => {
    const resetSearchResults = () => {
      dispatch(clearSearchedDataAndRequestState());
    };
    return resetSearchResults;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Card>
        <CardHeader>Search CWP Participants</CardHeader>
        <CardSegment>
          <SearchGrid>
            <span>
              <Label>Last name</Label>
              <Input
                  name="lastName"
                  onChange={onInputChange} />
            </span>
            <span>
              <Label>First name</Label>
              <Input
                  name="firstName"
                  onChange={onInputChange} />
            </span>
            <span>
              <Label>Date of birth</Label>
              <DatePicker onChange={(date :string) => setDOB(date)} />
            </span>
            <span>
              <Button
                  arialabelledby="searchParticipants"
                  isLoading={isSearching}
                  onClick={searchCWPParticipants}>
                Search
              </Button>
            </span>
          </SearchGrid>
        </CardSegment>
      </Card>
      {
        (hasSearched && !data.isEmpty()) && (
          <CardSegment>
            <Typography gutterBottom>Click on a person to visit their profile.</Typography>
            <PaginationToolbar
                count={totalHits}
                onPageChange={onPageChange}
                page={page}
                rowsPerPage={MAX_HITS} />
          </CardSegment>
        )
      }
      <SearchResults
          hasSearched={hasSearched}
          isLoading={isSearching}
          onResultClick={(clickedPerson :Map) => goToProfile(clickedPerson)}
          resultLabels={resultLabels}
          results={data} />
    </>
  );
};

export default SearchParticipants;
