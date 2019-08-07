// @flow
import React, { Component } from 'react';
import { List, Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import AssignWorksiteForm from './AssignWorksiteForm';

import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';

const { ACTIONS, ADD_WORKSITE_PLAN, REQUEST_STATE } = PERSON;


type Props = {
  addWorksitePlanRequestState :RequestState;
  diversionPlanEKID :UUID;
  isOpen :boolean;
  onClose :() => void;
  personEKID :UUID;
  worksites :List;
};

class AddParticipantModal extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { addWorksitePlanRequestState, onClose } = this.props;
    const { addWorksitePlanRequestState: prevSumbitState } = prevProps;
    if (addWorksitePlanRequestState === RequestStates.SUCCESS
      && prevSumbitState === RequestStates.PENDING) {
      onClose();
    }
  }

  render() {
    const {
      addWorksitePlanRequestState,
      diversionPlanEKID,
      isOpen,
      onClose,
      personEKID,
      worksites,
    } = this.props;
    return (
      <Modal
          isVisible={isOpen}
          onClose={onClose}
          textTitle="Assign to Worksite"
          viewportScrolling>
        <AssignWorksiteForm
            diversionPlanEKID={diversionPlanEKID}
            isLoading={addWorksitePlanRequestState === RequestStates.PENDING}
            onDiscard={onClose}
            personEKID={personEKID}
            worksites={worksites} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  addWorksitePlanRequestState: state.getIn([STATE.PERSON, ACTIONS, ADD_WORKSITE_PLAN, REQUEST_STATE]),
});

// $FlowFixMe
export default connect(mapStateToProps)(AddParticipantModal);
