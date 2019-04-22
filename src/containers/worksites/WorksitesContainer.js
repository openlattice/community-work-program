// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';

import { statusDropdown } from './WorksitesConstants';

import {
  ContainerOuterWrapper,
  ContainerInnerWrapper,
  HeaderWrapper,
  ContainerHeader,
  ContainerSubHeader,
} from '../../components/Layout';
import { ToolBar } from '../../components/controls/index';
import { OL } from '../../core/style/Colors';

/*
 * styled components
 */

const Separator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${OL.GREY02};
  font-weight: 600;
  margin: 0 10px 40px 10px;
`;

/*
 * constants
 */

const dropdowns :List = List().withMutations((list :List) => {
  list.set(0, statusDropdown);
});

/*
 * Props and State
 */

type Props = {};

/*
 * React component
 */

class WorksitesContainer extends Component<Props> {

  handleOnFilter = () => {
  }

  render() {
    const onSelectFunctions = Map().withMutations((map :Map) => {
      map.set('Status', this.handleOnFilter);
    });
    return (
      <ContainerOuterWrapper>
        <ToolBar
            buttonAction={() => {}}
            buttonText="Add Worksite"
            dropdowns={dropdowns}
            onSelectFunctions={onSelectFunctions}
            search={() => {}} />
        <ContainerInnerWrapper>
          <HeaderWrapper>
            <ContainerHeader>Worksites</ContainerHeader>
            <ContainerSubHeader>10 Organizations</ContainerSubHeader>
            <Separator>•</Separator>
            <ContainerSubHeader>21 Worksites</ContainerSubHeader>
          </HeaderWrapper>
        </ContainerInnerWrapper>
      </ContainerOuterWrapper>
    );
  }
}

export default WorksitesContainer;
