// @flow
import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { CardStack } from 'lattice-ui-kit';
import { ReduxUtils } from 'lattice-utils';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { Match } from 'react-router';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import EditAddressForm from './contacts/EditAddressForm';
import EditEmailForm from './contacts/EditEmailForm';
import EditPersonForm from './EditPersonForm';
import EditPersonPhotoForm from './EditPersonPhotoForm';
import EditPhoneForm from './contacts/EditPhoneForm';
import { getInfoForEditPerson } from './ParticipantActions';

import LogoLoader from '../../components/LogoLoader';
import * as Routes from '../../core/router/Routes';
import { BackNavButton } from '../../components/controls/index';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { goToRoute } from '../../core/router/RoutingActions';
import { PARTICIPANT_PROFILE_WIDTH } from '../../core/style/Sizes';
import { getEntityKeyId } from '../../utils/DataUtils';
import {
  APP,
  PERSON,
  PERSON_CONTACTS,
  STATE
} from '../../utils/constants/ReduxStateConsts';
import type { GoToRoute } from '../../core/router/RoutingActions';

const { isPending, reduceRequestStates } = ReduxUtils;
const { PEOPLE } = APP_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const {
  ACTIONS,
  GET_INFO_FOR_EDIT_PERSON,
  PARTICIPANT,
  PERSON_PHOTO,
  REQUEST_STATE,
} = PERSON;
const { EMAIL, PERSON_ADDRESS, PHONE } = PERSON_CONTACTS;

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
    getInfoForEditPerson :RequestSequence;
    goToRoute :GoToRoute;
  },
  email :Map;
  entitySetIds :Map;
  match :Match;
  participant :Map;
  personAddress :Map;
  personPhoto :Map;
  phone :Map;
  requestStates :{
    initializeApplication :RequestState;
    getInfoForEditPerson :RequestState;
  };
};

class EditPersonAndContactsForm extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const {
      actions,
      entitySetIds,
      match: {
        params: { participantId: personEKID }
      }
    } = this.props;
    if (!prevProps.entitySetIds.get(PEOPLE) && entitySetIds.get(PEOPLE) && personEKID) {
      actions.getInfoForEditPerson({ personEKID });
    }
  }

  handleOnClickBackButton = () => {
    const {
      actions,
      participant,
    } = this.props;
    const participantEKID :UUID = getEntityKeyId(participant);
    actions.goToRoute(Routes.PARTICIPANT_PROFILE.replace(':participantId', participantEKID));
  }

  render() {
    const {
      email,
      match,
      participant,
      personAddress,
      personPhoto,
      phone,
      requestStates,
    } = this.props;

    const reducedRequestState = reduceRequestStates([
      requestStates[APP.INITIALIZE_APPLICATION],
      requestStates[GET_INFO_FOR_EDIT_PERSON]
    ]);
    if (isPending(reducedRequestState)) {
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
          <EditPersonForm participant={participant} />
          <EditPhoneForm participant={participant} phone={phone} />
          <EditEmailForm email={email} participant={participant} />
          <EditAddressForm address={personAddress} match={match} participant={participant} />
          <EditPersonPhotoForm participant={participant} personPhoto={personPhoto} />
        </CardStack>
      </FormWrapper>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const app = state.get(STATE.APP);
  const edm = state.get(STATE.EDM);
  const person = state.get(STATE.PERSON);
  const personContacts = state.get(STATE.PERSON_CONTACTS);
  const selectedOrgId :string = app.get(SELECTED_ORG_ID);
  return ({
    [EMAIL]: personContacts.get(EMAIL, Map()),
    [PARTICIPANT]: person.get(PARTICIPANT),
    [PERSON_ADDRESS]: personContacts.get(PERSON_ADDRESS, Map()),
    [PERSON_PHOTO]: person.get(PERSON_PHOTO),
    [PHONE]: personContacts.get(PHONE, Map()),
    app,
    edm,
    entitySetIds: app.getIn([ENTITY_SET_IDS_BY_ORG, selectedOrgId], Map()),
    requestStates: {
      [APP.INITIALIZE_APPLICATION]: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
      [GET_INFO_FOR_EDIT_PERSON]: person.getIn([ACTIONS, GET_INFO_FOR_EDIT_PERSON, REQUEST_STATE]),
    },
  });
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    getInfoForEditPerson,
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditPersonAndContactsForm);
