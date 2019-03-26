// @flow
import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { Map } from 'immutable';

import ParticipantsSearchContainer from './ParticipantsSearchContainer';
import ParticipantProfile from '../participant/ParticipantProfile';

import * as Routes from '../../core/router/Routes';

type State = {
  selectedPerson :Map;
  selectedContactInfo :Map;
};

type Props = {
};

class ParticipantsContainer extends Component<Props, State> {
  constructor(props :Props) {
    super(props);

    this.state = {
      selectedPerson: Map(),
      selectedContactInfo: Map(),
    };
  }

  selectPerson = (selectedPerson :Map, selectedContactInfo :Map) => {
    this.setState({ selectedPerson, selectedContactInfo });
  }

  render() {
    const { selectedPerson, selectedContactInfo } = this.state;
    return (
      <Switch>
        <Route
            path={Routes.PARTICIPANT_PROFILE}
            render={props => (
              <ParticipantProfile
                  contactInfo={selectedContactInfo}
                  person={selectedPerson}
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
