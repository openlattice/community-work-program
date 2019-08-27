/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { AuthActions, AuthUtils } from 'lattice-auth';
import { Button, Colors, Select } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import AppNavigationContainer from './AppNavigationContainer';
import OpenLatticeLogo from '../../assets/images/logo_v2.png';
import * as Routes from '../../core/router/Routes';
import {
  APP_CONTAINER_MAX_WIDTH,
  APP_CONTAINER_WIDTH,
  APP_CONTENT_PADDING,
} from '../../core/style/Sizes';

const { NEUTRALS, WHITE } = Colors;

// TODO: this should come from lattice-ui-kit, maybe after the next release. current version v0.1.1
const APP_HEADER_BORDER :string = '#e6e6eb';

const AppHeaderOuterWrapper = styled.header`
  background-color: ${WHITE};
  border-bottom: 1px solid ${APP_HEADER_BORDER};
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
`;

const AppHeaderInnerWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1 0 auto;
  justify-content: space-between;
  max-width: ${APP_CONTAINER_MAX_WIDTH}px;
  min-width: ${APP_CONTAINER_WIDTH}px;
  padding: 0 ${APP_CONTENT_PADDING}px;
`;

const LeftSideContentWrapper = styled.div`
  display: flex;
  flex: 0 0 auto;
  justify-content: flex-start;
`;

const RightSideContentWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1 0 auto;
  justify-content: flex-end;
`;

const LogoTitleWrapperLink = styled(Link)`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex: 0 0 auto;
  padding: 15px 0;
  text-decoration: none;

  &:focus {
    text-decoration: none;
  }

  &:hover {
    outline: none;
    text-decoration: none;
  }
`;

// 2019-02-19 - Cannot call `styled.img.attrs` because undefined [1] is incompatible with string [2].
// $FlowFixMe
const AppLogoIcon = styled.img.attrs({
  alt: 'OpenLattice Logo Icon',
  src: OpenLatticeLogo,
})`
  height: 26px;
`;

const AppTitle = styled.h1`
  color: ${NEUTRALS[0]};
  font-size: 14px;
  font-weight: 600;
  line-height: normal;
  margin: 0 0 0 10px;
`;

const LogoutButton = styled(Button)`
  font-size: 12px;
  line-height: 16px;
  margin-left: 30px;
  padding: 6px 29px;
`;

const DisplayName = styled.span`
  color: #2e2e34;
  font-size: 12px;
`;

const SelectWrapper = styled.div`
  min-width: 200px;
  margin: 0 10px;
`;

type Props = {
  actions :{
    logout :() => void;
  };
  loading :boolean;
  organizations :Map<*, *>;
  selectedOrg :string;
  switchOrg :(organization :Object) => void;
};

class AppHeaderContainer extends Component<Props> {

  renderDisplayName = () => {
    const userInfo = AuthUtils.getUserInfo();

    if (userInfo.email && userInfo.email.length > 0) {
      return <DisplayName>{userInfo.email}</DisplayName>;
    }
    return null;
  };

  renderOrgSelector = () => {
    const {
      organizations,
      selectedOrg,
      switchOrg,
      loading
    } = this.props;

    return (
      <Select
          value={organizations.find(option => option.value === selectedOrg)}
          isClearable={false}
          isLoading={loading}
          isMulti={false}
          onChange={switchOrg}
          options={organizations.toJS()}
          placeholder="Select..." />
    );
  }

  renderLeftSideContent = () => (
    <LeftSideContentWrapper>
      <LogoTitleWrapperLink to={Routes.ROOT}>
        <AppLogoIcon />
        <AppTitle>
          Community Work Program
        </AppTitle>
      </LogoTitleWrapperLink>
      <AppNavigationContainer />
    </LeftSideContentWrapper>
  )

  renderRightSideContent = () => {

    const { actions } = this.props;
    return (
      <RightSideContentWrapper>
        <SelectWrapper>{ this.renderOrgSelector() }</SelectWrapper>
        { this.renderDisplayName() }
        <LogoutButton onClick={actions.logout}>
          Log Out
        </LogoutButton>
      </RightSideContentWrapper>
    );
  }

  render() {

    return (
      <AppHeaderOuterWrapper>
        <AppHeaderInnerWrapper>
          { this.renderLeftSideContent() }
          { this.renderRightSideContent() }
        </AppHeaderInnerWrapper>
      </AppHeaderOuterWrapper>
    );
  }
}

const mapDispatchToProps = (dispatch :Function) :Object => ({
  actions: bindActionCreators({
    logout: AuthActions.logout,
  }, dispatch)
});

export default withRouter<*>(
  connect(null, mapDispatchToProps)(AppHeaderContainer)
);
