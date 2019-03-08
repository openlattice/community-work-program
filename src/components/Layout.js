import styled from 'styled-components';

const FixedWidthWrapper = styled.div`
  width: '${props => props.width || '960px'}';
`;

export {
  FixedWidthWrapper,
};
