import styled, { css } from 'styled-components';
import Select from 'react-select';

import { OL } from '../../utils/constants/Colors';

export const selectStyles = css`
  .lattice-select__control {
    min-height: 44px;
    border-radius: 3px;
    background-color: #f9f9fd;
    border: solid 1px #dcdce7;
    box-shadow: 0 0 0 0;

    :hover {
      background-color: #f0f0f7;
      border: solid 1px #dcdce7;
    }
  }

  .lattice-select__control.lattice-select__control--is-focused {
    border: solid 1px #6124e2;
    box-shadow: 0 0 0 0;
    background-color: white;
  }

  .lattice-select__menu {
    display: ${({ hideMenu }) => (hideMenu ? 'none' : 'block')};
  }

  .lattice-select__option {
    color: #555e6f;
    font-size: 14px;
    line-height: 19px;

    :active {
      background-color: #e4d8ff;
    }
  }

  .lattice-select__option--is-focused {
    background-color: #f0f0f7;
  }

  .lattice-select__option--is-selected {
    background-color: #e6e6f7;
    color: #6124e2;
  }

  .lattice-select__single-value {
    color: #2e2e34;
    font-size: 14px;
    line-height: 19px;
  }

  .lattice-select__indicator-container {
    margin-right: '5px';
    color: '#b6bbc7';
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
    color: #b6bbc7;
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
    let border = isFocused ? 'solid 1px #6124e2' : `solid 1px ${OL.GREY08}`;

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
    const color = isSelected ? '#6124e2' : '#555e6f';
    let backgroundColor = 'white';

    if (isSelected) {
      backgroundColor = '#e6e6f7';
    }
    else if (isFocused) {
      backgroundColor = '#f0f0f7';
    }

    return {
      ...base,
      color,
      backgroundColor,
      ':active': {
        backgroundColor: '#e4d8ff'
      }
    };
  },
  singleValue: (base, state) => {
    const { isDisabled } = state;
    return { ...base, color: isDisabled ? '#8e929b' : '#2e2e34' };
  },
  indicatorSeparator: () => ({ display: 'none' }),
  indicatorsContainer: base => ({ ...base, marginRight: '10px', color: '#b6bbc7' }),
  clearIndicator: base => ({ ...base, padding: '0', margin: '5px' }),
  dropdownIndicator: (base, state) => {
    const { selectProps } = state;
    const style = {
      color: '#b6bbc7',
      padding: '0',
      margin: '5px',
      display: selectProps && selectProps.hideMenu ? 'none' : 'flex'
    };
    return { ...base, ...style };
  },
};
