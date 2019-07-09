// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { Card, CardHeader, Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import AddWorksiteForm from './AddWorksiteForm';

import { getEntityProperties } from '../../utils/DataUtils';
import { ORGANIZATION_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { DATA, STATE } from '../../utils/constants/ReduxStateConsts';

const { ORGANIZATION_NAME } = ORGANIZATION_FQNS;
const { ACTIONS, SUBMIT_DATA_GRAPH, REQUEST_STATE } = DATA;

const StyledCard = styled(Card)`
  margin: 0 -30px;
  border: none;
`;

type Props = {
  isOpen :boolean;
  onClose :() => void;
  organization :Map;
  submitDataGraphRequestState :RequestState;
};

class AddWorksiteModal extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { submitDataGraphRequestState, onClose } = this.props;
    const { submitDataGraphRequestState: prevSumbitState } = prevProps;
    if (submitDataGraphRequestState === RequestStates.SUCCESS
      && prevSumbitState === RequestStates.PENDING) {
      onClose();
    }
  }

  render() {
    const {
      isOpen,
      onClose,
      organization,
      submitDataGraphRequestState,
    } = this.props;
    const { [ORGANIZATION_NAME]: orgName } = getEntityProperties(organization, [ORGANIZATION_NAME]);
    return (
      <Modal
          isVisible={isOpen}
          onClose={onClose}
          viewportScrolling
          withHeader={false}>
        <StyledCard>
          <CardHeader padding="lg">
            Add Worksite to { orgName }
          </CardHeader>
          <AddWorksiteForm
              isLoading={submitDataGraphRequestState === RequestStates.PENDING}
              onDiscard={onClose}
              organization={organization} />
        </StyledCard>
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  submitDataGraphRequestState: state.getIn([STATE.DATA, ACTIONS, SUBMIT_DATA_GRAPH, REQUEST_STATE]),
});

// $FlowFixMe
export default connect(mapStateToProps)(AddWorksiteModal);
