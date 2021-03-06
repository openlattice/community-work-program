// @flow
import React, { Component } from 'react';

import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import AddWorksiteForm from './AddWorksiteForm';

import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties } from '../../utils/DataUtils';
import { STATE, WORKSITES } from '../../utils/constants/ReduxStateConsts';

const { ORGANIZATION_NAME } = PROPERTY_TYPE_FQNS;
const { ACTIONS, ADD_WORKSITE, REQUEST_STATE } = WORKSITES;

type Props = {
  isOpen :boolean;
  onClose :() => void;
  organization :Map;
  addWorksiteRequestState :RequestState;
};

class AddWorksiteModal extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { addWorksiteRequestState, onClose } = this.props;
    const { addWorksiteRequestState: prevSumbitState } = prevProps;
    if (addWorksiteRequestState === RequestStates.SUCCESS
      && prevSumbitState === RequestStates.PENDING) {
      onClose();
    }
  }

  render() {
    const {
      isOpen,
      onClose,
      organization,
      addWorksiteRequestState,
    } = this.props;
    const { [ORGANIZATION_NAME]: orgName } = getEntityProperties(organization, [ORGANIZATION_NAME]);
    return (
      <Modal
          isVisible={isOpen}
          onClose={onClose}
          textTitle={`Add Worksite to ${orgName}`}
          viewportScrolling>
        <AddWorksiteForm
            isLoading={addWorksiteRequestState === RequestStates.PENDING}
            onDiscard={onClose}
            organization={organization} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  addWorksiteRequestState: state.getIn([STATE.WORKSITES, ACTIONS, ADD_WORKSITE, REQUEST_STATE]),
});

// $FlowFixMe
export default connect(mapStateToProps)(AddWorksiteModal);
