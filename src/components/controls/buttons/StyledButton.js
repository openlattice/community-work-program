import styled from 'styled-components';

// border-top + border-bottom + padding-top + padding-bottom + line-height = 40px
const StyledButton = styled.button.attrs({
  type: 'button'
})`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  border-radius: 3px;
  border: 0;
  margin-left: 20px;
  padding: 8px 30px;
  cursor: pointer;
  font-family: 'Open Sans', Arial, sans-serif;
  line-height: 20px;
  font-size: 14px;
  font-weight: 500;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  width: ${props => (props.fluid ? '100%' : 'auto')};

  &[disabled] {
    background-color: #e1e1eb;
    color: #aaafbc;
    cursor: not-allowed;
  }
`;

export default StyledButton;
