// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RouterHistory } from 'react-router';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import GeneralInfo from '../../components/participant/GeneralInfo';
import KeyDates from '../../components/participant/KeyDates';
import CaseInfo from '../../components/participant/CaseInfo';
import InfractionsDisplay from '../../components/participant/InfractionsDisplay';
import LogoLoader from '../../components/LogoLoader';

import { getCaseInfo, getContactInfo } from './ParticipantActions';
import { OL } from '../../core/style/Colors';
import { PARTICIPANT_PROFILE_WIDTH } from '../../core/style/Sizes';
import * as Routes from '../../core/router/Routes';
import {
  BackNavButton,
  PrimaryButton,
} from '../../components/controls/index';
import { ButtonWrapper } from '../../components/Layout';
import { getEntityProperties } from '../../utils/DataUtils';
import { ENROLLMENT_STATUS_FQNS, ENTITY_KEY_ID, PEOPLE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { PEOPLE, PERSON, STATE } from '../../utils/constants/ReduxStateConsts';
import { HOURS_CONSTS } from '../../core/edm/constants/DataModelConsts';

const { STATUS } = ENROLLMENT_STATUS_FQNS;
const { FIRST_NAME, LAST_NAME } = PEOPLE_FQNS;
const {
  ENROLLMENT_BY_PARTICIPANT,
  HOURS_WORKED,
  INFRACTION_COUNTS_BY_PARTICIPANT,
  PARTICIPANTS,
  SENTENCE_TERMS_BY_PARTICIPANT,
  SENTENCE_EKIDS,
} = PEOPLE;
const { CASE_NUMBER, EMAIL, PHONE } = PERSON;

const ProfileWrapper = styled.div`
  display: flex;
  flex-direction: column;
  /* justify-content: flex-start; */
  align-self: center;
  width: ${PARTICIPANT_PROFILE_WIDTH}px;
  margin-top: 30px;
  position: relative;
`;

const ProfileBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  overflow-y: auto;
  width: 100%;
  margin-bottom: 30px;
`;

const NameRowWrapper = styled.div`
  margin: 15px 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NameHeader = styled.div`
  font-size: 26px;
  font-weight: 600;
  color: ${OL.BLACK};
`;

const BasicInfoWrapper = styled.div`
  margin-top: 15px;
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const InnerColumnWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`;

const InnerRowWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

type Props = {
  actions:{
    getCaseInfo :RequestSequence;
    getContactInfo :RequestSequence;
  };
  caseNumber :string;
  email :string;
  enrollmentByParticipant :Map;
  getSentencesRequestState :RequestState;
  history :RouterHistory;
  hoursWorked :Map;
  infractionCountsByParticipant :Map;
  participants :List;
  personEKID :string;
  phone :string;
  sentenceEKIDs :Map;
  sentenceTermsByParticipant :Map;
};

type State = {
  enrollmentStatus :string,
  infractionCounts :Map;
  participant :Map;
  requiredHours :number;
  sentenceTerm :Map;
};

class ParticipantProfile extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      enrollmentStatus: '',
      infractionCounts: Map(),
      participant: Map(),
      requiredHours: 0,
      sentenceTerm: Map(),
    };
  }

  componentDidMount() {
    this.renderParticipant();
  }

  componentDidUpdate(prevProps :Props) {
    const { participants } = this.props;
    if (prevProps.participants.count() !== participants.count()) {
      this.renderParticipant();
    }
  }

  renderParticipant = () => {
    const {
      actions,
      enrollmentByParticipant,
      hoursWorked,
      infractionCountsByParticipant,
      participants,
      personEKID,
      sentenceEKIDs,
      sentenceTermsByParticipant
    } = this.props;
    const participant = participants.find((p :Map) => p.getIn([ENTITY_KEY_ID, 0]) === personEKID);
    const sentenceTerm = sentenceTermsByParticipant.get(personEKID);
    const enrollmentStatus = enrollmentByParticipant.getIn([personEKID, STATUS, 0], 'Awaiting enrollment');
    const infractionCounts = infractionCountsByParticipant.get(personEKID, Map());
    const requiredHours = hoursWorked.getIn([personEKID, HOURS_CONSTS.REQUIRED], 0);
    this.setState({
      enrollmentStatus,
      infractionCounts,
      participant,
      requiredHours,
      sentenceTerm,
    });
    if (sentenceEKIDs.count() > 0) {
      const sentenceIDs = sentenceEKIDs.get(personEKID, Map()).toJS();
      actions.getCaseInfo({ sentenceIDs });
      actions.getContactInfo({ personEKID });
    }
  }

  render() {
    const {
      caseNumber,
      email,
      getSentencesRequestState,
      history,
      phone,
    } = this.props;
    const {
      enrollmentStatus,
      infractionCounts,
      participant,
      requiredHours,
      sentenceTerm
    } = this.state;
    const { [FIRST_NAME]: firstName, [LAST_NAME]: lastName } = getEntityProperties(
      participant, [FIRST_NAME, LAST_NAME]
    );

    if (getSentencesRequestState === RequestStates.PENDING
        || getSentencesRequestState === RequestStates.STANDBY) {
      return (
        <LogoLoader
            loadingText="Please wait..."
            size={60} />
      );
    }

    return (
      <ProfileWrapper>
        <ProfileBody>
          <BackNavButton
              onClick={() => {
                history.push(Routes.PARTICIPANTS);
              }}>
            Back to Participants
          </BackNavButton>
          <NameRowWrapper>
            <NameHeader>{ `${firstName} ${lastName}` }</NameHeader>
            <ButtonWrapper>
              <PrimaryButton>
                Enroll Participant
              </PrimaryButton>
            </ButtonWrapper>
          </NameRowWrapper>
          <BasicInfoWrapper>
            <GeneralInfo
                email={email}
                person={participant}
                phone={phone}
                status={enrollmentStatus} />
            <InnerColumnWrapper>
              <KeyDates sentenceTerm={sentenceTerm} />
              <InnerRowWrapper>
                <CaseInfo caseNumber={caseNumber} hours={requiredHours} />
                <InfractionsDisplay infractions={infractionCounts} />
              </InnerRowWrapper>
            </InnerColumnWrapper>
          </BasicInfoWrapper>
        </ProfileBody>
      </ProfileWrapper>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => {
  const people = state.get(STATE.PEOPLE);
  const person = state.get(STATE.PERSON);
  return {
    [CASE_NUMBER]: person.get(CASE_NUMBER),
    [EMAIL]: person.get(EMAIL),
    [ENROLLMENT_BY_PARTICIPANT]: people.get(ENROLLMENT_BY_PARTICIPANT),
    getSentencesRequestState: people.getIn([PEOPLE.ACTIONS, PEOPLE.GET_SENTENCES, PEOPLE.REQUEST_STATE]),
    [HOURS_WORKED]: people.get(HOURS_WORKED),
    [INFRACTION_COUNTS_BY_PARTICIPANT]: people.get(INFRACTION_COUNTS_BY_PARTICIPANT),
    [PARTICIPANTS]: people.get(PARTICIPANTS),
    [PHONE]: person.get(PHONE),
    [SENTENCE_EKIDS]: people.get(SENTENCE_EKIDS),
    [SENTENCE_TERMS_BY_PARTICIPANT]: people.get(SENTENCE_TERMS_BY_PARTICIPANT),
  };
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    getCaseInfo,
    getContactInfo,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ParticipantProfile);
