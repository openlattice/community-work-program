// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';
import { Card, CardHeader, CardStack } from 'lattice-ui-kit';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import type { Match } from 'react-router';

import LogoLoader from '../../components/LogoLoader';

import * as Routes from '../../core/router/Routes';
import { getInfoForAddParticipant } from '../participant/ParticipantActions';
import { goToRoute } from '../../core/router/RoutingActions';
import { hydrateSchema } from './utils/AddParticipantFormUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { schema, uiSchema } from './schemas/AddParticipantFormSchemas';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getPropertyTypeIdFromEdm
} from '../../utils/DataUtils';
import { BackNavButton } from '../../components/controls/index';
import { PARTICIPANT_PROFILE_WIDTH } from '../../core/style/Sizes';
import { APP, PERSON, STATE } from '../../utils/constants/ReduxStateConsts';
// import type { GoToRoute } from '../../core/router/RoutingActions';

const {
  ACTIONS,
  CHARGES,
  GET_INFO_FOR_ADD_PARTICIPANT,
  JUDGES,
  REQUEST_STATE,
} = PERSON;

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-self: center;
  width: ${PARTICIPANT_PROFILE_WIDTH}px;
  margin-top: 30px;
  position: relative;
`;

const ButtonWrapper = styled.div`
  margin-bottom: 30px;
`;

type Props = {
  actions:{
    getInfoForAddParticipant :RequestSequence;
    goToRoute :RequestSequence;
  };
  app :Map;
  charges :List;
  getInfoRequestState :RequestState;
  initializeAppRequestState :RequestState;
  judges :List;
};

type State = {
  formData :Object;
  formSchema :Object;
};

class AddParticipantForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      formData: {},
      formSchema: schema,
    };
  }

  componentDidMount() {
    const { actions, app } = this.props;
    if (app.get(APP_TYPE_FQNS.JUDGES)) {
      actions.getInfoForAddParticipant();
    }
  }

  componentDidUpdate(prevProps :Props) {
    const { actions, app } = this.props;
    if (!prevProps.app.get(APP_TYPE_FQNS.JUDGES) && app.get(APP_TYPE_FQNS.JUDGES)) {
      actions.getInfoForAddParticipant();
    }
  }

  prepopulateFormData = () => {
    
  }

  handleOnClickBackButton = () => {
    const { actions } = this.props;
    actions.goToRoute(Routes.PARTICIPANTS);
  }

  render() {
    const { getInfoRequestState, initializeAppRequestState } = this.props;
    const { formData } = this.state;

    if (initializeAppRequestState === RequestStates.PENDING
        || getInfoRequestState === RequestStates.PENDING) {
      return (
        <LogoLoader
            loadingText="Please wait..."
            size={60} />
      );
    }

    return (
      <FormWrapper>
        <ButtonWrapper>
          <BackNavButton
              onClick={this.handleOnClickBackButton}>
            Back to Profile
          </BackNavButton>
        </ButtonWrapper>
        <CardStack>
          <Card>
            <CardHeader mode="primary" padding="sm">Add New Participant</CardHeader>
            <Form
                formContext={{}}
                formData={formData}
                schema={schema}
                uiSchema={uiSchema} />
          </Card>
        </CardStack>
      </FormWrapper>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const app = state.get(STATE.APP);
  const person = state.get(STATE.PERSON);
  return ({
    app,
    [CHARGES]: person.get(CHARGES),
    edm: state.get(STATE.EDM),
    getInfoRequestState: person.getIn([ACTIONS, GET_INFO_FOR_ADD_PARTICIPANT, REQUEST_STATE]),
    initializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
    [JUDGES]: person.get(JUDGES),
  });
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    getInfoForAddParticipant,
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AddParticipantForm);
