// @flow
import styled from 'styled-components';
import { Label } from 'lattice-ui-kit';

import { StyledEditButton } from '../controls/index';

const SectionWrapper = styled.section`
  align-items: stretch;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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
