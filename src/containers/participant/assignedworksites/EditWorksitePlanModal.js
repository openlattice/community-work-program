// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import EditWorksitePlanForm from './EditWorksitePlanForm';

import { getEntityKeyId } from '../../../utils/DataUtils';
import { STATE, WORKSITE_PLANS } from '../../../utils/constants/ReduxStateConsts';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { NAME } = PROPERTY_TYPE_FQNS;
const {
  ACTIONS,
  EDIT_WORKSITE_PLAN,
  REQUEST_STATE,
  WORKSITES_BY_WORKSITE_PLAN,
} = WORKSITE_PLANS;

type Props = {
  editWorksitePlanRequestState :RequestState;
  isOpen :boolean;
  onClose :() => void;
  worksitePlan :Map;
  worksitePlanStatus :Map;
  worksitesByWorksitePlan :Map;
};

class EditWorksitePlanModal extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { editWorksitePlanRequestState, onClose } = this.props;
    const { editWorksitePlanRequestState: prevSumbitState } = prevProps;
    if (editWorksitePlanRequestState === RequestStates.SUCCESS
      && prevSumbitState === RequestStates.PENDING) {
      onClose();
    }
  }

  render() {
    const {
      editWorksitePlanRequestState,
      isOpen,
      onClose,
      worksitePlan,
      worksitePlanStatus,
      worksitesByWorksitePlan,
    } = this.props;

    const worksitePlanEKID :UUID = getEntityKeyId(worksitePlan);
    const worksiteName :string = worksitesByWorksitePlan.getIn([worksitePlanEKID, NAME, 0], '');
    return (
      <Modal
          isVisible={isOpen}
          onClose={onClose}
          textTitle={`Edit Details for ${worksiteName}`}
          viewportScrolling>
        <EditWorksitePlanForm
            isLoading={editWorksitePlanRequestState === RequestStates.PENDING}
            onDiscard={onClose}
            worksitePlan={worksitePlan}
            worksitePlanStatus={worksitePlanStatus} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  editWorksitePlanRequestState: state.getIn([STATE.WORKSITE_PLANS, ACTIONS, EDIT_WORKSITE_PLAN, REQUEST_STATE]),
  [WORKSITES_BY_WORKSITE_PLAN]: state.getIn([STATE.WORKSITE_PLANS, WORKSITES_BY_WORKSITE_PLAN]),
});

// $FlowFixMe
export default connect(mapStateToProps)(EditWorksitePlanModal);
