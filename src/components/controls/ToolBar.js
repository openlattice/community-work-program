// @flow
import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';

import StyledSelect from './StyledSelect';
import SearchContainer from '../../containers/search/SearchContainer';

import { OL } from '../../utils/constants/Colors';
import { APP_CONTAINER_MAX_WIDTH, APP_CONTAINER_WIDTH } from '../../core/style/Sizes';

const ToolBarWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 50px;
  border-bottom: 1px solid ${OL.GREY11};
  background-color: ${OL.WHITE};
  padding: 0 20px;
`;

const ToolBarInnerWrapper = styled.div`
  height: 100%;
  max-width: ${APP_CONTAINER_MAX_WIDTH}px;
  min-width: ${APP_CONTAINER_WIDTH}px;
  display: flex;
  flex: 1 0 auto;
  justify-content: flex-start;
  align-items: center;
`;

type Props = {
  dropdowns :List;
  search :(input :string) => void;
};

const ToolBar = ({ dropdowns, search } :Props) => (
  <ToolBarWrapper>
    <ToolBarInnerWrapper>
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
    </ToolBarInnerWrapper>
  </ToolBarWrapper>
);

export default ToolBar;
