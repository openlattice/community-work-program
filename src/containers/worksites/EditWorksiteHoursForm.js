// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map, fromJS } from 'immutable';
import { Card, CardHeader, CardStack } from 'lattice-ui-kit';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import type { Match } from 'react-router';

import LogoLoader from '../../components/LogoLoader';

import * as Routes from '../../core/router/Routes';
import { createWorksiteSchedule, getWorksite } from './WorksitesActions';
import { schema, uiSchema } from './schemas/EditWorksiteHoursSchemas';
import { goToRoute } from '../../core/router/RoutingActions';
import { BackNavButton } from '../../components/controls/index';
import {
  getEntityKeyId,
  getEntitySetIdFromApp,
  getPropertyTypeIdFromEdm
} from '../../utils/DataUtils';
import { getEntitiesForWorksiteSchedule } from '../../utils/ScheduleUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { APP, STATE, WORKSITES } from '../../utils/constants/ReduxStateConsts';
import type { GoToRoute } from '../../core/router/RoutingActions';

const {
  getPageSectionKey,
  processEntityData,
  processAssociationEntityData,
} = DataProcessingUtils;

const {
  APPOINTMENT,
  RELATED_TO,
  WORKSITE,
} = APP_TYPE_FQNS;
const { DATETIME_END, INCIDENT_START_DATETIME } = PROPERTY_TYPE_FQNS;

const {
  ACTIONS,
  CONTACT_EMAIL,
  CONTACT_PERSON,
  CONTACT_PHONE,
  GET_WORKSITE,
  REQUEST_STATE,
  SCHEDULE_FOR_FORM,
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
    createWorksiteSchedule :RequestSequence;
    getWorksite :RequestSequence;
    goToRoute :GoToRoute;
  },
  app :Map;
  edm :Map;
  getWorksiteRequestState :RequestState;
  initializeAppRequestState :RequestState;
  match :Match;
  scheduleForForm :Map;
  worksite :Map;
};

type State = {
  formData :Object;
  prepopulated :boolean;
};

class EditWorksiteHoursForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);
    const formData = props.scheduleForForm.toJS();
    const prepopulated = !props.scheduleForForm.isEmpty();
    this.state = {
      formData,
      prepopulated,
    };
  }

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
      scheduleForForm,
    } = this.props;
    if (!prevProps.app.get(WORKSITE) && app.get(WORKSITE) && worksiteEKID) {
      actions.getWorksite({ worksiteEKID });
    }
    if (!prevProps.scheduleForForm.equals(scheduleForForm)) {
      this.prepopulateFormData();
    }
  }

  prepopulateFormData = () => {
    const { scheduleForForm } = this.props;
    this.setState({
      formData: scheduleForForm.toJS(),
      prepopulated: true,
    });
  }

  createEntityIndexToIdMap = () => {
    const {
      worksite,
    } = this.props;
    const entityIndexToIdMap :Map = Map().withMutations((map :Map) => {
      map.setIn([WORKSITE, 0], getEntityKeyId(worksite));
    });
    return entityIndexToIdMap;
  }

  createEntitySetIdsMap = () => {
    const { app } = this.props;
    return {
      [APPOINTMENT]: getEntitySetIdFromApp(app, APPOINTMENT),
      [RELATED_TO]: getEntitySetIdFromApp(app, RELATED_TO),
      [WORKSITE]: getEntitySetIdFromApp(app, WORKSITE),
    };
  }

  createPropertyTypeIdsMap = () => {
    const { edm } = this.props;
    return {
      [DATETIME_END]: getPropertyTypeIdFromEdm(edm, DATETIME_END),
      [INCIDENT_START_DATETIME]: getPropertyTypeIdFromEdm(edm, INCIDENT_START_DATETIME),
    };
  }

  handleOnSubmit = ({ formData } :Object) => {
    const { actions, worksite } = this.props;

    const worksiteEKID :UUID = getEntityKeyId(worksite);
    const appointmentEntities = getEntitiesForWorksiteSchedule(formData);
    const associations = [];
    const entityCount :number = fromJS(appointmentEntities[getPageSectionKey(1, 1)]).count() / 2;
    for (let i = 0; i < entityCount; i += 1) {
      associations.push([RELATED_TO, worksiteEKID, WORKSITE, i, APPOINTMENT]);
    }

    const entitySetIds :Object = this.createEntitySetIdsMap();
    const propertyTypeIds :Object = this.createPropertyTypeIdsMap();
    const entityData :Object = processEntityData(appointmentEntities, entitySetIds, propertyTypeIds);
    const associationEntityData :Object = processAssociationEntityData(
      associations,
      entitySetIds,
      propertyTypeIds,
    );
    actions.createWorksiteSchedule({ associationEntityData, entityData });
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
    } = this.props;
    const { formData, prepopulated } = this.state;

    if (initializeAppRequestState === RequestStates.PENDING
      || getWorksiteRequestState === RequestStates.PENDING) {
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
            <CardHeader mode="primary" padding="sm">Edit Hours of Operation</CardHeader>
            <Form
                disabled={prepopulated}
                formData={formData}
                onSubmit={this.handleOnSubmit}
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
  const worksites = state.get(STATE.WORKSITES);
  return ({
    app,
    [CONTACT_EMAIL]: worksites.get(CONTACT_EMAIL),
    [CONTACT_PERSON]: worksites.get(CONTACT_PERSON),
    [CONTACT_PHONE]: worksites.get(CONTACT_PHONE),
    edm: state.get(STATE.EDM),
    getWorksiteRequestState: worksites.getIn([ACTIONS, GET_WORKSITE, REQUEST_STATE]),
    initializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
    [SCHEDULE_FOR_FORM]: worksites.get(SCHEDULE_FOR_FORM),
    [WORKSITES.WORKSITE]: worksites.get(WORKSITES.WORKSITE),
    [WORKSITE_ADDRESS]: worksites.get(WORKSITE_ADDRESS),
  });
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    createWorksiteSchedule,
    getWorksite,
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditWorksiteHoursForm);
