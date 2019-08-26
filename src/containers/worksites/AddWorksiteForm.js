// @flow
import React, { Component } from 'react';
import { fromJS, Map } from 'immutable';
import { DateTime } from 'luxon';
import { DataProcessingUtils } from 'lattice-fabricate';
import {
  Button,
  CardSegment,
  DatePicker,
  Input,
  Label,
  TextArea
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';
import type { FQN } from 'lattice';

import { addWorksite } from './WorksitesActions';
import { getEntityKeyId, getEntitySetIdFromApp, getPropertyTypeIdFromEdm } from '../../utils/DataUtils';
import { APP_TYPE_FQNS, DATETIME, WORKSITE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import {
  ButtonsRow,
  ButtonsWrapper,
  FormRow,
  RowContent,
} from '../../components/Layout';

const {
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData
} = DataProcessingUtils;
const { OPERATES, ORGANIZATION, WORKSITE } = APP_TYPE_FQNS;
const {
  DATETIME_END,
  DATETIME_START,
  DESCRIPTION,
  NAME,
} = WORKSITE_FQNS;

type Props = {
  actions:{
    addWorksite :RequestSequence;
  };
  app :Map;
  edm :Map;
  isLoading :boolean;
  onDiscard :() => void;
  organization :Map;
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
      app,
      edm,
      organization
    } = this.props;
    const { newWorksiteData } = this.state;

    const entitySetIds :{} = {
      [ORGANIZATION]: getEntitySetIdFromApp(app, ORGANIZATION),
      [WORKSITE]: getEntitySetIdFromApp(app, WORKSITE),
      [OPERATES]: getEntitySetIdFromApp(app, OPERATES),
    };
    const propertyTypeIds :{} = {
      [DATETIME]: getPropertyTypeIdFromEdm(edm, DATETIME),
      [DATETIME_START]: getPropertyTypeIdFromEdm(edm, DATETIME_START),
      [DATETIME_END]: getPropertyTypeIdFromEdm(edm, DATETIME_END),
      [DESCRIPTION]: getPropertyTypeIdFromEdm(edm, DESCRIPTION),
      [NAME]: getPropertyTypeIdFromEdm(edm, NAME),
    };

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
      <CardSegment padding="small" vertical>
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

const mapStateToProps = (state :Map) => ({
  app: state.get(STATE.APP),
  edm: state.get(STATE.EDM),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    addWorksite,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AddWorksiteForm);
