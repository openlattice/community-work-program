// @flow
import React, { Component } from 'react';

import { Map, fromJS } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import {
  Button,
  CardSegment,
  DatePicker,
  Input,
  Label,
  TextArea
} from 'lattice-ui-kit';
import { DateTime } from 'luxon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { FQN } from 'lattice';
import type { RequestSequence } from 'redux-reqseq';

import { addWorksite } from './WorksitesActions';

import {
  ButtonsRow,
  ButtonsWrapper,
  FormRow,
  RowContent,
} from '../../components/Layout';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getEntityKeyId } from '../../utils/DataUtils';
import { APP, EDM, STATE } from '../../utils/constants/ReduxStateConsts';

const {
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData
} = DataProcessingUtils;
const { OPERATES, ORGANIZATION, WORKSITE } = APP_TYPE_FQNS;
const {
  DATETIME,
  DATETIME_END,
  DATETIME_START,
  DESCRIPTION,
  NAME,
} = PROPERTY_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQNS } = EDM;

type Props = {
  actions:{
    addWorksite :RequestSequence;
  };
  entitySetIds :Map;
  isLoading :boolean;
  onDiscard :() => void;
  organization :Map;
  propertyTypeIds :Map;
};

type State = {
  newWorksiteData :Map;
};

class AddWorksiteForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      newWorksiteData: fromJS({
        [getPageSectionKey(1, 1)]: {}
      }),
    };
  }

  handleDateChange = (name :FQN) => (date :string) => {
    const { newWorksiteData } = this.state;
    const splitDate :number[] = date.split('-')
      .map((string :string) => parseInt(string, 10));
    const dateAsDateTime = DateTime.local(splitDate[0], splitDate[1], splitDate[2]).toISO();
    this.setState({ newWorksiteData: newWorksiteData.setIn([getPageSectionKey(1, 1), name], dateAsDateTime) });
  }

  handleInputChange = (e :SyntheticEvent<HTMLInputElement>) => {
    const { newWorksiteData } = this.state;
    const { name, value } = e.currentTarget;
    this.setState({ newWorksiteData: newWorksiteData.setIn([getPageSectionKey(1, 1), name], value) });
  }

  handleOnSubmit = () => {
    const {
      actions,
      entitySetIds,
      organization,
      propertyTypeIds
    } = this.props;
    const { newWorksiteData } = this.state;
    const organizationEKID :UUID = getEntityKeyId(organization);
    const associations = [];
    const nowAsIso = DateTime.local().toISO();

    associations.push([OPERATES, organizationEKID, ORGANIZATION, 0, WORKSITE, {
      [DATETIME]: [nowAsIso]
    }]);
    const entityData :{} = processEntityData(newWorksiteData, entitySetIds, propertyTypeIds);
    const associationEntityData :{} = processAssociationEntityData(fromJS(associations), entitySetIds, propertyTypeIds);

    actions.addWorksite({ associationEntityData, entityData });
  }

  render() {
    const { isLoading, onDiscard } = this.props;
    return (
      <CardSegment padding="sm">
        <FormRow>
          <RowContent>
            <Label>Worksite name</Label>
            <Input
                name={getEntityAddressKey(0, WORKSITE, NAME)}
                onChange={this.handleInputChange}
                type="text" />
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <Label>Description of work available</Label>
            <TextArea
                name={getEntityAddressKey(0, WORKSITE, DESCRIPTION)}
                onChange={this.handleInputChange} />
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent style={{ marginTop: '20px' }}>
            <Label bold>If applicable:</Label>
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <Label>Date first active</Label>
            <DatePicker
                name={getEntityAddressKey(0, WORKSITE, DATETIME_START)}
                onChange={this.handleDateChange(getEntityAddressKey(0, WORKSITE, DATETIME_START))} />
          </RowContent>
          <RowContent>
            <Label>Date no longer active</Label>
            <DatePicker
                name={getEntityAddressKey(0, WORKSITE, DATETIME_END)}
                onChange={this.handleDateChange(getEntityAddressKey(0, WORKSITE, DATETIME_END))} />
          </RowContent>
        </FormRow>
        <ButtonsRow>
          <RowContent>
            <ButtonsWrapper>
              <Button onClick={onDiscard}>Discard</Button>
            </ButtonsWrapper>
          </RowContent>
          <RowContent>
            <ButtonsWrapper>
              <Button
                  isLoading={isLoading}
                  mode="primary"
                  onClick={this.handleOnSubmit}>
                Submit
              </Button>
            </ButtonsWrapper>
          </RowContent>
        </ButtonsRow>
      </CardSegment>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const app = state.get(STATE.APP);
  const edm = state.get(STATE.EDM);
  const selectedOrgId :string = app.get(SELECTED_ORG_ID);
  return ({
    entitySetIds: app.getIn([ENTITY_SET_IDS_BY_ORG, selectedOrgId], Map()),
    propertyTypeIds: edm.getIn([TYPE_IDS_BY_FQNS, PROPERTY_TYPES], Map()),
  });
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    addWorksite,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AddWorksiteForm);
