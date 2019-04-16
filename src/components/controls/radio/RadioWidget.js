// @flow
import React, { Component } from 'react';
import styled, { css } from 'styled-components';
import StyledRadio from './StyledRadio';
import KeyCodes from '../../../utils/constants/KeyCodes';

const StyledRow = styled.div`
  display: grid;
  grid-auto-flow: ${props => (props.inline ? 'column' : 'row')};
  grid-template-columns: ${props => (props.inline && props.columns ? css`repeat(${props.columns}, 1fr)` : '1fr')};
`;

type Props = {
  autofocus :boolean;
  disabled :boolean;
  id :string;
  onChange :(value :string) => void;
  options :Object;
  readonly :boolean;
  required :boolean;
  value :any;
  name :string;
};

class RadioWidget extends Component<Props> {

  onKeyDown = (e :SyntheticKeyboardEvent<*>) => {
    if (e.key === KeyCodes.ENTER) {
      e.preventDefault();
    }
  }

  render() {
    const {
      autofocus,
      disabled,
      id,
      name,
      onChange,
      options,
      readonly,
      required,
      value
    } = this.props;
    const { enumOptions, inline } = options;
    return (
      <StyledRow inline={inline} columns={enumOptions.length}>
        {enumOptions.map((option, i) => {
          const checked = option.value === value;
          const radio = (
            <StyledRadio
                autoFocus={autofocus && i === 0}
                checked={checked}
                disabled={disabled || readonly}
                label={option.label}
                name={name}
                onChange={() => onChange(option.value)}
                onKeyDown={this.onKeyDown}
                readOnly={false}
                required={required}
                type="radio"
                value={option.value} />
          );

          return (
            <div key={`${id}_${option.label}`}>
              {radio}
            </div>
          );
        })}
      </StyledRow>
    );
  }
}

export default RadioWidget;
