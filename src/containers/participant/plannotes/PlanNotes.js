// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { Card, Label } from 'lattice-ui-kit';
import { faEdit } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import EditPlanNotesModal from './EditPlanNotesModal';

import { EMPTY_FIELD } from '../../participants/ParticipantsConstants';
import { OL } from '../../../core/style/Colors';

const NotesWrapper = styled.div`
  width: 100%;
`;

const InnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100px;
  padding: 20px 30px;
`;

const TextWrapper = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const LabelWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const IconWrapper = styled.div`
  &:hover {
    cursor: pointer;
  }
`;

type Props = {
  notes :string;
};

type State = {
  isEditModalVisible :boolean;
};

class PlanNotes extends Component<Props, State> {

  state = {
    isEditModalVisible: false,
  };

  handleShowEditModal = () => {
    this.setState({
      isEditModalVisible: true,
    });
  }

  handleHideEditModal = () => {
    this.setState({
      isEditModalVisible: false,
    });
  }

  render() {
    const { notes } = this.props;
    const { isEditModalVisible } = this.state;
    const notesToDisplay = !notes ? EMPTY_FIELD : notes;
    return (
      <NotesWrapper>
        <Card>
          <InnerWrapper>
            <LabelWrapper>
              <Label subtle>Program Notes</Label>
              <IconWrapper onClick={this.handleShowEditModal}>
                <FontAwesomeIcon color={OL.GREY02} icon={faEdit} size="sm" />
              </IconWrapper>
            </LabelWrapper>
            <TextWrapper>{ notesToDisplay }</TextWrapper>
          </InnerWrapper>
        </Card>
        <EditPlanNotesModal
            isOpen={isEditModalVisible}
            onClose={this.handleHideEditModal} />
      </NotesWrapper>
    );
  }
}

export default PlanNotes;
