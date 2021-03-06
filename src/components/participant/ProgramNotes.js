// @flow
import React, { useState } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { Card, CardSegment } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import type { RequestState } from 'redux-reqseq';

import { SectionLabel, SectionNameRow, SectionWrapper } from './SectionStyledComponents';

import EditButton from '../controls/buttons/EditButton';
import EditNotesModal from '../../containers/participant/notes/EditNotesModal';
import EditPlanNotesForm from '../../containers/participant/notes/EditPlanNotesForm';
import { EMPTY_FIELD } from '../../containers/participants/ParticipantsConstants';
import { PERSON, STATE } from '../../utils/constants/ReduxStateConsts';

const { ACTIONS, EDIT_PLAN_NOTES, REQUEST_STATE } = PERSON;

const TextWrapper = styled(CardSegment)`
  align-self: center;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 490px;
`;

type Props = {
  editPlanNotesRequestState :RequestState;
  notes :string;
};

const ProgramNotes = ({ editPlanNotesRequestState, notes } :Props) => {

  const [isEditModalVisible, setEditModalVisibility] = useState(false);

  return (
    <SectionWrapper>
      <SectionNameRow>
        <SectionLabel subtle>Program Notes</SectionLabel>
        <EditButton mode="subtle" onClick={() => setEditModalVisibility(true)} />
      </SectionNameRow>
      <Card>
        <TextWrapper padding="md">{ notes || EMPTY_FIELD }</TextWrapper>
      </Card>
      <EditNotesModal
          editForm={EditPlanNotesForm}
          editRequestState={editPlanNotesRequestState}
          isOpen={isEditModalVisible}
          onClose={() => setEditModalVisibility(false)}
          title="Program Notes" />
    </SectionWrapper>
  );
};

const mapStateToProps = (state :Map) => ({
  editPlanNotesRequestState: state.getIn([STATE.PERSON, ACTIONS, EDIT_PLAN_NOTES, REQUEST_STATE]),
});

// $FlowFixMe
export default connect(mapStateToProps)(ProgramNotes);
