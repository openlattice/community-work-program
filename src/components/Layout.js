import styled from 'styled-components';

const FixedWidthWrapper = styled.div`
  width: '${props => props.width || '960px'}';
`;

const Segment = styled.div`
  border-radius: 5px;
  background-color: #fff;
  border: solid 1px #e1e1eb;
  padding: 30px;
`;

export {
  FixedWidthWrapper,
  Segment,
};
