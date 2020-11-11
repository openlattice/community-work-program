/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { CardStack } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { Match } from 'react-router';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import EditContactsForm from './EditContactsForm';
import EditWorksiteAddressForm from './EditWorksiteAddressForm';
import EditWorksiteForm from './EditWorksiteForm';
import { getWorksite } from './WorksitesActions';

import LogoLoader from '../../components/LogoLoader';
import * as Routes from '../../core/router/Routes';
import { BackNavButton } from '../../components/controls/index';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { goToRoute } from '../../core/router/RoutingActions';
import { getEntityKeyId } from '../../utils/DataUtils';
import {
  APP,
  EDM,
  STATE,
  WORKSITES
} from '../../utils/constants/ReduxStateConsts';
import type { GoToRoute } from '../../core/router/RoutingActions';

const {
  ADDRESS,
  CONTACT_INFORMATION,
  STAFF,
  WORKSITE,
} = APP_TYPE_FQNS;
const { EMAIL, PHONE_NUMBER } = PROPERTY_TYPE_FQNS;

const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQNS } = EDM;
const {
  ACTIONS,
  GET_WORKSITE,
  REQUEST_STATE,
  WORKSITE_ADDRESS,
  WORKSITE_CONTACTS,
} = WORKSITES;

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-self: center;
  width: 960px;
  margin-top: 30px;
  position: relative;
`;

const ButtonWrapper = styled.div`
  margin-bottom: 30px;
`;

type Props = {
  actions:{
    getWorksite :RequestSequence;
    goToRoute :GoToRoute;
  },
  entitySetIds :Map;
  getWorksiteRequestState :RequestState;
  initializeAppRequestState :RequestState;
  match :Match;
  propertyTypeIds :Map;
  worksite :Map;
  worksiteAddress :Map;
  worksiteContacts :List;
};

class EditWorksiteInfoForm extends Component<Props> {

  componentDidMount() {
    const {
      actions,
      entitySetIds,
      match: {
        params: { worksiteId: worksiteEKID }
      },
    } = this.props;
    if (entitySetIds.has(WORKSITE) && worksiteEKID) {
      actions.getWorksite({ worksiteEKID });
    }
  }

  componentDidUpdate(prevProps :Props) {
    const {
      actions,
      entitySetIds,
      match: {
        params: { worksiteId: worksiteEKID }
      },
    } = this.props;
    if ((!prevProps.entitySetIds.has(WORKSITE) && entitySetIds.has(WORKSITE)) && worksiteEKID) {
      actions.getWorksite({ worksiteEKID });
    }
  }

  createEntityIndexToIdMap = () => {
    const {
      worksite,
      worksiteAddress,
      worksiteContacts,
    } = this.props;

    const personEKIDs :UUID[] = [];
    const phoneEKIDs :UUID[] = [];
    const emailEKIDs :UUID[] = [];
    worksiteContacts.forEach((contactMap :Map) => {
      const person = contactMap.get(STAFF);
      personEKIDs.push(getEntityKeyId(person));
      const phone = contactMap.get(PHONE_NUMBER);
      phoneEKIDs.push(getEntityKeyId(phone));
      const email = contactMap.get(EMAIL);
      emailEKIDs.push(getEntityKeyId(email));
    });
    const entityIndexToIdMap :Map = Map().withMutations((map :Map) => {
      map.setIn([ADDRESS, 0], getEntityKeyId(worksiteAddress));
      map.setIn([CONTACT_INFORMATION, -1], phoneEKIDs);
      map.setIn([CONTACT_INFORMATION, -2], emailEKIDs);
      map.setIn([STAFF, -1], personEKIDs);
      map.setIn([WORKSITE, 0], getEntityKeyId(worksite));
    });
    return entityIndexToIdMap;
  }

  handleOnClickBackButton = () => {
    const {
      actions,
      match: {
        params: { worksiteId: worksiteEKID }
      },
    } = this.props;
    if (worksiteEKID) {
      actions.goToRoute(Routes.WORKSITE_PROFILE.replace(':worksiteId', worksiteEKID));
    }
  }

  render() {
    const {
      entitySetIds,
      getWorksiteRequestState,
      initializeAppRequestState,
      propertyTypeIds,
      worksite,
      worksiteAddress,
      worksiteContacts,
    } = this.props;

    if (initializeAppRequestState === RequestStates.PENDING
      || getWorksiteRequestState === RequestStates.PENDING) {
      return (
        <LogoLoader
            loadingText="Please wait..."
            size={60} />
      );
    }

    const entityIndexToIdMap :Object = this.createEntityIndexToIdMap();

    return (
      <FormWrapper>
        <ButtonWrapper>
          <BackNavButton
              onClick={this.handleOnClickBackButton}>
            Back to Profile
          </BackNavButton>
        </ButtonWrapper>
        <CardStack>
          <EditWorksiteForm
              entityIndexToIdMap={entityIndexToIdMap}
              entitySetIds={entitySetIds}
              propertyTypeIds={propertyTypeIds}
              worksite={worksite} />
          <EditContactsForm
              entityIndexToIdMap={entityIndexToIdMap}
              entitySetIds={entitySetIds}
              propertyTypeIds={propertyTypeIds}
              worksite={worksite}
              worksiteContacts={worksiteContacts} />
          <EditWorksiteAddressForm
              entityIndexToIdMap={entityIndexToIdMap}
              entitySetIds={entitySetIds}
              propertyTypeIds={propertyTypeIds}
              worksite={worksite}
              worksiteAddress={worksiteAddress} />
        </CardStack>
      </FormWrapper>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const app = state.get(STATE.APP);
  const edm = state.get(STATE.EDM);
  const worksites = state.get(STATE.WORKSITES);
  const selectedOrgId :string = app.get(SELECTED_ORG_ID);
  return ({
    [WORKSITES.WORKSITE]: worksites.get(WORKSITES.WORKSITE),
    [WORKSITE_ADDRESS]: worksites.get(WORKSITE_ADDRESS),
    [WORKSITE_CONTACTS]: worksites.get(WORKSITE_CONTACTS),
    entitySetIds: app.getIn([ENTITY_SET_IDS_BY_ORG, selectedOrgId], Map()),
    getWorksiteRequestState: worksites.getIn([ACTIONS, GET_WORKSITE, REQUEST_STATE]),
    initializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
    propertyTypeIds: edm.getIn([TYPE_IDS_BY_FQNS, PROPERTY_TYPES], Map()),
  });
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    getWorksite,
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditWorksiteInfoForm);
