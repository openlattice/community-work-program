// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import {
  fromJS,
  List,
  Map,
  OrderedMap
} from 'immutable';
import { DateTime } from 'luxon';
import { Card, CardSegment, DataGrid, Label } from 'lattice-ui-kit';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import type { Match } from 'react-router';

import LogoLoader from '../../../components/LogoLoader';

import { getInfoForPrintInfraction } from '../ParticipantActions';
import {
  APP_TYPE_FQNS,
  DATETIME_COMPLETED,
  INFRACTION_FQNS,
  INFRACTION_EVENT_FQNS,
  PEOPLE_FQNS,
} from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityKeyId, getEntityProperties, sortEntitiesByDateProperty } from '../../../utils/DataUtils';
import { APP, PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';

const { PEOPLE } = APP_TYPE_FQNS;
const { CATEGORY } = INFRACTION_FQNS;
const { NOTES } = INFRACTION_EVENT_FQNS;
const { DOB, FIRST_NAME, LAST_NAME } = PEOPLE_FQNS;
const { INITIALIZE_APPLICATION } = APP;
const {
  ACTIONS,
  GET_INFO_FOR_PRINT_INFRACTION,
  INFRACTION_EVENT,
  INFRACTION_TYPE,
  PARTICIPANT,
  REQUEST_STATE,
} = PERSON;

const EMPTY_STRING = '';
const SPACED_STRING = ' ';

const headerLabelMap :OrderedMap = OrderedMap({
  worksiteName: 'Worksite',
  day: 'Weekday',
  date: 'Date',
  hours: 'Hours',
});
const appointmentLabelMap :OrderedMap = OrderedMap({
  worksiteName: EMPTY_STRING,
  day: EMPTY_STRING,
  date: EMPTY_STRING,
  hours: EMPTY_STRING,
});
const headerDataMap :Map = Map({
  worksiteName: SPACED_STRING,
  day: SPACED_STRING,
  date: SPACED_STRING,
  hours: SPACED_STRING,
});

const TextWrapper = styled.div`
  display: flex;
  margin-bottom: 20px;
  width: 100%;
`;

const RowWrapper = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  grid-gap: 5px 30px;
  width: 100%;
  /* min-height: 40px; */
`;

type Props = {
  actions:{
    getInfoForPrintInfraction :RequestSequence;
  };
  app :Map;
  getInfoForPrintInfractionRequestState :RequestState;
  initializeApplicationRequestState :RequestState;
  infractionEvent :Map;
  infractionType :Map;
  match :Match;
  participant :Map;
};

type State = {
};

class PrintInfractionContainer extends Component<Props, State> {

  componentDidMount() {
    const {
      actions,
      app,
      match: {
        params: { subjectId: personEKID, infractionId: infractionEventEKID }
      },
    } = this.props;
    if (app.get(PEOPLE)) {
      actions.getInfoForPrintInfraction({ infractionEventEKID, personEKID });
    }
  }

  componentDidUpdate(prevProps :Props) {
    const {
      actions,
      app,
      match: {
        params: { subjectId: personEKID, infractionId: infractionEventEKID }
      },
    } = this.props;
    if (!prevProps.app.get(PEOPLE) && app.get(PEOPLE)) {
      actions.getInfoForPrintInfraction({ infractionEventEKID, personEKID });
    }
  }

  render() {
    const {
      getInfoForPrintInfractionRequestState,
      initializeApplicationRequestState,
      infractionEvent,
      infractionType,
      participant,
    } = this.props;

    if (getInfoForPrintInfractionRequestState === RequestStates.PENDING
        || initializeApplicationRequestState === RequestStates.PENDING) {
      return (
        <LogoLoader
            loadingText="Please wait..."
            size={60} />
      );
    }

    const {
      [DOB]: dob,
      [FIRST_NAME]: firstName,
      [LAST_NAME]: lastName
    } = getEntityProperties(participant, [DOB, FIRST_NAME, LAST_NAME]);
    const personFullName :string = `${firstName} ${lastName}`;
    const dateOfBirth :string = DateTime.fromISO(dob).toLocaleString(DateTime.DATE_SHORT);

    const {
      [DATETIME_COMPLETED]: dateOfInfractionEvent,
      [NOTES]: narrative
    } = getEntityProperties(infractionEvent, [DATETIME_COMPLETED, NOTES]);
    const infractionDate :string = DateTime.fromISO(dateOfInfractionEvent).toLocaleString(DateTime.DATE_SHORT);

    const { [CATEGORY]: infractionCategory } = getEntityProperties(infractionType, [CATEGORY]);

    return (
      <Card>
        <CardSegment vertical>
          <Label subtle>Date</Label>
          <TextWrapper>{ infractionDate }</TextWrapper>
          <RowWrapper>
            <div>
              <Label subtle>Name</Label>
              <TextWrapper>{ personFullName }</TextWrapper>
            </div>
            <div>
              <Label subtle>DOB</Label>
              <TextWrapper>{ dateOfBirth }</TextWrapper>
            </div>
          </RowWrapper>
          <Label subtle>Violation Type</Label>
          <TextWrapper>{ infractionCategory }</TextWrapper>
        </CardSegment>
        <CardSegment vertical>
          <Label subtle>File #1</Label>
          <RowWrapper>
            <div>
              <Label subtle>Docket #</Label>
              <TextWrapper></TextWrapper>
            </div>
            <div>
              <Label subtle>Judge</Label>
              <TextWrapper></TextWrapper>
            </div>
          </RowWrapper>
        </CardSegment>
        <CardSegment vertical>
          <Label subtle>File #2</Label>
          <RowWrapper>
            <div>
              <Label subtle>Docket #</Label>
              <TextWrapper></TextWrapper>
            </div>
            <div>
              <Label subtle>Judge</Label>
              <TextWrapper></TextWrapper>
            </div>
          </RowWrapper>
        </CardSegment>
        <CardSegment vertical>
          <Label subtle>Narrative</Label>
          <TextWrapper>{ narrative }</TextWrapper>
        </CardSegment>
        <CardSegment vertical>
          <Label subtle>Work Program Staff Person</Label>
          <TextWrapper>Skaare, Vanessa</TextWrapper>
        </CardSegment>
      </Card>
    );
  }
}

const mapStateToProps = (state) => {
  const app = state.get(STATE.APP);
  const person = state.get(STATE.PERSON);
  return {
    app,
    getInfoForPrintInfractionRequestState: person.getIn([ACTIONS, GET_INFO_FOR_PRINT_INFRACTION, REQUEST_STATE]),
    initializeApplicationRequestState: app.getIn([ACTIONS, INITIALIZE_APPLICATION, REQUEST_STATE]),
    [INFRACTION_EVENT]: person.get(INFRACTION_EVENT),
    [INFRACTION_TYPE]: person.get(INFRACTION_TYPE),
    [PARTICIPANT]: person.get(PARTICIPANT),
  };
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    getInfoForPrintInfraction,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(PrintInfractionContainer);
