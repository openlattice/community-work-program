// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { StyledInput } from '../../components/controls/index';

const FormattedInput = styled(StyledInput)`
  width: 250px;
  margin: 10px;
  padding: 0 20px;
  height: 35px;
`;

type Props = {
  search :(input :string) => void;
};

type State = {
  searchedName :string;
};

class SearchContainer extends Component<Props, State> {
  constructor(props :Props) {
    super(props);

    this.state = {
      searchedName: '',
    };
  }

  onChange = (e :Event) => {
    const { search } = this.props;

    this.setState({
      searchedName: e.target.value
    });

    search(e.target.value);
  }

  render() {
    const { searchedName } = this.state;
    return (
      <FormattedInput
          onChange={this.onChange}
          placeholder="Search name"
          value={searchedName} />
    );
  }
}

export default SearchContainer;
