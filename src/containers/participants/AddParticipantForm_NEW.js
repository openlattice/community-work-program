// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
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
import { goToRoute } from '../../core/router/RoutingActions';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { schema, uiSchema } from './AddParticipantFormSchemas';
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
    goToRoute :RequestSequence;
  }
};

type State = {
  formData :Object;
};

class AddParticipantForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      formData: {}
    };
  }

  handleOnClickBackButton = () => {
    const { actions } = this.props;
    actions.goToRoute(Routes.PARTICIPANTS);
  }

  render() {
    const { formData } = this.state;
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

export default AddParticipantForm;
