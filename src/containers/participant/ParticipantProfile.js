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

import { getParticipant } from './ParticipantActions';
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

const { STATUS } = ENROLLMENT_STATUS_FQNS;
const { FIRST_NAME, LAST_NAME } = PEOPLE_FQNS;
const {
  ACTIONS,
  GET_PARTICIPANT,
  REQUEST_STATE,
  PARTICIPANT
} = PERSON;
const {
  ENROLLMENT_BY_PARTICIPANT,
  PARTICIPANTS,
  SENTENCE_TERMS_BY_PARTICIPANT,
} = PEOPLE;

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

const ModalBodyWrapper = styled.div`
  width: 400px;
  height: 110px;
  display: grid;
`;

const ActionWrapper = styled.div`
  position: fixed;
  width: 400px;
  margin-top: 85px;
  margin-bottom: 20px;
  z-index: 200;
`;

const ModalText = styled.div`
  font-size: 14px;
  color: ${OL.GREY02};
  margin: 5px 0;
  display: block;
`;

type Props = {
  actions:{
    getParticipant :RequestSequence;
  };
  enrollmentByParticipant :Map;
  // getParticipantRequestState :RequestState;
  getSentencesRequestState :RequestState;
  history :RouterHistory;
  // participant :Map;
  participants :List;
  personEKID :string;
  sentenceTermsByParticipant :Map;
};

type State = {
  enrollmentStatus :string,
  participant :Map;
  sentenceTerm :Map;
};

// add in later:
// <InnerColumnWrapper>
//   <KeyDates person={participant} />
//   <InnerRowWrapper>
//     <CaseInfo />
//     <InfractionsDisplay />
//   </InnerRowWrapper>
// </InnerColumnWrapper>

class ParticipantProfile extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      enrollmentStatus: '',
      participant: Map(),
      sentenceTerm: Map(),
    };
  }

  componentDidMount() {
    const { actions, personEKID } = this.props;
    actions.getParticipant({ personEKID });
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
      enrollmentByParticipant,
      participants,
      personEKID,
      sentenceTermsByParticipant
    } = this.props;
    const participant = participants.find((p :Map) => p.getIn([ENTITY_KEY_ID, 0]) === personEKID);
    const sentenceTerm = sentenceTermsByParticipant.get(personEKID);
    const enrollmentStatus = enrollmentByParticipant.getIn([personEKID, STATUS, 0], 'Awaiting enrollment');
    this.setState({
      enrollmentStatus,
      participant,
      sentenceTerm,
    });
  }

  render() {
    const { getSentencesRequestState, history } = this.props;
    const { enrollmentStatus, participant, sentenceTerm } = this.state;
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
            <GeneralInfo person={participant} status={enrollmentStatus} />
            <InnerColumnWrapper>
              <KeyDates sentenceTerm={sentenceTerm} />
            </InnerColumnWrapper>
          </BasicInfoWrapper>
        </ProfileBody>
      </ProfileWrapper>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => {
  // const person = state.get(STATE.PERSON);
  const people = state.get(STATE.PEOPLE);
  return {
    [ENROLLMENT_BY_PARTICIPANT]: people.get(ENROLLMENT_BY_PARTICIPANT),
    // getParticipantRequestState: person.getIn([ACTIONS, GET_PARTICIPANT, REQUEST_STATE]),
    getSentencesRequestState: people.getIn([PEOPLE.ACTIONS, PEOPLE.GET_SENTENCES, PEOPLE.REQUEST_STATE]),
    // [PARTICIPANT]: person.get(PARTICIPANT),
    [PARTICIPANTS]: people.get(PARTICIPANTS),
    [SENTENCE_TERMS_BY_PARTICIPANT]: people.get(SENTENCE_TERMS_BY_PARTICIPANT),
  };
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    getParticipant,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ParticipantProfile);
