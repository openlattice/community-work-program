// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';
import {
  Card,
  CardSegment,
  Label,
  Select,
} from 'lattice-ui-kit';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import type { Match } from 'react-router';

import LogoLoader from '../../../components/LogoLoader';
import ViolationHeader from '../../../assets/images/violation_header.png';

import { getInfoForPrintInfraction } from '../ParticipantActions';
import {
  APP_TYPE_FQNS,
  CASE_FQNS,
  DATETIME_COMPLETED,
  INFRACTION_FQNS,
  INFRACTION_EVENT_FQNS,
  PEOPLE_FQNS,
} from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties } from '../../../utils/DataUtils';
import { getValuesFromEntityList } from '../utils/EditCaseInfoUtils';
import { APP, PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';

const { PEOPLE } = APP_TYPE_FQNS;
const { CASE_NUMBER_TEXT } = CASE_FQNS;
const { CATEGORY } = INFRACTION_FQNS;
const { NOTES } = INFRACTION_EVENT_FQNS;
const { DOB, FIRST_NAME, LAST_NAME } = PEOPLE_FQNS;
const { INITIALIZE_APPLICATION } = APP;
const {
  ACTIONS,
  ALL_PARTICIPANT_CASES,
  GET_INFO_FOR_PRINT_INFRACTION,
  INFRACTION_EVENT,
  INFRACTION_TYPE,
  JUDGES_BY_CASE,
  PARTICIPANT,
  REQUEST_STATE,
} = PERSON;

// $FlowFixMe
const PenningtonSherrifsHeader = styled.img.attrs({
  alt: 'Pennington County Sheriff\'s Office',
  src: ViolationHeader,
})`
  height: 200px;
  display: block;
  margin: 0 auto;
`;

const TextWrapper = styled.div`
  display: flex;
  margin-bottom: 20px;
  width: 100%;
`;

const RowWrapper = styled.div`
  display: grid;
  grid-template-columns: 300px 300px;
  grid-gap: 5px 30px;
  width: 100%;
`;

type Props = {
  actions:{
    getInfoForPrintInfraction :RequestSequence;
  };
  allParticipantCases :List;
  app :Map;
  getInfoForPrintInfractionRequestState :RequestState;
  initializeApplicationRequestState :RequestState;
  infractionEvent :Map;
  infractionType :Map;
  judgesByCase :Map;
  match :Match;
  participant :Map;
};

class PrintInfractionContainer extends Component<Props> {

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
      allParticipantCases,
      getInfoForPrintInfractionRequestState,
      initializeApplicationRequestState,
      infractionEvent,
      infractionType,
      judgesByCase,
      participant,
    } = this.props;

    if (initializeApplicationRequestState === RequestStates.PENDING
        || getInfoForPrintInfractionRequestState === RequestStates.PENDING) {
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

    const judgesEntities :List = judgesByCase ? judgesByCase.valueSeq().toList() : List();
    const [judgeValues, judgeLabels] = getValuesFromEntityList(judgesEntities, [FIRST_NAME, LAST_NAME]);
    const judgesOptions = [];
    judgeValues
      .forEach((judgeEKID :UUID, i :number) => judgesOptions.push({ value: judgeEKID, label: judgeLabels[i] }));

    const [caseValues, caseLabels] = getValuesFromEntityList(allParticipantCases, [CASE_NUMBER_TEXT]);
    const casesOptions = [];
    caseValues.forEach((caseEKID :UUID, i :number) => casesOptions.push({ value: caseEKID, label: caseLabels[i] }));

    return (
      <Card>
        <CardSegment>
          <PenningtonSherrifsHeader />
        </CardSegment>
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
              <Select
                  borderless
                  options={casesOptions} />
            </div>
            <div>
              <Label subtle>Judge</Label>
              <Select
                  borderless
                  options={judgesOptions} />
            </div>
          </RowWrapper>
        </CardSegment>
        <CardSegment vertical>
          <Label subtle>File #2</Label>
          <RowWrapper>
            <div>
              <Label subtle>Docket #</Label>
              <Select
                  borderless
                  options={casesOptions} />
            </div>
            <div>
              <Label subtle>Judge</Label>
              <Select
                  borderless
                  options={judgesOptions} />
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
    [ALL_PARTICIPANT_CASES]: person.get(ALL_PARTICIPANT_CASES),
    getInfoForPrintInfractionRequestState: person.getIn([ACTIONS, GET_INFO_FOR_PRINT_INFRACTION, REQUEST_STATE]),
    initializeApplicationRequestState: app.getIn([ACTIONS, INITIALIZE_APPLICATION, REQUEST_STATE]),
    [INFRACTION_EVENT]: person.get(INFRACTION_EVENT),
    [INFRACTION_TYPE]: person.get(INFRACTION_TYPE),
    [JUDGES_BY_CASE]: person.get(JUDGES_BY_CASE),
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
