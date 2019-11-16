// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { CardStack } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import type { Match } from 'react-router';

import EditWorksiteForm from './EditWorksiteForm';
import EditContactsForm from './EditContactsForm';
import EditWorksiteAddressForm from './EditWorksiteAddressForm';
import LogoLoader from '../../components/LogoLoader';

import { getWorksite } from './WorksitesActions';
import { goToRoute } from '../../core/router/RoutingActions';
import { BackNavButton } from '../../components/controls/index';
import {
  getEntityKeyId,
  getEntitySetIdFromApp,
  getPropertyTypeIdFromEdm
} from '../../utils/DataUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { APP, STATE, WORKSITES } from '../../utils/constants/ReduxStateConsts';
import * as Routes from '../../core/router/Routes';

const {
  ADDRESS,
  CONTACT_INFORMATION,
  CONTACT_INFO_GIVEN,
  EMPLOYEE,
  IS,
  LOCATED_AT,
  STAFF,
  WORKS_AT,
  WORKSITE,
} = APP_TYPE_FQNS;
const {
  DATETIME_END,
  DATETIME_START,
  DESCRIPTION,
  EMAIL,
  FIRST_NAME,
  FULL_ADDRESS,
  LAST_NAME,
  NAME,
  PHONE_NUMBER,
  TITLE,
} = PROPERTY_TYPE_FQNS;
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
    goToRoute :RequestSequence;
  },
  app :Map;
  edm :Map;
  getWorksiteRequestState :RequestState;
  initializeAppRequestState :RequestState;
  match :Match;
  worksite :Map;
  worksiteAddress :Map;
  worksiteContacts :List;
};

class EditWorksiteInfoForm extends Component<Props> {

  componentDidMount() {
    const {
      actions,
      app,
      match: {
        params: { worksiteId: worksiteEKID }
      },
    } = this.props;
    if (app.get(WORKSITE) && worksiteEKID) {
      actions.getWorksite({ worksiteEKID });
    }
  }

  componentDidUpdate(prevProps :Props) {
    const {
      actions,
      app,
      match: {
        params: { worksiteId: worksiteEKID }
      },
    } = this.props;
    if (!prevProps.app.get(WORKSITE) && app.get(WORKSITE) && worksiteEKID) {
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

  createEntitySetIdsMap = () => {
    const { app } = this.props;
    return {
      [ADDRESS]: getEntitySetIdFromApp(app, ADDRESS),
      [CONTACT_INFORMATION]: getEntitySetIdFromApp(app, CONTACT_INFORMATION),
      [CONTACT_INFO_GIVEN]: getEntitySetIdFromApp(app, CONTACT_INFO_GIVEN),
      [EMPLOYEE]: getEntitySetIdFromApp(app, EMPLOYEE),
      [IS]: getEntitySetIdFromApp(app, IS),
      [LOCATED_AT]: getEntitySetIdFromApp(app, LOCATED_AT),
      [STAFF]: getEntitySetIdFromApp(app, STAFF),
      [WORKS_AT]: getEntitySetIdFromApp(app, WORKS_AT),
      [WORKSITE]: getEntitySetIdFromApp(app, WORKSITE),
    };
  }

  createPropertyTypeIdsMap = () => {
    const { edm } = this.props;
    return {
      [DATETIME_END]: getPropertyTypeIdFromEdm(edm, DATETIME_END),
      [DATETIME_START]: getPropertyTypeIdFromEdm(edm, DATETIME_START),
      [DESCRIPTION]: getPropertyTypeIdFromEdm(edm, DESCRIPTION),
      [EMAIL]: getPropertyTypeIdFromEdm(edm, EMAIL),
      [FIRST_NAME]: getPropertyTypeIdFromEdm(edm, FIRST_NAME),
      [FULL_ADDRESS]: getPropertyTypeIdFromEdm(edm, FULL_ADDRESS),
      [LAST_NAME]: getPropertyTypeIdFromEdm(edm, LAST_NAME),
      [NAME]: getPropertyTypeIdFromEdm(edm, NAME),
      [PHONE_NUMBER]: getPropertyTypeIdFromEdm(edm, PHONE_NUMBER),
      [TITLE]: getPropertyTypeIdFromEdm(edm, TITLE),
    };
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
      getWorksiteRequestState,
      initializeAppRequestState,
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
    const entitySetIds :Object = this.createEntitySetIdsMap();
    const propertyTypeIds :Object = this.createPropertyTypeIdsMap();

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
              worksiteAddress={worksiteAddress}
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
  const worksites = state.get(STATE.WORKSITES);
  return ({
    app,
    edm: state.get(STATE.EDM),
    getWorksiteRequestState: worksites.getIn([ACTIONS, GET_WORKSITE, REQUEST_STATE]),
    initializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
    [WORKSITES.WORKSITE]: worksites.get(WORKSITES.WORKSITE),
    [WORKSITE_ADDRESS]: worksites.get(WORKSITE_ADDRESS),
    [WORKSITE_CONTACTS]: worksites.get(WORKSITE_CONTACTS),
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
