// @flow
import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';

import { StyledInput, StyledFunctionSelect } from '../controls/index';
import searchIcon from '../../assets/svg/search-icon.svg';

import { OL } from '../../core/style/Colors';
import { APP_CONTAINER_MAX_WIDTH, APP_CONTAINER_WIDTH } from '../../core/style/Sizes';

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

const ToolBarInnerWrapper = styled.div`
  height: 100%;
  max-width: ${APP_CONTAINER_MAX_WIDTH}px;
  min-width: ${APP_CONTAINER_WIDTH}px;
  display: flex;
  flex: 1 0 auto;
  justify-content: flex-start;
  align-items: center;
`;

const FormattedInput = styled(StyledInput)`
  width: 250px;
  margin: 10px;
  padding: 0 20px;
  height: 35px;
`;

type Props = {
  dropdowns :List;
};

const ToolBar = ({ dropdowns } :Props) => (
  <ToolBarWrapper>
    <ToolBarInnerWrapper>
      <FormattedInput
          icon={searchIcon}
          placeholder="Search name" />
      {
        dropdowns.map((dropdownMap :Map) => (
          <StyledFunctionSelect
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
