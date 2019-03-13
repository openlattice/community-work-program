// @flow
import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';

import StyledSelect from './StyledSelect';
import SearchContainer from '../../containers/search/SearchContainer';

import { OL } from '../../utils/constants/Colors';

const ToolBarWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  height: 50px;
  border-bottom: 1px solid ${OL.GREY11};
  background-color: ${OL.WHITE};
  padding: 0 20px;
`;

type Props = {
  dropdowns :List;
  search :(input :string) => void;
};

const ToolBar = ({ dropdowns, search } :Props) => (
  <ToolBarWrapper>
    <SearchContainer
        search={search} />
    {
      dropdowns.map((dropdownMap :Map) => (
        <StyledSelect
            key={dropdownMap.get('title')}
            onSelect={() => {}}
            options={dropdownMap.get('enums')}
            title={dropdownMap.get('title')} />
      ))
    }
  </ToolBarWrapper>
);

export default ToolBar;
