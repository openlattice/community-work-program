// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { CardStack } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import type { Match } from 'react-router';

import EditWorksiteForm from './EditWorksiteForm';
import EditContactsForm from './EditContactsForm';
import LogoLoader from '../../components/LogoLoader';

import { getWorksite } from './WorksitesActions';
import { goToRoute } from '../../core/router/RoutingActions';
import { BackNavButton } from '../../components/controls/index';
import {
  getEntityKeyId,
  getEntitySetIdFromApp,
  getPropertyTypeIdFromEdm
} from '../../utils/DataUtils';
import {
  ADDRESS_FQNS,
  APP_TYPE_FQNS,
  CONTACT_INFO_FQNS,
  EMPLOYEE_FQNS,
  PEOPLE_FQNS,
  WORKSITE_FQNS,
} from '../../core/edm/constants/FullyQualifiedNames';
import { APP, STATE, WORKSITES } from '../../utils/constants/ReduxStateConsts';
import * as Routes from '../../core/router/Routes';

const { FULL_ADDRESS } = ADDRESS_FQNS;
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
const { EMAIL, PHONE_NUMBER } = CONTACT_INFO_FQNS;
const { TITLE } = EMPLOYEE_FQNS;
const { FIRST_NAME, LAST_NAME } = PEOPLE_FQNS;
const {
  DATETIME_END,
  DATETIME_START,
  DESCRIPTION,
  NAME,
} = WORKSITE_FQNS;
const {
  ACTIONS,
  CONTACT_EMAIL,
  CONTACT_PERSON,
  CONTACT_PHONE,
  GET_WORKSITE,
  REQUEST_STATE,
  WORKSITE_ADDRESS,
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
  contactEmail :Map;
  contactPerson :Map;
  contactPhone :Map;
  edm :Map;
  getWorksiteRequestState :RequestState;
  initializeAppRequestState :RequestState;
  match :Match;
  worksite :Map;
  worksiteAddress :Map;
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
      contactEmail,
      contactPerson,
      contactPhone,
      worksite,
      worksiteAddress,
    } = this.props;
    const entityIndexToIdMap :Map = Map().withMutations((map :Map) => {
      map.setIn([ADDRESS, 0], getEntityKeyId(worksiteAddress));
      map.setIn([CONTACT_INFORMATION, 0], getEntityKeyId(contactPhone));
      map.setIn([CONTACT_INFORMATION, 1], getEntityKeyId(contactEmail));
      map.setIn([STAFF, 0], getEntityKeyId(contactPerson));
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
    actions.goToRoute(Routes.WORKSITE_PROFILE.replace(':worksiteId', worksiteEKID));
  }

  render() {
    const {
      contactEmail,
      contactPerson,
      contactPhone,
      getWorksiteRequestState,
      initializeAppRequestState,
      worksite,
      worksiteAddress,
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
              contactEmail={contactEmail}
              contactPerson={contactPerson}
              contactPhone={contactPhone}
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
    [CONTACT_EMAIL]: worksites.get(CONTACT_EMAIL),
    [CONTACT_PERSON]: worksites.get(CONTACT_PERSON),
    [CONTACT_PHONE]: worksites.get(CONTACT_PHONE),
    edm: state.get(STATE.EDM),
    getWorksiteRequestState: worksites.getIn([ACTIONS, GET_WORKSITE, REQUEST_STATE]),
    initializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
    [WORKSITES.WORKSITE]: worksites.get(WORKSITES.WORKSITE),
    [WORKSITE_ADDRESS]: worksites.get(WORKSITE_ADDRESS),
  });
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    getWorksite,
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditWorksiteInfoForm);
