// @flow
import React, { useState } from 'react';

import styled from 'styled-components';
import { Button, CardSegment, CardStack } from 'lattice-ui-kit';

import AddParticipantForm from './AddParticipantForm';
import SearchExistingPeople from './SearchExistingPeople';

import { APP_CONTENT_WIDTH } from '../../../core/style/Sizes';

const ContainerWrapper = styled.div`
  align-self: center;
  display: flex;
  flex-direction: column;
  margin-top: 30px;
  position: relative;
  width: ${APP_CONTENT_WIDTH}px;
`;

const FlexEndCardSegment = styled(CardSegment)`
  flex-direction: row;
  justify-content: flex-end;
`;

const ButtonWrapper = styled.div`
  margin-left: 10px;
`;

const AddParticipantContainer = () => {
  const [page, setPage] = useState(0);
  const componentToDisplay = page === 0
    ? <SearchExistingPeople setFormPage={setPage} />
    : <AddParticipantForm />;
  return (
    <ContainerWrapper>
      <CardStack>
        { componentToDisplay }
        <FlexEndCardSegment>
          <Button disabled={page === 0} onClick={() => setPage(0)}>Back</Button>
          <ButtonWrapper>
            <Button disabled={page === 1} onClick={() => setPage(1)}>Next</Button>
          </ButtonWrapper>
        </FlexEndCardSegment>
      </CardStack>
    </ContainerWrapper>
  );
};

export default AddParticipantContainer;
