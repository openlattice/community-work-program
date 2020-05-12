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

export {
  GraphHeader,
  toolTipStyle,
};
