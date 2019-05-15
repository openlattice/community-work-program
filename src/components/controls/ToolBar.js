// @flow
import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';

import SearchContainer from '../../containers/search/SearchContainer';

import { OL } from '../../core/style/Colors';
import { APP_CONTAINER_MAX_WIDTH, APP_CONTAINER_WIDTH, APP_CONTENT_PADDING } from '../../core/style/Sizes';
import { PrimaryButton, StyledFunctionSelect } from './index';

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
  padding: ${APP_CONTENT_PADDING}px;
  display: flex;
  flex: 1 0 auto;
  justify-content: flex-start;
  align-items: center;
`;

const ActionsWrapper = styled.span`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

type Props = {
  buttonAction :() => void;
  buttonText :string;
  dropdowns :List;
  onSelectFunctions :Map;
  search :(input :string) => void;
};

const ToolBar = ({
  buttonAction,
  buttonText,
  dropdowns,
  onSelectFunctions,
  search,
} :Props) => (
  <ToolBarWrapper>
    <ToolBarInnerWrapper>
      <ActionsWrapper>
        <SearchContainer
            search={search} />
        {
          dropdowns.map((dropdownMap :Map) => (
            <StyledFunctionSelect
                key={dropdownMap.get('title')}
                onSelect={onSelectFunctions.get(dropdownMap.get('title'))}
                onSelectFunctions={onSelectFunctions}
                options={dropdownMap.get('enums')}
                title={dropdownMap.get('title')} />
          ))
        }
      </ActionsWrapper>
      {
        (buttonAction && buttonText)
          ? (
            <PrimaryButton>{buttonText}</PrimaryButton>
          ) : null
      }
    </ToolBarInnerWrapper>
  </ToolBarWrapper>
);

export default ToolBar;
