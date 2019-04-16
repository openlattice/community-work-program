// @flow
import React from 'react';
import styled, { css } from 'styled-components';

// From old milestone with style changes
export const RadioInputContainer = styled.input.attrs({
  type: 'radio'
})`
  position: absolute;
  opacity: 0;
`;

export const RadioContainer = styled.label`
  display: inline-block;
  position: relative;
  color: ${props => (props.checked ? '#2e2e34' : '#8e929b')};
  font-size: 14px;
  font-weight: normal;
  line-height: 19px;
  margin: 12px 12px 12px 0;
  min-height: 20px;
  padding-left: 30px;
  user-select: none;
  white-space: pre-wrap;
`;

export const RadioSelectionStyles = css`
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: #e6e6f7;
  border-radius: 50%;
  border: 1px solid #e6e6f7;

  ${RadioContainer}:hover ${RadioInputContainer} ~ & {
    background-color: #ccc;
    border-color: #ccc;
    cursor: pointer;
  }

  ${RadioContainer} ${RadioInputContainer}:checked ~ & {
    background-color: #6124e2;
    border: 1px solid #6124e2;
  }

  ${RadioContainer} ${RadioInputContainer}:disabled ~ & {
    background-color: #e6e6f7;
    border: 1px solid #e6e6f7;
    cursor: default;
  }

  ${RadioContainer} ${RadioInputContainer}:checked:disabled ~ & {
    background-color: #b6bbc7;
    border: 1px solid #b6bbc7;
  }

  &:after {
    content: "";
    position: absolute;
    display: none;
  }

  ${RadioContainer} ${RadioInputContainer}:checked ~ &:after {
    display: block;
  }

  ${RadioContainer} &:after {
    top: 6px;
    left: 6px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: white;
  }
`;

export const RadioSelection = styled.span`
  ${RadioSelectionStyles}
`;

type Props = {
  checked :boolean;
  disabled :boolean;
  label :string;
  name :string;
  onChange :(value :string) => void;
  onKeyDown :(e :SyntheticKeyboardEvent<*>) => void;
  readOnly :boolean;
  value :string | boolean | number;
};

const StyledRadio = ({
  checked,
  disabled,
  label,
  name,
  onChange,
  onKeyDown,
  readOnly,
  value,
} :Props) => (
  <RadioContainer checked={checked}>
    {label}
    <RadioInputContainer
        checked={checked}
        disabled={disabled}
        readOnly={readOnly}
        name={name}
        onChange={onChange}
        onKeyDown={onKeyDown}
        value={value} />
    <RadioSelection />
  </RadioContainer>
);

export default StyledRadio;
