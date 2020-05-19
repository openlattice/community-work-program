// @flow
import styled from 'styled-components';
import { CardSegment } from 'lattice-ui-kit';

const KeyWrapper = styled(CardSegment)`
  justify-content: center;
  margin-left: 70px;
`;

const KeyItemWrapper = styled.div`
  display: flex;
  margin-bottom: 6px;
`;

const KeyItem = styled.div`
  display: flex;
  margin-left: 10px;
`;

const KeySquare = styled.div`
  background-color: ${(props) => props.color};
  height: 24px;
  width: 24px;
`;

const GraphDescription = styled.div`
  font-size: 12px;
`;

export {
  GraphDescription,
  KeyItem,
  KeyItemWrapper,
  KeySquare,
  KeyWrapper,
};
