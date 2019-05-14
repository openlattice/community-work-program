// @flow
import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { Map } from 'immutable';
import type { RouterHistory } from 'react-router';

import ParticipantsSearchContainer from './ParticipantsSearchContainer';
import ParticipantProfile from '../participant/ParticipantProfile';
import NewWarningViolationContainer from '../violations/NewWarningViolationContainer';
import NewAppointmentContainer from '../schedule/NewAppointmentContainer';
import EditModal from '../edit/EditModal';
import EditGeneralInfo from '../../components/participant/EditGeneralInfo';
import EditCaseNumber from '../../components/participant/EditCaseNumber';
import * as Routes from '../../core/router/Routes';


type State = {
  isEditModalVisible :boolean;
  selectedPerson :Map;
  selectedContactInfo :Map;
};

type Props = {
  history :RouterHistory;
};

class ParticipantsContainer extends Component<Props, State> {
  constructor(props :Props) {
    super(props);

    this.state = {
      isEditModalVisible: false,
      selectedPerson: Map(),
      selectedContactInfo: Map(),
    };
  }

  renderModalVisible = () => {
    this.setState({ isEditModalVisible: true });
  }

  renderModalNotVisible = () => {
    const { history } = this.props;
    const { selectedPerson } = this.state;
    this.setState({ isEditModalVisible: false });
    history.push(Routes.PARTICIPANT_PROFILE.replace(':subjectId', selectedPerson.get('personId')));
  }

  selectPerson = (selectedPerson :Map, selectedContactInfo :Map) => {
    this.setState({ selectedPerson, selectedContactInfo });
  }

  render() {
    const { isEditModalVisible, selectedPerson, selectedContactInfo } = this.state;
    return (
      <Switch>
        <Route
            path={Routes.WARNINGS_VIOLATIONS_FORM}
            render={props => (
              <NewWarningViolationContainer
                  person={selectedPerson}
                  {...props} />
            )} />
        <Route
            path={Routes.NEW_APPOINTMENT}
            render={props => (
              <NewAppointmentContainer
                  person={selectedPerson}
                  {...props} />
            )} />
        <Route
            path={Routes.PARTICIPANT_GENERAL_INFO_EDIT}
            render={props => (
              <EditModal
                  body={EditGeneralInfo}
                  formData={Map()}
                  isVisible={isEditModalVisible}
                  onClose={this.renderModalNotVisible}
                  person={selectedPerson}
                  textPrimary="Submit"
                  textTitle="Edit General Info"
                  {...props} />
            )} />
        <Route
            path={Routes.PARTICIPANT_CASE_EDIT}
            render={props => (
              <EditModal
                  body={EditCaseNumber}
                  formData={Map()}
                  isVisible={isEditModalVisible}
                  onClose={this.renderModalNotVisible}
                  person={selectedPerson}
                  textPrimary="Submit"
                  textTitle="Edit Case Number"
                  {...props} />
            )} />
        <Route
            path={Routes.PARTICIPANT_PROFILE}
            render={props => (
              <ParticipantProfile
                  contactInfo={selectedContactInfo}
                  person={selectedPerson}
                  renderModalVisible={this.renderModalVisible}
                  {...props} />
            )} />
        <Route
            render={() => (
              <ParticipantsSearchContainer
                  selectPerson={this.selectPerson} />
            )} />
      </Switch>
    );
  }
}

export default ParticipantsContainer;
