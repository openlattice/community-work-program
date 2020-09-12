// @flow
import React, { Fragment, useState } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Button, Select } from 'lattice-ui-kit';

import SearchContainer from '../../containers/search/SearchContainer';
import { OL } from '../../core/style/Colors';
import { ButtonWrapper, ButtonsWrapper } from '../Layout';

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
  width: 100%;
  padding: 0 30px;
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
  search :(input :string) => void;
  primaryButtonAction :?() => void;
  primaryButtonText :?string;
  tertiaryButtonAction :?() => void;
  tertiaryButtonText :?string;
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
          <Button onClick={() => showFilters(!filtersVisible)}>
            { filtersVisible ? 'Close Filter' : 'Open Filter'}
          </Button>
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
                  <Fragment key={`${dropdownMap.get('title')}-fragment`}>
                    <FiltersHeader>
                      { dropdownMap.get('title') }
                      :
                    </FiltersHeader>
                    <SelectWrapper>
                      <Select
                          key={dropdownMap.get('title')}
                          onChange={onSelectFunctions.get(dropdownMap.get('title'))}
                          options={dropdownMap.get('enums')}
                          placeholder="All" />
                    </SelectWrapper>
                  </Fragment>
                ))
              }
            </ActionsWrapper>
          </ToolBarRowWrapper>
        )
      }
    </ToolBarWrapper>
  );
};

ToolBar.defaultProps = {
  primaryButtonAction: undefined,
  primaryButtonText: undefined,
  tertiaryButtonAction: undefined,
  tertiaryButtonText: undefined,
};

export default ToolBar;
