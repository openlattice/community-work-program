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

import { getAllParticipantInfo } from './ParticipantActions';
import { goToRoute } from '../../core/router/RoutingActions';
import { OL } from '../../core/style/Colors';
import { PARTICIPANT_PROFILE_WIDTH } from '../../core/style/Sizes';
import * as Routes from '../../core/router/Routes';
import { BackNavButton } from '../../components/controls/index';
import { ButtonWrapper, ButtonsWrapper } from '../../components/Layout';
import { getEntityProperties } from '../../utils/DataUtils';
import { isDefined } from '../../utils/LangUtils';
import { APP_TYPE_FQNS, ENROLLMENT_STATUS_FQNS, PEOPLE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { ENROLLMENT_STATUSES } from '../../core/edm/constants/DataModelConsts';
import { APP, PERSON, STATE } from '../../utils/constants/ReduxStateConsts';

const { STATUS } = ENROLLMENT_STATUS_FQNS;
const { FIRST_NAME, LAST_NAME } = PEOPLE_FQNS;
const {
  ACTIONS,
  ADDRESS,
  CASE_NUMBER,
  EMAIL,
  ENROLLMENT_STATUS,
  GET_ALL_PARTICIPANT_INFO,
  PARTICIPANT,
  PHONE,
  REQUEST_STATE,
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
    getAllParticipantInfo :RequestSequence;
    goToRoute :RequestSequence;
  };
  address :string;
  app :Map;
  caseNumber :string;
  email :string;
  enrollmentStatus :Map;
  getAllParticipantInfoRequestState :RequestState;
  getInitializeAppRequestState :RequestState;
  participant :Map;
  personEKID :string;
  phone :string;
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
    actions.getAllParticipantInfo({ personEKID });
  }

  render() {
    const {
      actions,
      address,
      caseNumber,
      email,
      enrollmentStatus,
      getAllParticipantInfoRequestState,
      getInitializeAppRequestState,
      participant,
      phone,
      requiredHours,
      sentenceTerm,
      violations,
      warnings,
    } = this.props;

    if (getInitializeAppRequestState === RequestStates.PENDING
        || getAllParticipantInfoRequestState === RequestStates.PENDING) {
      return (
        <LogoLoader
            loadingText="Please wait..."
            size={60} />
      );
    }

    const { [FIRST_NAME]: firstName, [LAST_NAME]: lastName } = getEntityProperties(
      participant, [FIRST_NAME, LAST_NAME]
    );
    let { [STATUS]: status } = getEntityProperties(enrollmentStatus, [STATUS]);
    if (!isDefined(status)) status = ENROLLMENT_STATUSES.AWAITING_CHECKIN;

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
    getAllParticipantInfoRequestState: person.getIn([ACTIONS, GET_ALL_PARTICIPANT_INFO, REQUEST_STATE]),
    getInitializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
    [PARTICIPANT]: person.get(PARTICIPANT),
    [PHONE]: person.get(PHONE),
    [REQUIRED_HOURS]: person.get(REQUIRED_HOURS),
    [SENTENCE_TERM]: person.get(SENTENCE_TERM),
    [VIOLATIONS]: person.get(VIOLATIONS),
    [WARNINGS]: person.get(WARNINGS),
  };
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    getAllParticipantInfo,
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ParticipantProfile);
