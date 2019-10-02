// @flow
import styled from 'styled-components';
import { EditButton, Label } from 'lattice-ui-kit';

export const SectionWrapper = styled.div`
  align-items: stretch;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
`;

export const SectionNameRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  width: 100%;
`;

export const SectionLabel = styled(Label)`
  font-size: 14px;
`;

export const SmallEditButton = styled(EditButton)`
  font-size: 12px;
`;
