// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import EditWorksitePlanForm from './EditWorksitePlanForm';

import { getEntityKeyId } from '../../../utils/DataUtils';
import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';
import { WORKSITE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { NAME } = WORKSITE_FQNS;
const {
  ACTIONS,
  EDIT_WORKSITE_PLAN,
  REQUEST_STATE,
  WORKSITES_BY_WORKSITE_PLAN,
} = PERSON;


type Props = {
  addWorkSitePlanStatusRequestState :RequestState;
  isOpen :boolean;
  onClose :() => void;
  worksitePlan :Map;
  worksitePlanStatus :Map;
  worksitesByWorksitePlan :Map;
};

class EditWorksitePlanModal extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { addWorkSitePlanStatusRequestState, onClose } = this.props;
    const { addWorkSitePlanStatusRequestState: prevSumbitState } = prevProps;
    if (addWorkSitePlanStatusRequestState === RequestStates.SUCCESS
      && prevSumbitState === RequestStates.PENDING) {
      onClose();
    }
  }

  render() {
    const {
      addWorkSitePlanStatusRequestState,
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
            isLoading={addWorkSitePlanStatusRequestState === RequestStates.PENDING}
            onDiscard={onClose}
            worksitePlan={worksitePlan}
            worksitePlanStatus={worksitePlanStatus} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  addWorkSitePlanStatusRequestState: state.getIn([STATE.PERSON, ACTIONS, EDIT_WORKSITE_PLAN, REQUEST_STATE]),
  [WORKSITES_BY_WORKSITE_PLAN]: state.getIn([STATE.PERSON, WORKSITES_BY_WORKSITE_PLAN]),
});

// $FlowFixMe
export default connect(mapStateToProps)(EditWorksitePlanModal);
