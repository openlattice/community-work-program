// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { Card, CardHeader, Modal } from 'lattice-ui-kit';
// import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux';
// import { RequestStates } from 'redux-reqseq';
// import type { RequestSequence, RequestState } from 'redux-reqseq';

import AddWorksiteForm from './AddWorksiteForm';

import { getEntityProperties } from '../../utils/DataUtils';
import { ORGANIZATION_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const { ORGANIZATION_NAME } = ORGANIZATION_FQNS;
const StyledCard = styled(Card)`
  margin: 0 -30px;
  border: none;
`;

type Props = {
  isOpen :boolean;
  onClose :() => void;
  organization :Map;
};

class AddWorksiteModal extends Component<Props> {

  componentDidMount() {
  }

  render() {
    const { isOpen, onClose, organization } = this.props;
    const { [ORGANIZATION_NAME]: orgName } = getEntityProperties(organization, [ORGANIZATION_NAME]);
    return (
      <>
        {
          isOpen && (
            <Modal
                isVisible
                onClose={onClose}
                viewportScrolling
                withHeader={false}>
              <StyledCard>
                <CardHeader padding="lg">
                  Add Worksite to {orgName}
                </CardHeader>
                <AddWorksiteForm onDiscard={onClose} />
              </StyledCard>
            </Modal>
          )
        }
      </>
    );
  }
}

export default AddWorksiteModal;
