// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Button,
  TextArea
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

// import { editCaseAndHours } from '../ParticipantActions';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getPropertyTypeIdFromEdm
} from '../../../utils/DataUtils';
import {
  APP_TYPE_FQNS,
  DIVERSION_PLAN_FQNS,
} from '../../../core/edm/constants/FullyQualifiedNames';
import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';
import {
  ButtonsRow,
  FormRow,
  FormWrapper,
  RowContent
} from '../../../components/Layout';

const { DIVERSION_PLAN } = APP_TYPE_FQNS;
const { NOTES } = DIVERSION_PLAN_FQNS;

const TextAreaWrapper = styled.div`
  min-width: 400px;
`;

type Props = {
  actions:{
    editCaseAndHours :RequestSequence;
  };
  app :Map;
  diversionPlan :Map;
  edm :Map;
  isLoading :boolean;
  onDiscard :() => void;
};

type State = {
  newNotes :string;
};

class EditPlanNotesForm extends Component<Props, State> {

  state = {
    newNotes: '',
  };

  handleInputChange = (event :SyntheticEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    this.setState({
      newNotes: value,
    });
  }

  handleOnSubmit = () => {
    const {
      actions,
      app,
      diversionPlan,
      edm,
    } = this.props;
    const { newNotes } = this.state;

    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
    const diversionPlanEKID :UUID = getEntityKeyId(diversionPlan);
    const notesPTID :UUID = getPropertyTypeIdFromEdm(edm, NOTES);

    const entityData :{} = {
      [diversionPlanESID]: {
        [diversionPlanEKID]: {
          [notesPTID]: [newNotes]
        }
      }
    };

    // actions.editCaseAndHours({ entityData });
  }

  render() {
    const {
      diversionPlan,
      isLoading,
      onDiscard,
    } = this.props;

    const { [NOTES]: notes } = getEntityProperties(diversionPlan, [NOTES]);
    return (
      <FormWrapper>
        <FormRow>
          <RowContent>
            <TextAreaWrapper>
              <TextArea
                  name="newDocketNumber"
                  onChange={this.handleInputChange}
                  placeholder={notes} />
            </TextAreaWrapper>
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
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    // editCaseAndHours,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditPlanNotesForm);
