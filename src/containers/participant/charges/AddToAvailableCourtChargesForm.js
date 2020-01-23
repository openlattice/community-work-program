// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { addToAvailableCourtCharges } from './ChargesActions';
import { schema, uiSchema } from './AddToAvailableCourtChargesSchemas';
import { APP, EDM, STATE } from '../../../utils/constants/ReduxStateConsts';

const { processEntityData } = DataProcessingUtils;
const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQNS } = EDM;

type Props = {
  actions:{
    addToAvailableCourtCharges :RequestSequence;
  };
  entitySetIds :Map;
  propertyTypeIds :Map;
};

type State = {
  formData :Object;
};

class AddToAvailableCourtChargesForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      formData: {},
    };
  }

  handleOnSubmit = ({ formData } :Object) => {
    const { actions, entitySetIds, propertyTypeIds } = this.props;
    const entityData = processEntityData(formData, entitySetIds, propertyTypeIds);
    actions.addToAvailableCourtCharges({ associationEntityData: {}, entityData });
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
  const selectedOrgId :string = app.get(SELECTED_ORG_ID);
  return ({
    entitySetIds: app.getIn([ENTITY_SET_IDS_BY_ORG, selectedOrgId], Map()),
    propertyTypeIds: edm.getIn([TYPE_IDS_BY_FQNS, PROPERTY_TYPES], Map()),
  });
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    addToAvailableCourtCharges,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AddToAvailableCourtChargesForm);
