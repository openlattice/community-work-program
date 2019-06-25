// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Button } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import GeneralInfo from '../../components/participant/GeneralInfo';
import KeyDates from '../../components/participant/KeyDates';
import CaseInfo from '../../components/participant/CaseInfo';
import InfractionsDisplay from '../../components/participant/InfractionsDisplay';
import LogoLoader from '../../components/LogoLoader';

import {
  getCaseInfo,
  getContactInfo,
  getEnrollmentStatus,
  getParticipant,
  getParticipantInfractions,
  getParticipantAddress,
  getRequiredHours,
  getSentenceTerm,
} from './ParticipantActions';
import { goToRoute } from '../../core/router/RoutingActions';
import { OL } from '../../core/style/Colors';
import { PARTICIPANT_PROFILE_WIDTH } from '../../core/style/Sizes';
import * as Routes from '../../core/router/Routes';
import { BackNavButton } from '../../components/controls/index';
import { ButtonWrapper } from '../../components/Layout';
import { getEntityProperties } from '../../utils/DataUtils';
import { APP_TYPE_FQNS, ENROLLMENT_STATUS_FQNS, PEOPLE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { APP, PERSON, STATE } from '../../utils/constants/ReduxStateConsts';

const { STATUS } = ENROLLMENT_STATUS_FQNS;
const { FIRST_NAME, LAST_NAME } = PEOPLE_FQNS;
const {
  ACTIONS,
  ADDRESS,
  CASE_NUMBER,
  EMAIL,
  ENROLLMENT_STATUS,
  PARTICIPANT,
  PHONE,
  REQUIRED_HOURS,
  SENTENCE_TERM,
  VIOLATIONS,
  WARNINGS,
} = PERSON;

const ProfileWrapper = styled.div`
  display: flex;
  flex-direction: column;
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

const ButtonsWrapper = styled.div`
  display: flex;
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
    getEnrollmentStatus :RequestSequence;
    getParticipant :RequestSequence;
    getParticipantAddress :RequestSequence;
    getParticipantInfractions :RequestSequence;
    getRequiredHours :RequestSequence;
    getSentenceTerm :RequestSequence;
    goToRoute :RequestSequence;
  };
  address :string;
  app :Map;
  caseNumber :string;
  email :string;
  enrollmentStatus :Map;
  getInitializeAppRequestState :RequestState;
  participant :Map;
  personEKID :string;
  phone :string;
  requestStates :Map;
  requiredHours :number;
  sentenceTerm :Map;
  violations :List;
  warnings :List;
};


class ParticipantProfile extends Component<Props> {

  componentDidMount() {
    const { app } = this.props;
    if (app.get(APP_TYPE_FQNS.PEOPLE)) {
      this.loadProfile();
    }
  }

  componentDidUpdate(prevProps :Props) {
    const { app } = this.props;
    if (!prevProps.app.get(APP_TYPE_FQNS.PEOPLE) && app.get(APP_TYPE_FQNS.PEOPLE)) {
      this.loadProfile();
    }
  }

  loadProfile = () => {
    const { actions, personEKID } = this.props;
    actions.getCaseInfo({ personEKID });
    actions.getContactInfo({ personEKID });
    actions.getEnrollmentStatus({ personEKID });
    actions.getParticipant({ personEKID });
    actions.getParticipantAddress({ personEKID });
    actions.getParticipantInfractions({ personEKID });
    actions.getRequiredHours({ personEKID });
    actions.getSentenceTerm({ personEKID });
  }

  render() {
    const {
      actions,
      address,
      caseNumber,
      email,
      enrollmentStatus,
      getInitializeAppRequestState,
      participant,
      phone,
      requestStates,
      requiredHours,
      sentenceTerm,
      violations,
      warnings,
    } = this.props;

    const requestsPending :boolean = requestStates
      .find((action :Map) => action.get(PERSON.REQUEST_STATE) === RequestStates.PENDING);

    if (getInitializeAppRequestState === RequestStates.PENDING
        || requestsPending) {
      return (
        <LogoLoader
            loadingText="Please wait..."
            size={60} />
      );
    }

    const { [FIRST_NAME]: firstName, [LAST_NAME]: lastName } = getEntityProperties(
      participant, [FIRST_NAME, LAST_NAME]
    );
    const { [STATUS]: status } = getEntityProperties(enrollmentStatus, [STATUS]);

    return (
      <ProfileWrapper>
        <ProfileBody>
          <BackNavButton
              onClick={() => {
                actions.goToRoute(Routes.PARTICIPANTS);
              }}>
            Back to Participants
          </BackNavButton>
          <NameRowWrapper>
            <NameHeader>{ `${firstName} ${lastName}` }</NameHeader>
            <ButtonsWrapper>
              <ButtonWrapper>
                <Button>
                  Assign to Worksite
                </Button>
              </ButtonWrapper>
              <ButtonWrapper>
                <Button mode="primary">
                  Enroll in CWP
                </Button>
              </ButtonWrapper>
            </ButtonsWrapper>
          </NameRowWrapper>
          <BasicInfoWrapper>
            <GeneralInfo
                address={address}
                email={email}
                person={participant}
                phone={phone}
                status={status} />
            <InnerColumnWrapper>
              <KeyDates sentenceTerm={sentenceTerm} />
              <InnerRowWrapper>
                <CaseInfo caseNumber={caseNumber} hours={requiredHours} />
                <InfractionsDisplay violations={violations} warnings={warnings} />
              </InnerRowWrapper>
            </InnerColumnWrapper>
          </BasicInfoWrapper>
        </ProfileBody>
      </ProfileWrapper>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => {
  const app = state.get(STATE.APP);
  const person = state.get(STATE.PERSON);
  return {
    [ADDRESS]: person.get(ADDRESS),
    app,
    [CASE_NUMBER]: person.get(CASE_NUMBER),
    [EMAIL]: person.get(EMAIL),
    [ENROLLMENT_STATUS]: person.get(ENROLLMENT_STATUS),
    getInitializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
    [PARTICIPANT]: person.get(PARTICIPANT),
    [PHONE]: person.get(PHONE),
    requestStates: person.get(ACTIONS),
    [REQUIRED_HOURS]: person.get(REQUIRED_HOURS),
    [SENTENCE_TERM]: person.get(SENTENCE_TERM),
    [VIOLATIONS]: person.get(VIOLATIONS),
    [WARNINGS]: person.get(WARNINGS),
  };
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    getCaseInfo,
    getContactInfo,
    getEnrollmentStatus,
    getParticipant,
    getParticipantAddress,
    getParticipantInfractions,
    getRequiredHours,
    getSentenceTerm,
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ParticipantProfile);
