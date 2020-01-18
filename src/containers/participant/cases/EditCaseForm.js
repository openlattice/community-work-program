// @flow
import React, { Component } from 'react';
import { Map, fromJS } from 'immutable';
import { Card, CardHeader } from 'lattice-ui-kit';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { createCase, editPersonCase } from '../ParticipantActions';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { caseSchema, caseUiSchema } from './schemas/EditCaseInfoSchemas';
import { getEntityProperties } from '../../../utils/DataUtils';

const {
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData,
} = DataProcessingUtils;

const {
  APPEARS_IN,
  DIVERSION_PLAN,
  MANUAL_PRETRIAL_COURT_CASES,
  PEOPLE,
  RELATED_TO,
} = APP_TYPE_FQNS;
const { CASE_NUMBER_TEXT, COURT_CASE_TYPE } = PROPERTY_TYPE_FQNS;

type Props = {
  actions:{
    createCase :RequestSequence;
    editPersonCase :RequestSequence;
  },
  diversionPlanEKID :UUID;
  entityIndexToIdMap :Map;
  entitySetIds :Object;
  personCase :Map;
  personEKID :UUID;
  propertyTypeIds :Object;
};

type State = {
  caseFormData :Object;
  casePrepopulated :boolean;
};

class EditCaseForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      caseFormData: {},
      casePrepopulated: false,
    };
  }

  componentDidMount() {
    this.prepopulateFormData();
  }

  componentDidUpdate(prevProps :Props) {
    const { personCase } = this.props;
    if (!prevProps.personCase.equals(personCase)) {
      this.prepopulateFormData();
    }
  }

  prepopulateFormData = () => {
    const { personCase } = this.props;

    const sectionOneKey = getPageSectionKey(1, 1);
    const { [CASE_NUMBER_TEXT]: caseNumbers, [COURT_CASE_TYPE]: courtCaseType } = getEntityProperties(
      personCase, [CASE_NUMBER_TEXT, COURT_CASE_TYPE]
    );
    const casePrepopulated = !personCase.isEmpty();
    const caseFormData :{} = casePrepopulated
      ? {
        [sectionOneKey]: {
          [getEntityAddressKey(0, MANUAL_PRETRIAL_COURT_CASES, COURT_CASE_TYPE)]: courtCaseType,
          [getEntityAddressKey(0, MANUAL_PRETRIAL_COURT_CASES, CASE_NUMBER_TEXT)]: caseNumbers,
        }
      }
      : {};

    this.setState({
      caseFormData,
      casePrepopulated,
    });
  }

  handleOnSubmit = ({ formData } :Object) => {
    const {
      actions,
      diversionPlanEKID,
      entitySetIds,
      personEKID,
      propertyTypeIds,
    } = this.props;

    const associations = [];
    associations.push([APPEARS_IN, personEKID, PEOPLE, 0, MANUAL_PRETRIAL_COURT_CASES, {}]);
    associations.push([RELATED_TO, diversionPlanEKID, DIVERSION_PLAN, 0, MANUAL_PRETRIAL_COURT_CASES, {}]);

    const entityData :{} = processEntityData(formData, entitySetIds, propertyTypeIds);
    const associationEntityData :{} = processAssociationEntityData(fromJS(associations), entitySetIds, propertyTypeIds);
    actions.createCase({ associationEntityData, entityData });
  }

  handleOnChange = ({ formData } :Object) => {
    this.setState({ caseFormData: formData });
  }

  render() {
    const {
      actions,
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
    } = this.props;
    const {
      caseFormData,
      casePrepopulated,
    } = this.state;

    const caseFormContext = {
      editAction: actions.editPersonCase,
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
    };

    return (
      <Card>
        <CardHeader mode="primary" padding="sm">Edit Court Case</CardHeader>
        <Form
            disabled={casePrepopulated}
            formContext={caseFormContext}
            formData={caseFormData}
            onChange={this.handleOnChange}
            onSubmit={this.handleOnSubmit}
            schema={caseSchema}
            uiSchema={caseUiSchema} />
      </Card>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    createCase,
    editPersonCase,
  }, dispatch)
});

// $FlowFixMe
export default connect(null, mapDispatchToProps)(EditCaseForm);
