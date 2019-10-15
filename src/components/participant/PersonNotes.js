// @flow
import React, { useState } from 'react';
import styled from 'styled-components';
import { Card, CardSegment } from 'lattice-ui-kit';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import type { RequestState } from 'redux-reqseq';

import EditNotesModal from '../../containers/participant/notes/EditNotesModal';
import EditPersonNotesForm from '../../containers/participant/notes/EditPersonNotesForm';

import {
  SectionLabel,
  SectionNameRow,
  SectionWrapper,
  StyledEditButton,
} from './SectionStyledComponents';
import { EMPTY_FIELD } from '../../containers/participants/ParticipantsConstants';
import { PERSON, STATE } from '../../utils/constants/ReduxStateConsts';

const { ACTIONS, EDIT_PLAN_NOTES, REQUEST_STATE } = PERSON;

const TextWrapper = styled.div`
  align-self: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type Props = {
  editPersonNotesRequestState :RequestState;
  notes :string;
};

const PersonNotes = ({ editPersonNotesRequestState, notes } :Props) => {

  const [isEditModalVisible, setEditModalVisibility] = useState(false);

  return (
    <SectionWrapper>
      <SectionNameRow>
        <SectionLabel subtle>Profile Notes</SectionLabel>
        <StyledEditButton mode="subtle" onClick={() => setEditModalVisibility(true)} />
      </SectionNameRow>
      <Card>
        <CardSegment padding="md">
          <TextWrapper>{ notes || EMPTY_FIELD }</TextWrapper>
        </CardSegment>
      </Card>
      <EditNotesModal
          components={{ EditForm: EditPersonNotesForm }}
          editRequestState={editPersonNotesRequestState}
          isOpen={isEditModalVisible}
          onClose={() => setEditModalVisibility(false)}
          title="Profile Notes" />
    </SectionWrapper>
  );
};

const mapStateToProps = (state :Map) => ({
  editPersonNotesRequestState: state.getIn([STATE.PERSON, ACTIONS, EDIT_PLAN_NOTES, REQUEST_STATE]),
});

// $FlowFixMe
export default connect(mapStateToProps)(PersonNotes);
