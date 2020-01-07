// @flow
import React, { useState } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Button, IconButton, Select } from 'lattice-ui-kit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/pro-light-svg-icons';

import SearchContainer from '../../containers/search/SearchContainer';
import { ButtonWrapper, ButtonsWrapper } from '../Layout';
import { OL } from '../../core/style/Colors';
import { APP_CONTAINER_MAX_WIDTH } from '../../core/style/Sizes';

const ToolBarWrapper = styled.div`
  align-items: center;
  background-color: ${OL.WHITE};
  border-bottom: 1px solid ${OL.GREY11};
  display: flex;
  flex-direction: column;
  min-height: 60px;
  justify-content: center;
  width: 100%;
`;

const ToolBarRowWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  max-width: ${APP_CONTAINER_MAX_WIDTH}px;
  min-width: 1078px;
`;

const ActionsWrapper = styled.span`
  align-items: center;
  display: flex;
  justify-content: flex-start;
`;

const SelectWrapper = styled.div`
  align-items: center;
  display: flex;
  height: 35px;
  justify-content: center;
  margin: 10px 10px 10px 0;
  min-width: 175px;
`;

const FiltersHeader = styled.div`
  color: ${OL.GRAY_02};
  font-size: 14px;
  font-weight: 600;
  margin-left: 10px;
  margin-right: 20px;
`;

type Props = {
  dropdowns :List;
  onSelectFunctions :Map;
  primaryButtonAction :() => void;
  primaryButtonText :string;
  search :(input :string) => void;
  tertiaryButtonAction :() => void;
  tertiaryButtonText :string;
};

const ToolBar = ({
  dropdowns,
  onSelectFunctions,
  primaryButtonAction,
  primaryButtonText,
  search,
  tertiaryButtonAction,
  tertiaryButtonText,
} :Props) => {

  const [filtersVisible, showFilters] = useState(false);
  return (
    <ToolBarWrapper>
      <ToolBarRowWrapper>
        <ActionsWrapper>
          <SearchContainer
              search={search} />
          <IconButton
              icon={<FontAwesomeIcon icon={faFilter} />}
              onClick={() => showFilters(!filtersVisible)}>
            Filter
          </IconButton>
        </ActionsWrapper>
        <ButtonsWrapper>
          {
            (tertiaryButtonAction && tertiaryButtonText)
              ? (
                <ButtonWrapper>
                  <Button onClick={tertiaryButtonAction}>{ tertiaryButtonText }</Button>
                </ButtonWrapper>
              )
              : null
          }
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
      </ToolBarRowWrapper>
      {
        filtersVisible && (
          <ToolBarRowWrapper>
            <ActionsWrapper>
              {
                dropdowns.map((dropdownMap :Map) => (
                  <>
                    <FiltersHeader>
                      { dropdownMap.get('title') }
                      :
                    </FiltersHeader>
                    <SelectWrapper key={`${dropdownMap.get('title')}-wrapper`}>
                      <Select
                          key={dropdownMap.get('title')}
                          onChange={onSelectFunctions.get(dropdownMap.get('title'))}
                          options={dropdownMap.get('enums')}
                          placeholder="All" />
                    </SelectWrapper>
                  </>
                ))
              }
            </ActionsWrapper>
          </ToolBarRowWrapper>
        )
      }
    </ToolBarWrapper>
  );
};

export default ToolBar;
