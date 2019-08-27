// @flow
import React from 'react';
import styled from 'styled-components';
import { Card, Label } from 'lattice-ui-kit';

import { EMPTY_FIELD } from '../../containers/participants/ParticipantsConstants';

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

type Props = {
  notes :string;
};

const PlanNotes = ({ notes } :Props) => {
  const notesToDisplay = !notes ? EMPTY_FIELD : notes;
  return (
    <NotesWrapper>
      <Card>
        <InnerWrapper>
          <Label subtle>Program Notes</Label>
          <TextWrapper>{ notesToDisplay }</TextWrapper>
        </InnerWrapper>
      </Card>
    </NotesWrapper>
  );
};

export default PlanNotes;
