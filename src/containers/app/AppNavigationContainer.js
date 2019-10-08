/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { Colors } from 'lattice-ui-kit';
import { withRouter } from 'react-router';
import { NavLink } from 'react-router-dom';

import * as Routes from '../../core/router/Routes';

const { NEUTRALS, PURPLES } = Colors;

const NAV_LINK_ACTIVE_CLASSNAME :string = 'nav-link-active';

const NavigationContentWrapper = styled.nav`
  display: flex;
  flex: 0 0 auto;
  justify-content: flex-start;
  margin-left: 30px;
`;

// 2019-02-19 - Cannot call `styled(...).attrs` because undefined [1] is incompatible with string [2].
// $FlowFixMe
const NavLinkWrapper = styled(NavLink).attrs({
  activeClassName: NAV_LINK_ACTIVE_CLASSNAME
})`
  align-items: center;
  border-bottom: 3px solid transparent;
  color: ${NEUTRALS[1]};
  display: flex;
  font-size: 12px;
  letter-spacing: 0;
  margin-right: 30px;
  outline: none;
  padding: 13px 2px 10px 2px;
  text-align: left;
  text-decoration: none;

  &:focus {
    text-decoration: none;
  }

  &:hover {
    color: ${NEUTRALS[0]};
    cursor: pointer;
    outline: none;
    text-decoration: none;
  }

  &.${NAV_LINK_ACTIVE_CLASSNAME} {
    border-bottom: 3px solid ${PURPLES[1]};
    color: ${PURPLES[1]};
  }
`;

const AppNavigationContainer = () => (
  <NavigationContentWrapper>
    <NavLinkWrapper to={Routes.DASHBOARD}>Dashboard</NavLinkWrapper>
    <NavLinkWrapper to={Routes.PARTICIPANTS}>Participants</NavLinkWrapper>
    <NavLinkWrapper to={Routes.WORKSITES}>Work Sites</NavLinkWrapper>
    <NavLinkWrapper to={Routes.WORK_SCHEDULE}>Work Schedule</NavLinkWrapper>
  </NavigationContentWrapper>
);

export default withRouter<*>(AppNavigationContainer);
