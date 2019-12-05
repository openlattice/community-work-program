// @flow
import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Button, Select, Sizes } from 'lattice-ui-kit';

import SearchContainer from '../../containers/search/SearchContainer';
import { ButtonWrapper, ButtonsWrapper } from '../Layout';

import { OL } from '../../core/style/Colors';
import { APP_CONTAINER_MAX_WIDTH, APP_CONTAINER_WIDTH } from '../../core/style/Sizes';

const { APP_CONTENT_WIDTH } = Sizes;

const ToolBarWrapper = styled.div`
  align-items: center;
  background-color: ${OL.WHITE};
  border-bottom: 1px solid ${OL.GREY11};
  display: flex;
  height: 60px;
  justify-content: center;
  width: 100%;
`;

const ToolBarInnerWrapper = styled.div`
  align-self: center;
  align-items: center;
  display: flex;
  flex: 1 0 auto;
  height: 100%;
  justify-content: space-between;
  /* max-width: ${APP_CONTAINER_MAX_WIDTH}px;
  min-width: ${APP_CONTAINER_WIDTH}px; */
  width: ${APP_CONTENT_WIDTH}px;
  padding: 0 30px;
`;

const ActionsWrapper = styled.span`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const SelectWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 175px;
  height: 35px;
  margin: 10px 10px 10px 0;
`;

type Props = {
  dropdowns :List;
  onSelectFunctions :Map;
  primaryButtonAction :() => void;
  primaryButtonText :string;
  search :(input :string) => void;
};

const ToolBar = ({
  dropdowns,
  onSelectFunctions,
  primaryButtonAction,
  primaryButtonText,
  search,
} :Props) => (
  <ToolBarInnerWrapper>
    <ActionsWrapper>
      <SearchContainer
          search={search} />
      {
        dropdowns.map((dropdownMap :Map) => (
          <SelectWrapper key={`${dropdownMap.get('title')}-wrapper`}>
            <Select
                key={dropdownMap.get('title')}
                onChange={onSelectFunctions.get(dropdownMap.get('title'))}
                options={dropdownMap.get('enums')}
                placeholder={dropdownMap.get('title')} />
          </SelectWrapper>
        ))
      }
    </ActionsWrapper>
    <ButtonsWrapper>
      {
        (primaryButtonAction && primaryButtonText)
          ? (
            <ButtonWrapper>
              <Button mode="primary" onClick={primaryButtonAction}>{ primaryButtonText }</Button>
            </ButtonWrapper>
          )
          : null
      }
    </ButtonsWrapper>
  </ToolBarInnerWrapper>
);

export default ToolBar;
