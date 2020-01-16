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

import { editPersonNotes } from '../ParticipantActions';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getPropertyTypeIdFromEdm
} from '../../../utils/DataUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';
import {
  ButtonsRow,
  FormRow,
  FormWrapper,
  RowContent
} from '../../../components/Layout';

const { PEOPLE } = APP_TYPE_FQNS;
const { PERSON_NOTES } = PROPERTY_TYPE_FQNS;

const TextAreaWrapper = styled.div`
  min-width: 400px;
`;

type Props = {
  actions:{
    editPersonNotes :RequestSequence;
  };
  app :Map;
  edm :Map;
  isLoading :boolean;
  onDiscard :() => void;
  person :Map;
};

type State = {
  newNotes :string;
};

class EditPlanNotesForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      newNotes: '',
    };
  }

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
      edm,
      person,
    } = this.props;
    const { newNotes } = this.state;

    const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);
    const personEKID :UUID = getEntityKeyId(person);
    const notesPTID :UUID = getPropertyTypeIdFromEdm(edm, PERSON_NOTES);

    const entityData :{} = {
      [peopleESID]: {
        [personEKID]: {
          [notesPTID]: [newNotes]
        }
      }
    };

    actions.editPersonNotes({ entityData });
  }

  render() {
    const {
      isLoading,
      onDiscard,
      person,
    } = this.props;

    const { [PERSON_NOTES]: notes } = getEntityProperties(person, [PERSON_NOTES]);
    return (
      <FormWrapper>
        <FormRow>
          <RowContent>
            <TextAreaWrapper>
              <TextArea
                  defaultValue={notes}
                  name="newDocketNumber"
                  onChange={this.handleInputChange} />
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
  edm: state.get(STATE.EDM),
  person: state.getIn([STATE.PERSON, PERSON.PARTICIPANT], Map()),
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    editPersonNotes,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditPlanNotesForm);
