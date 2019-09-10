// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import {
  Button,
  Input,
  Label,
  Select,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { editCaseAndHours } from '../ParticipantActions';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getPropertyTypeIdFromEdm
} from '../../../utils/DataUtils';
import {
  APP_TYPE_FQNS,
  CASE_FQNS,
  DIVERSION_PLAN_FQNS,
} from '../../../core/edm/constants/FullyQualifiedNames';
import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';
import {
  ButtonsRow,
  FormRow,
  FormWrapper,
  RowContent
} from '../../../components/Layout';

const { DIVERSION_PLAN, MANUAL_PRETRIAL_COURT_CASES } = APP_TYPE_FQNS;
const { CASE_NUMBER_TEXT, COURT_CASE_TYPE } = CASE_FQNS;
const { REQUIRED_HOURS } = DIVERSION_PLAN_FQNS;

const COURT_TYPE_OPTIONS = [
  {
    label: 'Sentenced',
    value: 'Sentenced'
  },
  {
    label: 'Child Support',
    value: 'Child Support'
  },
  {
    label: 'Probation',
    value: 'Probation'
  },
  {
    label: 'Mental Health Court',
    value: 'Mental Health Court'
  },
  {
    label: 'DUI Court',
    value: 'DUI Court'
  },
  {
    label: 'Drug Court',
    value: 'Drug Court'
  },
  {
    label: 'Veterans Court',
    value: 'Veterans Court'
  },
  {
    label: 'HOPE Probation',
    value: 'HOPE Probation'
  },
];

type Props = {
  actions:{
    editCaseAndHours :RequestSequence;
  };
  app :Map;
  diversionPlan :Map;
  edm :Map;
  isLoading :boolean;
  onDiscard :() => void;
  personCase :Map;
};

type State = {
  newCourtType :string;
  newDocketNumber :string;
  newRequiredHours :string;
};

class EditCaseAndHoursForm extends Component<Props, State> {

  state = {
    newCourtType: '',
    newDocketNumber: '',
    newRequiredHours: '',
  };

  handleInputChange = (event :SyntheticEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;
    this.setState({
      [name]: value,
    });
  }

  handleSelectChange = (option :Object) => {
    const { value } = option;
    this.setState({
      newCourtType: value,
    });
  }

  handleOnSubmit = () => {
    const {
      actions,
      app,
      diversionPlan,
      edm,
      personCase,
    } = this.props;
    const { newCourtType, newDocketNumber, newRequiredHours } = this.state;

    const entityData :{} = {};

    if (newCourtType || newDocketNumber) {

      const caseESID :UUID = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
      const caseEKID :UUID = getEntityKeyId(personCase);

      const newCaseData :{} = {
        [caseEKID]: {}
      };

      if (newCourtType) {
        const courtCaseTypePTID :UUID = getPropertyTypeIdFromEdm(edm, COURT_CASE_TYPE);
        newCaseData[caseEKID][courtCaseTypePTID] = [newCourtType];
      }
      if (newDocketNumber) {
        const caseNumberTextPTID :UUID = getPropertyTypeIdFromEdm(edm, CASE_NUMBER_TEXT);
        newCaseData[caseEKID][caseNumberTextPTID] = [newDocketNumber];
      }
      entityData[caseESID] = newCaseData;
    }

    if (newRequiredHours) {

      const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
      const diversionPlanEKID :UUID = getEntityKeyId(diversionPlan);
      const requiredHoursPTID :UUID = getPropertyTypeIdFromEdm(edm, REQUIRED_HOURS);

      const hoursAsNumber = parseInt(newRequiredHours, 10);

      const newDiversionPlanData :{} = {
        [diversionPlanEKID]: {
          [requiredHoursPTID]: [hoursAsNumber]
        }
      };
      entityData[diversionPlanESID] = newDiversionPlanData;
    }

    actions.editCaseAndHours({ entityData });
  }

  render() {
    const {
      diversionPlan,
      isLoading,
      onDiscard,
      personCase,
    } = this.props;

    const { [REQUIRED_HOURS]: requiredHours } = getEntityProperties(diversionPlan, [REQUIRED_HOURS]);
    const {
      [CASE_NUMBER_TEXT]: caseNumber,
      [COURT_CASE_TYPE]: courtType
    } = getEntityProperties(personCase, [CASE_NUMBER_TEXT, COURT_CASE_TYPE]);
    return (
      <FormWrapper>
        <FormRow>
          <RowContent>
            <Label>Court type</Label>
            <Select
                onChange={this.handleSelectChange}
                options={COURT_TYPE_OPTIONS}
                placeholder={courtType} />
          </RowContent>
          <RowContent>
            <Label>Docket number</Label>
            <Input
                name="newDocketNumber"
                onChange={this.handleInputChange}
                placeholder={caseNumber} />
          </RowContent>
          <RowContent>
            <Label>Required hours</Label>
            <Input
                name="newRequiredHours"
                onChange={this.handleInputChange}
                placeholder={requiredHours} />
          </RowContent>
        </FormRow>
        <ButtonsRow>
          <Button onClick={onDiscard}>Discard</Button>
          <Button
              isLoading={isLoading}
              mode="primary"
              onClick={this.handleOnSubmit}>
            Submit
          </Button>
        </ButtonsRow>
      </FormWrapper>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  app: state.get(STATE.APP),
  diversionPlan: state.getIn([STATE.PERSON, PERSON.DIVERSION_PLAN], Map()),
  edm: state.get(STATE.EDM),
  personCase: state.getIn([STATE.PERSON, PERSON.PERSON_CASE], Map()),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    editCaseAndHours,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditCaseAndHoursForm);
