/*
 * @flow
 */

import React, { Component } from 'react';
import styled, { css } from 'styled-components';
import { List, Map } from 'immutable';
import { faTimes } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { OL } from '../../core/style/Colors';
import downArrowIcon from '../../assets/svg/down-arrow.svg';

/*
 * styled components
 */

const SelectWrapper = styled.div`
  border: none;
  display: flex;
  flex-direction: column;
  margin-right: 10px;
  padding: 0;
  position: relative;
  min-width: 150px;
  height: 35px;
`;

const InnerSelectWrapper = styled.div`
  display: flex;
  flex: 0 0 auto;
  flex-direction: row;
  position: relative;
  width: 100%;
  height: 100%;
`;

const Select = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1 0 auto;
  border: 1px solid ${OL.GREY05};
  border-radius: 3px;
  color: ${OL.GREY01};
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 24px;
  outline: none;
  padding: 0 45px 0 10px;
  &:focus {
    border-color: ${OL.PURPLE02};
  }
  background-color: ${OL.WHITE};
`;

const SelectCategory = styled.div`
  color: ${OL.GREY02};
  font-size: 14px;
  margin-left: 10px;
`;

const SelectIcon = styled.div`
  align-self: center;
  color: ${OL.GREY20};
  position: absolute;
  margin: 0 20px;
  right: 0;

  &:hover {
    cursor: pointer;
  }
`;

const CloseIcon = styled.div`
  align-self: center;
  color: ${OL.GREY20};
  position: absolute;
  right: 20px;

  &:hover {
    cursor: pointer;
  }
`;

const DataTableWrapper = styled.div`
  background-color: ${OL.GREY16};
  border-radius: 5px;
  border: 1px solid ${OL.GREY11};
  position: absolute;
  z-index: 1;
  width: 100%;
  visibility: ${props => (props.isVisible ? 'visible' : 'hidden')}};
  box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.1);
  margin: ${props => (props.openAbove ? '-303px 0 0 0' : '45px 0 0 0')};
  bottom: ${props => (props.openAbove ? '45px' : 'auto')};
`;

const SearchOption = styled.div`
  padding: 10px 20px;

  &:hover {
    background-color: ${OL.GREY08};
    cursor: pointer;
  }

  &:active {
    background-color: ${OL.PURPLE06};
  }
`;

const SearchOptionContainer = styled.div`
  max-height: 300px;
  overflow-x: auto;
  overflow-y: scroll;

  &::-webkit-scrollbar-thumb {
    background-color: ${props => (props.scrollVisible ? OL.GREY03 : 'transparent')};
    border-radius: ${props => (props.scrollVisible ? 3 : 0)}px;
  }

  &::-webkit-scrollbar {
    width: ${props => (props.scrollVisible ? 10 : 0)}px;
    display: ${props => (props.scrollVisible ? 'initial' : 'none')};
  }

`;

/*
 * react component
 */

type Props = {
  openAbove :boolean;
  onSelect :() => void;
  options :List;
  scrollVisible :boolean;
  title :string;
};

type State = {
  isVisibleDataTable :boolean;
  selectedLabel :string;
};

class StyledSelect extends Component<Props, State> {

  static defaultProps = {
    openAbove: false,
    options: List(),
    onSelect: () => {},
    scrollVisible: false,
    title: '',
  };

  constructor(props :Props) {

    super(props);

    this.state = {
      isVisibleDataTable: false,
      selectedLabel: '',
    };
  }

  componentDidMount() {
    const { options } = this.props;

    if (options) {
      options.forEach((option :Map) => {
        if (option.get('default')) {
          this.setState({ selectedLabel: option.get('label') });
        }
      });
    }
  }

  hideDataTable = () => {
    this.setState({
      isVisibleDataTable: false,
    });
  }

  showDataTable = (e :Event) => {
    e.stopPropagation();

    this.setState({
      isVisibleDataTable: true,
    });
  }

  handleOnSelect = (selectedOption :Map) => {
    const { onSelect } = this.props;

    this.setState({
      selectedLabel: selectedOption.get('label'),
    });

    onSelect();
    this.hideDataTable();
  }

  renderTable = () => {
    const { scrollVisible, options } = this.props;
    const enums = options.map(value => (
      <SearchOption
          key={value.get('label')}
          onMouseDown={() => this.handleOnSelect(value)}>
        {value.get('label')}
      </SearchOption>
    ));
    return <SearchOptionContainer scrollVisible={scrollVisible}>{enums}</SearchOptionContainer>;
  }

  render() {
    const { isVisibleDataTable, selectedLabel } = this.state;
    const {
      openAbove,
      title,
    } = this.props;
    return (
      <SelectWrapper isVisibleDataTable={isVisibleDataTable}>
        <InnerSelectWrapper>
          <Select>
            {title}
            <SelectCategory>{selectedLabel}</SelectCategory>
          </Select>
          {
            isVisibleDataTable ? (
              <CloseIcon onClick={this.hideDataTable}>
                <FontAwesomeIcon icon={faTimes} />
              </CloseIcon>
            ) : (
              <SelectIcon
                  onClick={this.showDataTable}>
                <img src={downArrowIcon} alt="" />
              </SelectIcon>
            )
          }
        </InnerSelectWrapper>
        {
          !isVisibleDataTable
            ? null
            : (
              <DataTableWrapper isVisible={isVisibleDataTable} openAbove={openAbove}>
                {this.renderTable()}
              </DataTableWrapper>
            )
        }
      </SelectWrapper>
    );
  }
}

export default StyledSelect;
