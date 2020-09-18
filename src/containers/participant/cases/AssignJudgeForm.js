// @flow
import React, { Component } from 'react';

import { List, Map, getIn } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import {
  Card,
  CardHeader,
  CardSegment,
  Spinner,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import { judgeSchema, judgeUiSchema } from './schemas/EditCaseInfoSchemas';
import { disableJudgeForm, hydrateJudgeSchema } from './utils/EditCaseInfoUtils';

import ErrorMessage from '../../../components/error/ErrorMessage';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityKeyId } from '../../../utils/DataUtils';
import { requestIsFailure, requestIsPending } from '../../../utils/RequestStateUtils';
import { PERSON, SHARED, STATE } from '../../../utils/constants/ReduxStateConsts';
import { reassignJudge } from '../ParticipantActions';

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
  formData :Object;
  judgeFormSchema :Object;
  judgePrepopulated :boolean;
  judgeFormUiSchema :Object;
};

class AssignJudgeForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      formData: {},
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
    let formData :Object = {};
    let judgePrepopulated :boolean = false;

    if (personCase.isEmpty()) {
      newJudgeUiSchema = disableJudgeForm(judgeUiSchema);
      judgePrepopulated = true;
    }
    else {
      const sectionOneKey = getPageSectionKey(1, 1);

      judgePrepopulated = !judge || !judge.isEmpty();
      formData = judgePrepopulated
        ? {
          [sectionOneKey]: {
            [getEntityAddressKey(0, JUDGES, ENTITY_KEY_ID)]: getEntityKeyId(judge),
          }
        }
        : {};
      newJudgeSchema = hydrateJudgeSchema(judgeSchema, judges);
    }

    this.setState({
      formData,
      judgeFormSchema: newJudgeSchema,
      judgePrepopulated,
      judgeFormUiSchema: newJudgeUiSchema,
    });
  }

  onSubmit = ({ formData } :Object) => {
    const {
      actions,
      diversionPlan,
      entitySetIds,
      personCase,
    } = this.props;

    let judgeEKID = getIn(formData, [getPageSectionKey(1, 1), getEntityAddressKey(0, JUDGES, ENTITY_KEY_ID)]);
    if (Array.isArray(judgeEKID)) [judgeEKID] = judgeEKID;
    const caseEKID = getEntityKeyId(personCase);
    const diversionPlanEKID = getEntityKeyId(diversionPlan);

    const associations :{} = {
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
    actions.reassignJudge({
      associations,
      caseEKID,
      diversionPlanEKID,
      judgeEKID
    });
  }

  onChange = ({ formData } :Object) => {
    this.setState({ formData });
  }

  render() {
    const {
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
      requestStates,
    } = this.props;
    const {
      formData,
      judgePrepopulated,
      judgeFormSchema,
      judgeFormUiSchema,
    } = this.state;

    const submissionFailed = requestIsFailure(requestStates[REASSIGN_JUDGE]);
    const submissionIsPending = requestIsPending(requestStates[REASSIGN_JUDGE]);

    const judgeFormContext = {
      editAction: this.onSubmit,
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
    };
    return (
      <Card>
        <CardHeader padding="sm">Assign Judge</CardHeader>
        <Form
            disabled={judgePrepopulated}
            isSubmitting={submissionIsPending}
            formContext={judgeFormContext}
            formData={formData}
            onChange={this.onChange}
            onSubmit={this.onSubmit}
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
