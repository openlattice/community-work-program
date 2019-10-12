// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import {
  List,
  Map,
  fromJS,
  getIn,
} from 'immutable';
import { DateTime } from 'luxon';
import {
  Card,
  CardHeader,
  CardStack
} from 'lattice-ui-kit';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import type { Match } from 'react-router';

import { schema, uiSchema } from './AddToAvailableChargesSchemas';
import { getEntitySetIdFromApp, getPropertyTypeIdFromEdm } from '../../../utils/DataUtils';
import { APP_TYPE_FQNS, CHARGE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { STATE } from '../../../utils/constants/ReduxStateConsts';

const {
  processEntityData,
} = DataProcessingUtils;
const { COURT_CHARGE_LIST } = APP_TYPE_FQNS;
const { NAME, OL_ID } = CHARGE_FQNS;

type Props = {
  app :Map;
  edm :Map;
};

type State = {
  formData :Object;
};

class AddToAvailableChargesForm extends Component<Props, State> {

  state = {
    formData: {},
  };

  handleOnSubmit = ({ formData } :Object) => {
    const { app, edm } = this.props;

    const entitySetIds :{} = {
      [COURT_CHARGE_LIST]: getEntitySetIdFromApp(app, COURT_CHARGE_LIST),
    };
    const propertyTypeIds :{} = {
      [NAME]: getPropertyTypeIdFromEdm(edm, NAME),
      [OL_ID]: getPropertyTypeIdFromEdm(edm, OL_ID),
    };
    const entityData = processEntityData(formData, entitySetIds, propertyTypeIds);
    // actions.addCharge({ associationEntityData: {}, entityData });
  }

  render() {
    const { formData } = this.state;
    return (
      <Form
          formData={formData}
          onSubmit={this.handleOnSubmit}
          schema={schema}
          uiSchema={uiSchema} />
    );
  }
}

const mapStateToProps = (state :Map) => {
  const app = state.get(STATE.APP);
  const edm = state.get(STATE.EDM);
  return ({
    app,
    edm,
  });
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AddToAvailableChargesForm);
