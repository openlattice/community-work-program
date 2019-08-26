// @flow
import React from 'react';
import styled from 'styled-components';
import { Card, Label } from 'lattice-ui-kit';
import { faEdit } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { EMPTY_FIELD } from '../../containers/participants/ParticipantsConstants';

const NotesWrapper = styled.div`
  width: 100%;
`;

const LabelWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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
          <LabelWrapper>
            <Label subtle>Program Notes</Label>
            <FontAwesomeIcon icon={faEdit} size="sm" />
          </LabelWrapper>
          <TextWrapper>{ notesToDisplay }</TextWrapper>
        </InnerWrapper>
      </Card>
    </NotesWrapper>
  );
};

export default PlanNotes;
