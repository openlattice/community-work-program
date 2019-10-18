// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Card, CardHeader } from 'lattice-ui-kit';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { editPersonCase } from '../ParticipantActions';
import { APP_TYPE_FQNS, CASE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { caseSchema, caseUiSchema } from '../schemas/EditCaseInfoSchemas';
import { getEntityProperties } from '../../../utils/DataUtils';

const {
  getEntityAddressKey,
  getPageSectionKey,
} = DataProcessingUtils;

const { MANUAL_PRETRIAL_COURT_CASES } = APP_TYPE_FQNS;
const { CASE_NUMBER_TEXT, COURT_CASE_TYPE } = CASE_FQNS;

type Props = {
  actions:{
    editPersonCase :RequestSequence;
  },
  entityIndexToIdMap :Map;
  entitySetIds :Object;
  personCase :Map;
  propertyTypeIds :Object;
};

type State = {
  caseFormData :Object;
  casePrepopulated :boolean;
};

class EditCaseForm extends Component<Props, State> {

  state = {
    caseFormData: {},
    casePrepopulated: false,
  };

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
    const casePrepopulated = !!caseNumbers || !!courtCaseType;
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
        <CardHeader padding="sm">Edit Case</CardHeader>
        <Form
            disabled={casePrepopulated}
            formContext={caseFormContext}
            formData={caseFormData}
            schema={caseSchema}
            uiSchema={caseUiSchema} />
      </Card>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    editPersonCase,
  }, dispatch)
});

// $FlowFixMe
export default connect(null, mapDispatchToProps)(EditCaseForm);
