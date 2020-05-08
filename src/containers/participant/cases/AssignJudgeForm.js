// @flow
import React, { Component } from 'react';
import { List, Map, getIn } from 'immutable';
import {
  Card,
  CardHeader,
  CardSegment,
  Spinner,
} from 'lattice-ui-kit';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import ErrorMessage from '../../../components/error/ErrorMessage';
import { disableJudgeForm, hydrateJudgeSchema } from './utils/EditCaseInfoUtils';
import { getEntityKeyId } from '../../../utils/DataUtils';
import { requestIsFailure, requestIsPending } from '../../../utils/RequestStateUtils';
import { judgeSchema, judgeUiSchema } from './schemas/EditCaseInfoSchemas';
import { reassignJudge } from '../ParticipantActions';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { PERSON, SHARED, STATE } from '../../../utils/constants/ReduxStateConsts';

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
const { ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { REASSIGN_JUDGE } = PERSON;

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
  requestStates :{
    REASSIGN_JUDGE :RequestState;
  };
};

type State = {
  judgeFormData :Object;
  judgeFormSchema :Object;
  judgePrepopulated :boolean;
  judgeFormUiSchema :Object;
};

class AssignJudgeForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      judgeFormData: {},
      judgeFormSchema: judgeSchema,
      judgePrepopulated: false,
      judgeFormUiSchema: {},
    };
  }

  componentDidMount() {
    this.prepopulateFormData();
  }

  componentDidUpdate(prevProps :Props) {
    const { judge, judges, personCase } = this.props;
    if (!prevProps.judge.equals(judge)
      || !prevProps.judges.equals(judges)
      || !prevProps.personCase.equals(personCase)) {
      this.prepopulateFormData();
    }
  }

  prepopulateFormData = () => {
    const { judge, judges, personCase } = this.props;

    let newJudgeSchema :Object = judgeSchema;
    let newJudgeUiSchema :Object = judgeUiSchema;
    let judgeFormData :Object = {};
    let judgePrepopulated :boolean = false;

    if (personCase.isEmpty()) {
      newJudgeUiSchema = disableJudgeForm(judgeUiSchema);
      judgePrepopulated = true;
    }
    else {
      const sectionOneKey = getPageSectionKey(1, 1);

      judgePrepopulated = !judge.isEmpty();
      judgeFormData = judgePrepopulated
        ? {
          [sectionOneKey]: {
            [getEntityAddressKey(0, JUDGES, ENTITY_KEY_ID)]: [getEntityKeyId(judge)],
          }
        }
        : {};
      newJudgeSchema = hydrateJudgeSchema(judgeSchema, judges);
    }

    this.setState({
      judgeFormData,
      judgeFormSchema: newJudgeSchema,
      judgePrepopulated,
      judgeFormUiSchema: newJudgeUiSchema,
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
      [entitySetIds.get(PRESIDES_OVER)]: [
        {
          data: {},
          dst: {
            entitySetId: entitySetIds.get(MANUAL_PRETRIAL_COURT_CASES),
            entityKeyId: caseEKID
          },
          src: {
            entitySetId: entitySetIds.get(JUDGES),
            entityKeyId: judgeEKID
          }
        },
        {
          data: {},
          dst: {
            entitySetId: entitySetIds.get(DIVERSION_PLAN),
            entityKeyId: diversionPlanEKID
          },
          src: {
            entitySetId: entitySetIds.get(JUDGES),
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
      requestStates,
    } = this.props;
    const {
      judgeFormData,
      judgePrepopulated,
      judgeFormSchema,
      judgeFormUiSchema,
    } = this.state;

    const submissionFailed = requestIsFailure(requestStates[REASSIGN_JUDGE]);
    const submissionIsPending = requestIsPending(requestStates[REASSIGN_JUDGE]);

    const judgeFormContext = {
      editAction: actions.reassignJudge,
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
    };
    return (
      <Card>
        <CardHeader mode="primary" padding="sm">Assign Judge</CardHeader>
        <Form
            disabled={judgePrepopulated}
            isSubmitting={submissionIsPending}
            formContext={judgeFormContext}
            formData={judgeFormData}
            onChange={this.handleOnChangeJudge}
            onSubmit={this.handleOnJudgeSubmit}
            schema={judgeFormSchema}
            uiSchema={judgeFormUiSchema} />
        { (judgePrepopulated && submissionIsPending) && (
          <CardSegment><Spinner size="2x" /></CardSegment>
        )}
        { submissionFailed && <ErrorMessage /> }
      </Card>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const person = state.get(STATE.PERSON);
  return {
    requestStates: {
      [REASSIGN_JUDGE]: person.getIn([ACTIONS, REASSIGN_JUDGE, REQUEST_STATE])
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    reassignJudge,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AssignJudgeForm);
