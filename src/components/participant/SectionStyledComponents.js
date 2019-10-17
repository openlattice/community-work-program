// @flow
import styled from 'styled-components';
import { Label } from 'lattice-ui-kit';

import { StyledEditButton } from '../controls/index';

const SectionWrapper = styled.div`
  display: grid;
  grid-template-rows: 42px 1fr;
  grid-gap: 5px 0;
  width: 100%;
`;

const SectionNameRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  width: 100%;
`;

const SectionLabel = styled(Label)`
  font-size: 14px;
`;

export {
  SectionLabel,
  SectionNameRow,
  SectionWrapper,
  StyledEditButton,
};
