// @flow
import React, { Component } from 'react';
import { List, Map, getIn } from 'immutable';
import { Card, CardHeader } from 'lattice-ui-kit';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { reassignJudge } from '../ParticipantActions';
import { APP_TYPE_FQNS, ENTITY_KEY_ID } from '../../../core/edm/constants/FullyQualifiedNames';
import { judgeSchema, judgeUiSchema } from '../schemas/EditCaseInfoSchemas';
import { hydrateJudgeSchema } from '../utils/EditCaseInfoUtils';
import { getEntityKeyId } from '../../../utils/DataUtils';

const {
  getEntityAddressKey,
  getPageSectionKey,
} = DataProcessingUtils;

const {
  DIVERSION_PLAN,
  JUDGES,
  MANUAL_PRETRIAL_COURT_CASES,
  PRESIDES_OVER,
} = APP_TYPE_FQNS;

type Props = {
  actions:{
    reassignJudge :RequestSequence;
  },
  diversionPlan :Map;
  entityIndexToIdMap :Map;
  entitySetIds :Object;
  judge :Map;
  judges :List;
  personCase :Map;
  propertyTypeIds :Object;
};

type State = {
  judgeFormData :Object;
  judgeFormSchema :Object;
  judgePrepopulated :boolean;
};

class AssignJudgeForm extends Component<Props, State> {

  state = {
    judgeFormData: {},
    judgeFormSchema: judgeSchema,
    judgePrepopulated: false,
  };

  componentDidMount() {
    this.prepopulateFormData();
  }

  componentDidUpdate(prevProps :Props) {
    const { judge, judges } = this.props;
    if (!prevProps.judge.equals(judge) || !prevProps.judges.equals(judges)) {
      this.prepopulateFormData();
    }
  }

  prepopulateFormData = () => {
    const { judge, judges } = this.props;

    const sectionOneKey = getPageSectionKey(1, 1);

    const judgePrepopulated = !judge.isEmpty();
    const judgeFormData :{} = judgePrepopulated
      ? {
        [sectionOneKey]: {
          [getEntityAddressKey(0, JUDGES, ENTITY_KEY_ID)]: [getEntityKeyId(judge)],
        }
      }
      : {};
    const newJudgeSchema = hydrateJudgeSchema(judgeSchema, judges);

    this.setState({
      judgeFormData,
      judgeFormSchema: newJudgeSchema,
      judgePrepopulated,
    });
  }

  handleOnJudgeSubmit = () => {
    const {
      actions,
      diversionPlan,
      entitySetIds,
      personCase,
    } = this.props;
    const { judgeFormData } = this.state;

    const judgeEKID = getIn(judgeFormData, [getPageSectionKey(1, 1), getEntityAddressKey(0, JUDGES, ENTITY_KEY_ID)]);
    const caseEKID = getEntityKeyId(personCase);
    const diversionPlanEKID = getEntityKeyId(diversionPlan);

    const associationEntityData :{} = {
      [entitySetIds[PRESIDES_OVER]]: [
        {
          data: {},
          dst: {
            entitySetId: entitySetIds[MANUAL_PRETRIAL_COURT_CASES],
            entityKeyId: caseEKID
          },
          src: {
            entitySetId: entitySetIds[JUDGES],
            entityKeyId: judgeEKID
          }
        },
        {
          data: {},
          dst: {
            entitySetId: entitySetIds[DIVERSION_PLAN],
            entityKeyId: diversionPlanEKID
          },
          src: {
            entitySetId: entitySetIds[JUDGES],
            entityKeyId: judgeEKID
          }
        }
      ]
    };
    actions.reassignJudge({ associationEntityData, entityData: {} });
  }

  handleOnChangeJudge = ({ formData } :Object) => {
    this.setState({ judgeFormData: formData });
  }

  render() {
    const {
      actions,
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
    } = this.props;
    const {
      judgeFormData,
      judgePrepopulated,
      judgeFormSchema,
    } = this.state;

    const judgeFormContext = {
      editAction: actions.reassignJudge,
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
    };
    return (
      <Card>
        <CardHeader padding="sm">Assign Judge</CardHeader>
        <Form
            disabled={judgePrepopulated}
            formContext={judgeFormContext}
            formData={judgeFormData}
            onChange={this.handleOnChangeJudge}
            onSubmit={this.handleOnJudgeSubmit}
            schema={judgeFormSchema}
            uiSchema={judgeUiSchema} />
      </Card>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    reassignJudge,
  }, dispatch)
});

// $FlowFixMe
export default connect(null, mapDispatchToProps)(AssignJudgeForm);
