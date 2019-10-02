// @flow
import React from 'react';
import styled from 'styled-components';
import { Card, CardSegment } from 'lattice-ui-kit';

import {
  SectionLabel,
  SectionNameRow,
  SectionWrapper,
  SmallEditButton,
} from './SectionStyledComponents';
import { EMPTY_FIELD } from '../../containers/participants/ParticipantsConstants';

const NotesCard = styled(Card)`
  height: 70px;
`;

const TextWrapper = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type Props = {
  notes :string;
};

const PersonNotes = ({ notes } :Props) => (
  <SectionWrapper>
    <SectionNameRow>
      <SectionLabel subtle>Profile Notes</SectionLabel>
      <SmallEditButton mode="subtle" onClick={() => {}} />
    </SectionNameRow>
    <NotesCard>
      <CardSegment padding="md">
        <TextWrapper>{ notes || EMPTY_FIELD }</TextWrapper>
      </CardSegment>
    </NotesCard>
  </SectionWrapper>
);

export default PersonNotes;
