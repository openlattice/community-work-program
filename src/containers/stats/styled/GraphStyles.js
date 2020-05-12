// @flow
import styled from 'styled-components';
import { CardHeader, Colors } from 'lattice-ui-kit';

const { BLACK, WHITE } = Colors;

const toolTipStyle :Object = {
  borderRadius: '3px',
  color: WHITE,
  display: 'flex',
  fontFamily: 'Open Sans, sans-serif',
  fontSize: '13px',
  padding: '5px 10px',
};

const GraphHeader = styled(CardHeader)`
  flex-direction: column;
  color: ${BLACK};
  font-size: 20px;
  font-weight: 600;
`;

const ActionsWrapper = styled.div`
  display: flex;
  margin-top: 20px;
`;

const SelectsWrapper = styled.div`
  display: grid;
  grid-template-columns: 150px 150px;
  grid-gap: 0 10px;
  font-weight: normal;
  margin-right: 10px;
`;

export {
  ActionsWrapper,
  GraphHeader,
  SelectsWrapper,
  toolTipStyle,
};
