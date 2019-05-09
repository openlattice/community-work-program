import styled, { css } from 'styled-components';
import Select from 'react-select';

import { OL } from '../../../core/style/Colors';

export const selectStyles = css`
  .lattice-select__control {
    min-height: 44px;
    border-radius: 3px;
    background-color: ${OL.GREY10};
    border: solid 1px ${OL.GREY05};
    box-shadow: 0 0 0 0;
    :hover {
      background-color: ${OL.GREY08};
      border: solid 1px ${OL.GREY05};
    }
  }
  .lattice-select__control.lattice-select__control--is-focused {
    border: solid 1px ${OL.PURPLE02};
    box-shadow: 0 0 0 0;
    background-color: white;
  }
  .lattice-select__menu {
    display: ${({ hideMenu }) => (hideMenu ? 'none' : 'block')};
  }
  .lattice-select__option {
    color: ${OL.GREY01};
    font-size: 14px;
    line-height: 19px;
    :active {
      background-color: ${OL.PURPLE06};
    }
  }
  .lattice-select__option--is-focused {
    background-color: ${OL.GREY08};
  }
  .lattice-select__option--is-selected {
    background-color: ${OL.GREY06};
    color: ${OL.PURPLE02};
  }
  .lattice-select__single-value {
    color: ${OL.GREY15};
    font-size: 14px;
    line-height: 19px;
  }
  .lattice-select__indicator-container {
    margin-right: '5px';
    color: ${OL.GREY03};
  }
  .lattice-select__indicator-separator {
    display: none;
  }
  .lattice-select__clear-indicator {
    padding: '0';
    margin: '5px';
  }
  .lattice-select__dropdown-indicator {
    display: ${({ hideMenu }) => (hideMenu ? 'none' : 'flex')};
    color: ${OL.GREY03};
    padding: '0';
    margin: '5px';
  }
`;

const StyledSelect = styled(Select)`
  ${selectStyles}
`;

export default StyledSelect;

export const emotionStyles = {
  container: (base, state) => {
    const { isDisabled } = state;
    return {
      ...base,
      cursor: isDisabled ? 'not-allowed' : 'default',
      pointerEvents: 'auto',
      width: '100%'
    };
  },
  control: (base, state) => {
    const { isFocused, isDisabled, selectProps } = state;
    let backgroundColor = `${OL.WHITE}`;
    let border = isFocused ? `solid 1px ${OL.PURPLE02}` : `solid 1px ${OL.GREY11}`;

    if (selectProps && selectProps.noBorder) {
      backgroundColor = 'transparent';
      border = 'none';
    }

    const style = {
      backgroundColor,
      border,
      borderRadius: '3px',
      boxShadow: 'none',
      fontSize: '14px',
      minHeight: '44px',
      pointerEvents: isDisabled ? 'none' : 'auto',
      ':hover': {
        backgroundColor,
        border,
      },
    };
    return { ...base, ...style };
  },
  menuPortal: base => ({ ...base, zIndex: 550 }),
  menu: (base, state) => {
    const { selectProps } = state;
    const display = (selectProps && selectProps.hideMenu) ? 'none' : 'block';
    return { ...base, display };
  },
  option: (base, state) => {
    const { isFocused, isSelected } = state;
    const color = isSelected ? `${OL.PURPLE02}` : `${OL.GREY01}`;
    let backgroundColor = 'white';

    if (isSelected) {
      backgroundColor = `${OL.GREY06}`;
    }
    else if (isFocused) {
      backgroundColor = `${OL.GREY08}`;
    }

    return {
      ...base,
      color,
      backgroundColor,
      ':active': {
        backgroundColor: `${OL.PURPLE06}`
      }
    };
  },
  singleValue: (base, state) => {
    const { isDisabled } = state;
    return { ...base, color: isDisabled ? `${OL.GREY02}` : `${OL.GREY15}` };
  },
  indicatorSeparator: () => ({ display: 'none' }),
  indicatorsContainer: base => ({ ...base, marginRight: '10px', color: `${OL.GREY03}` }),
  clearIndicator: base => ({ ...base, padding: '0', margin: '5px' }),
  dropdownIndicator: (base, state) => {
    const { selectProps } = state;
    const style = {
      color: `${OL.GREY03}`,
      padding: '0',
      margin: '5px',
      display: selectProps && selectProps.hideMenu ? 'none' : 'flex'
    };
    return { ...base, ...style };
  },
};
