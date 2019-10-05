// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { fromJS, List, Map } from 'immutable';
import { DateTime } from 'luxon';
import { Card, CardHeader, CardStack } from 'lattice-ui-kit';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { goToRoute } from '../../core/router/RoutingActions';
import {
  APP_TYPE_FQNS,
  PEOPLE_FQNS,
} from '../../core/edm/constants/FullyQualifiedNames';
import {
  caseSchema,
  caseUiSchema,
  chargeSchema,
  chargeUiSchema,
  judgeSchema,
  judgeUiSchema,
  requiredHoursSchema,
  requiredHoursUiSchema,
} from './schemas/EditCaseInfoSchemas';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getPropertyTypeIdFromEdm
} from '../../utils/DataUtils';
import { BackNavButton } from '../../components/controls/index';
import { PARTICIPANT_PROFILE_WIDTH } from '../../core/style/Sizes';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import * as Routes from '../../core/router/Routes';

const {
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData,
} = DataProcessingUtils;

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
  },
  app :Map;
  chargeEvents :List;
  chargesByChargeEventEKID :Map;
  diversionPlan :Map;
  edm :Map;
  judge :Map;
  judges :List;
  participant :Map;
  personCase :Map;
};

type State = {
  caseFormData :Object;
  casePrepopulated :boolean;
  chargeFormData :Object;
  chargePrepopulated :boolean;
  judgesFormData :Object;
  judgesPrepopulated :boolean;
  requiredHoursFormData :Object;
  requiredHoursPrepopulated :boolean;
};

class EditCaseInfoForm extends Component<Props, State> {

  state = {
    caseFormData: {},
    casePrepopulated: false,
    chargeFormData: {},
    chargePrepopulated: false,
    judgesFormData: {},
    judgesPrepopulated: false,
    requiredHoursFormData: {},
    requiredHoursPrepopulated: false,
  };

  render() {
    const { actions, participant } = this.props;
    const {
      caseFormData,
      casePrepopulated,
      chargeFormData,
      chargePrepopulated,
      judgesFormData,
      judgesPrepopulated,
      requiredHoursFormData,
      requiredHoursPrepopulated,
    } = this.state;

    const participantEKID :UUID = getEntityKeyId(participant);
    return (
      <FormWrapper>
        <ButtonWrapper>
          <BackNavButton
              onClick={() => {
                actions.goToRoute(Routes.PARTICIPANT_PROFILE.replace(':subjectId', participantEKID));
              }}>
            Back to Profile
          </BackNavButton>
        </ButtonWrapper>
        <CardStack>
          <Card>
            <CardHeader padding="sm">Assign Judge</CardHeader>
            <Form
                disabled={judgesPrepopulated}
                formContext={{}}
                formData={judgesFormData}
                schema={judgeSchema}
                uiSchema={judgeUiSchema} />
          </Card>
          <Card>
            <CardHeader padding="sm">Edit Case</CardHeader>
            <Form
                disabled={casePrepopulated}
                formContext={{}}
                formData={caseFormData}
                schema={caseSchema}
                uiSchema={caseUiSchema} />
          </Card>
          <Card>
            <CardHeader padding="sm">Edit Charges</CardHeader>
            <Form
                disabled={chargePrepopulated}
                formContext={{}}
                formData={chargeFormData}
                schema={chargeSchema}
                uiSchema={chargeUiSchema} />
          </Card>
          <Card>
            <CardHeader padding="sm">Edit Required Hours</CardHeader>
            <Form
                disabled={requiredHoursPrepopulated}
                formContext={{}}
                formData={requiredHoursFormData}
                schema={requiredHoursSchema}
                uiSchema={requiredHoursUiSchema} />
          </Card>
        </CardStack>
      </FormWrapper>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  app: state.get(STATE.APP),
  edm: state.get(STATE.EDM),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditCaseInfoForm);
