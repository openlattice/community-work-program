// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { withRouter } from 'react-router-dom';
import type { Match, RouterHistory } from 'react-router';
import { Modal } from 'lattice-ui-kit';

import GeneralInfo from '../../components/participant/GeneralInfo';
import KeyDates from '../../components/participant/KeyDates';
import CaseInfo from '../../components/participant/CaseInfo';
import ParticipantWorkSchedule from '../schedule/ParticipantWorkSchedule';
import ViolationsDisplay from '../../components/participant/ViolationsDisplay';
import WarningsViolationsContainer from '../violations/WarningsViolationsContainer';
import * as Routes from '../../core/router/Routes';

import {
  BackNavButton,
  PrimaryButton,
  TertiaryButtonLink,
  StyledSelect,
} from '../../components/controls/index';
import { ButtonWrapper } from '../../components/Layout';
import { emotionStyles } from '../../components/controls/dropdowns/StyledSelect';
import { PARTICIPANT_PROFILE_WIDTH } from '../../core/style/Sizes';
import { OL } from '../../utils/constants/Colors';
import { participantStatuses } from '../participants/ParticipantsConstants';

const ProfileWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-self: center;
  width: ${PARTICIPANT_PROFILE_WIDTH}px;
  margin-top: 30px;
  position: relative;
`;

const ProfileBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-y: auto;
  width: 100%;
  margin-bottom: 30px;
`;

const NameRowWrapper = styled.div`
  margin: 15px 0;
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
  contactInfo :Map;
  history :RouterHistory;
  match :Match;
  person :Map;
};

type State = {
  isEnrollmentModalVisible :boolean;
};

class ParticipantProfile extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      isEnrollmentModalVisible: false,
    };
  }

  changeEnrollmentStatus = () => {
    const { person } = this.props;
  }

  getProgramAction = () => {
    const { person } = this.props;
    const status = person.get('status');
    if (status === 'Active' || status === 'Noncompliant - active') {
      return 'End';
    }
    return 'Start';
  }

  hideEnrollmentModal = () => {
    this.setState({ isEnrollmentModalVisible: false });
  }

  renderEnrollmentModal = () => {
    const { person } = this.props;
    const { isEnrollmentModalVisible } = this.state;
    const programAction = this.getProgramAction();
    const modalTitle = programAction === 'Start' ? 'Enroll Participant' : 'Unenroll Participant';
    const name = person.get('name');
    const question = `Are you sure you want to ${programAction.toLowerCase()} the community work program for ${name}?`;
    return (
      <Modal
          isVisible={isEnrollmentModalVisible}
          onClickSecondary={this.hideEnrollmentModal}
          onClose={this.hideEnrollmentModal}
          shouldCloseOnOutsideClick={false}
          shouldStretchButtons
          textPrimary="Update"
          textSecondary="Close"
          textTitle={modalTitle}>
        <ModalBodyWrapper>
          <ModalText>{question}</ModalText>
          <ModalText>If so, please update participant status:</ModalText>
          <ActionWrapper>
            <StyledSelect
                options={participantStatuses}
                styles={emotionStyles} />
          </ActionWrapper>
        </ModalBodyWrapper>
      </Modal>
    );
  }

  reportWarningOrViolation = () => {
    // const { history, match } = this.props;
    // const { subjectId } = match.params;
    // if (subjectId) {
    //   history.push(Routes.WARNINGS_VIOLATIONS_FORM.replace(':subjectId', subjectId));
    // }
    const { history, person } = this.props;
    history.push(Routes.WARNINGS_VIOLATIONS_FORM.replace(':subjectId', person.get('personId')));
  }

  showEnrollmentModal = () => {
    this.setState({ isEnrollmentModalVisible: true });
  }

  render() {
    const { contactInfo, history, person } = this.props;
    const programAction = this.getProgramAction();
    const buttonText = `${programAction} Program`;
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
            <NameHeader>{person.get('name')}</NameHeader>
            <PrimaryButton
                onClick={this.showEnrollmentModal}>
              {buttonText}
            </PrimaryButton>
            { this.renderEnrollmentModal() }
          </NameRowWrapper>
          <BasicInfoWrapper>
            <GeneralInfo
                contactInfo={contactInfo}
                person={person} />
            <InnerColumnWrapper>
              <KeyDates
                  person={person} />
              <InnerRowWrapper>
                <CaseInfo />
                <ViolationsDisplay />
              </InnerRowWrapper>
            </InnerColumnWrapper>
          </BasicInfoWrapper>
        </ProfileBody>
        <ProfileBody>
          <NameRowWrapper>
            <NameHeader>Work Schedule</NameHeader>
          </NameRowWrapper>
          <ParticipantWorkSchedule
              person={person} />
        </ProfileBody>
        <ProfileBody>
          <NameRowWrapper>
            <NameHeader>Warnings & Violations</NameHeader>
            <ButtonWrapper>
              <TertiaryButtonLink
                  to={Routes.WARNINGS_VIOLATIONS_FORM.replace(':subjectId', person.get('personId'))}>
                Report Warning or Violation
              </TertiaryButtonLink>
            </ButtonWrapper>
          </NameRowWrapper>
          <WarningsViolationsContainer />
        </ProfileBody>
      </ProfileWrapper>
    );
  }
}

export default withRouter(ParticipantProfile);
