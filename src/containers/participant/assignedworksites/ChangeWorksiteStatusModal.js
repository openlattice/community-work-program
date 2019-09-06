// @flow
import React, { Component } from 'react';
import { List, Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import ChangeWorksiteStatusForm from './ChangeWorksiteStatusForm';

import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';

const { ACTIONS, ADD_WORKSITE_PLAN, REQUEST_STATE } = PERSON;


type Props = {
  addNewWorkSiteStatusRequestState :RequestState;
  diversionPlanEKID :UUID;
  isOpen :boolean;
  onClose :() => void;
  personEKID :UUID;
  worksites :List;
};

class ChangeWorksiteStatusModal extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { addNewWorkSiteStatusRequestState, onClose } = this.props;
    const { addNewWorkSiteStatusRequestState: prevSumbitState } = prevProps;
    if (addNewWorkSiteStatusRequestState === RequestStates.SUCCESS
      && prevSumbitState === RequestStates.PENDING) {
      onClose();
    }
  }

  render() {
    const {
      addNewWorkSiteStatusRequestState,
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
        <ChangeWorksiteStatusForm
            diversionPlanEKID={diversionPlanEKID}
            isLoading={addNewWorkSiteStatusRequestState === RequestStates.PENDING}
            onDiscard={onClose}
            personEKID={personEKID}
            worksites={worksites} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  addNewWorkSiteStatusRequestState: state.getIn([STATE.PERSON, ACTIONS, ADD_WORKSITE_PLAN, REQUEST_STATE]),
});

// $FlowFixMe
export default connect(mapStateToProps)(ChangeWorksiteStatusModal);
