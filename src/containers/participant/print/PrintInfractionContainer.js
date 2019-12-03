// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';
import {
  Card,
  CardSegment,
  Label,
  MinusButton,
  PlusButton,
  Select,
  Sizes,
} from 'lattice-ui-kit';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import type { Match } from 'react-router';

import LogoLoader from '../../../components/LogoLoader';
import ViolationHeader from '../../../assets/images/violation-header.png';

import { getInfoForPrintInfraction } from './PrintParticipantActions';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties } from '../../../utils/DataUtils';
import { getValuesFromEntityList } from '../utils/EditCaseInfoUtils';
import {
  APP,
  PERSON,
  PERSON_INFRACTIONS,
  STATE
} from '../../../utils/constants/ReduxStateConsts';

const { PEOPLE } = APP_TYPE_FQNS;
const {
  CASE_NUMBER_TEXT,
  CATEGORY,
  DATETIME_COMPLETED,
  DOB,
  FIRST_NAME,
  LAST_NAME,
  NOTES,
} = PROPERTY_TYPE_FQNS;
const { INITIALIZE_APPLICATION } = APP;
const {
  ACTIONS,
  ALL_PARTICIPANT_CASES,
  JUDGES_BY_CASE,
  PARTICIPANT,
  REQUEST_STATE,
} = PERSON;
const {
  GET_INFO_FOR_PRINT_INFRACTION,
  INFRACTION_EVENT,
  INFRACTION_TYPE,
} = PERSON_INFRACTIONS;
const { APP_CONTENT_WIDTH } = Sizes;

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
  max-width: ${APP_CONTENT_WIDTH}px;
  overflow-wrap: break-word;
`;

const RowWrapper = styled.div`
  display: grid;
  grid-template-columns: 300px 300px;
  grid-gap: 5px 30px;
  margin: 10px 0;
  width: 100%;
`;

const ButtonsWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
`;

const ButtonWrapper = styled.div`
  margin-left: 10px;
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

type State = {
  caseFieldRowCount :number;
}

class PrintInfractionContainer extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      caseFieldRowCount: 1
    };
  }

  componentDidMount() {
    const {
      actions,
      app,
      match: {
        params: { participantId: personEKID, infractionId: infractionEventEKID }
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
        params: { participantId: personEKID, infractionId: infractionEventEKID }
      },
    } = this.props;
    if (!prevProps.app.get(PEOPLE) && app.get(PEOPLE)) {
      actions.getInfoForPrintInfraction({ infractionEventEKID, personEKID });
    }
  }

  addCaseFieldsRow = () => {
    this.setState((prevState :Object) => (
      { caseFieldRowCount: prevState.caseFieldRowCount + 1 }
    ));
  }

  removeCaseFieldsRow = () => {
    this.setState((prevState :Object) => (
      { caseFieldRowCount: prevState.caseFieldRowCount - 1 }
    ));
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
    const { caseFieldRowCount } = this.state;

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

    const caseFieldRowArray :number[] = [];
    for (let i = 0; i < caseFieldRowCount; i += 1) {
      caseFieldRowArray.push(i);
    }

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
          {
            caseFieldRowArray.map((num :number) => (
              <div key={num}>
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
                {
                  (num === caseFieldRowArray[caseFieldRowArray.length - 1]) && (
                    <ButtonsWrapper>
                      <ButtonWrapper>
                        <MinusButton onClick={this.removeCaseFieldsRow} />
                      </ButtonWrapper>
                      <ButtonWrapper>
                        <PlusButton onClick={this.addCaseFieldsRow} />
                      </ButtonWrapper>
                    </ButtonsWrapper>
                  )
                }
              </div>
            ))
          }
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
  const infractions = state.get(STATE.INFRACTIONS);
  return {
    app,
    [ALL_PARTICIPANT_CASES]: person.get(ALL_PARTICIPANT_CASES),
    getInfoForPrintInfractionRequestState: infractions.getIn([ACTIONS, GET_INFO_FOR_PRINT_INFRACTION, REQUEST_STATE]),
    initializeApplicationRequestState: app.getIn([ACTIONS, INITIALIZE_APPLICATION, REQUEST_STATE]),
    [INFRACTION_EVENT]: infractions.get(INFRACTION_EVENT),
    [INFRACTION_TYPE]: infractions.get(INFRACTION_TYPE),
    [JUDGES_BY_CASE]: person.get(JUDGES_BY_CASE),
    [PARTICIPANT]: person.get(PARTICIPANT),
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    getInfoForPrintInfraction,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(PrintInfractionContainer);
