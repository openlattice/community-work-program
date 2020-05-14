// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import {
  Button,
  Label,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { deleteInfractionEvent } from './InfractionsActions';
import { getEntitySetIdFromApp } from '../../../utils/DataUtils';
import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { STATE } from '../../../utils/constants/ReduxStateConsts';
import {
  ButtonsRow,
  FormRow,
  FormWrapper,
  RowContent
} from '../../../components/Layout';

const { INFRACTION_EVENT } = APP_TYPE_FQNS;

type Props = {
  actions:{
    deleteInfractionEvent :RequestSequence;
  };
  app :Map;
  infractionEventEKID :UUID;
  isLoading :boolean;
  onDiscard :() => void;
};

type State = {
  newEnrollmentData :Map;
};

class DeleteInfractionForm extends Component<Props, State> {

  handleDelete = () => {
    const {
      actions,
      app,
      infractionEventEKID,
    } = this.props;

    const infractionEventESID :UUID = getEntitySetIdFromApp(app, INFRACTION_EVENT);
    const entitiesToDelete :Object[] = [{
      entitySetId: infractionEventESID,
      entityKeyIds: [infractionEventEKID]
    }];
    actions.deleteInfractionEvent(entitiesToDelete);
  }

  render() {
    const {
      isLoading,
      onDiscard,
    } = this.props;

    return (
      <FormWrapper>
        <FormRow>
          <RowContent>
            <div>Are you sure you want to delete this infraction report?</div>
            <Label>This action cannot be undone.</Label>
          </RowContent>
        </FormRow>
        <ButtonsRow>
          <Button onClick={onDiscard}>No</Button>
          <Button
              isLoading={isLoading}
              mode="primary"
              onClick={this.handleDelete}>
            Yes
          </Button>
        </ButtonsRow>
      </FormWrapper>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  app: state.get(STATE.APP),
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    deleteInfractionEvent,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(DeleteInfractionForm);
