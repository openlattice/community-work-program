// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { fromJS, Map } from 'immutable';
import { DateTime } from 'luxon';
import { Card, CardHeader, CardStack } from 'lattice-ui-kit';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { addNewParticipantContacts, editParticipantContacts, editPersonDetails } from './ParticipantActions';
import { goToRoute } from '../../core/router/RoutingActions';
import {
  contactsSchema,
  contactsUiSchema,
  personSchema,
  personUiSchema,
} from './schemas/EditPersonAndContactsSchemas';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getPropertyTypeIdFromEdm
} from '../../utils/DataUtils';
import { BackNavButton } from '../../components/controls/index';
import { PARTICIPANT_PROFILE_WIDTH } from '../../core/style/Sizes';
import {
  ADDRESS_FQNS,
  APP_TYPE_FQNS,
  CONTACT_INFO_FQNS,
  PEOPLE_FQNS,
} from '../../core/edm/constants/FullyQualifiedNames';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import * as Routes from '../../core/router/Routes';

const {
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData,
} = DataProcessingUtils;

const { LOCATION_ADDRESS } = ADDRESS_FQNS;
const {
  ADDRESS,
  CONTACT_INFORMATION,
  CONTACT_INFO_GIVEN,
  LOCATED_AT,
  PEOPLE
} = APP_TYPE_FQNS;
const { EMAIL, PHONE_NUMBER, PREFERRED } = CONTACT_INFO_FQNS;
const {
  DOB,
  ETHNICITY,
  FIRST_NAME,
  LAST_NAME,
  MUGSHOT,
  RACE,
  SEX,
} = PEOPLE_FQNS;

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-self: center;
  width: ${PARTICIPANT_PROFILE_WIDTH}px;
  margin-top: 30px;
  position: relative;
`;

const ButtonWrapper = styled.div`
  margin-bottom: 30px;
`;

type Props = {
  actions:{
    addNewParticipantContacts :RequestSequence;
    editParticipantContacts :RequestSequence;
    editPersonDetails :RequestSequence;
    goToRoute :RequestSequence;
  },
  address :Map;
  app :Map;
  edm :Map;
  email :Map;
  participant :Map;
  phone :Map;
};

type State = {
  contactsFormData :Object;
  contactsPrepopulated :boolean;
  personFormData :Object;
  personPrepopulated :boolean;
};

class EditPersonAndContactsForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    const { personFormData, contactsFormData } = this.constructOriginalData();
    const personPrepopulated :boolean = !personFormData.isEmpty();
    const contactsPrepopulated :boolean = !contactsFormData.isEmpty();

    this.state = {
      contactsFormData: contactsPrepopulated ? contactsFormData.toJS() : {},
      contactsPrepopulated,
      personFormData: personPrepopulated ? personFormData.toJS() : {},
      personPrepopulated,
    };
  }

  componentDidUpdate(prevProps :Props) {
    const { address, email, phone } = this.props;
    if (!prevProps.address.equals(address) || !prevProps.email.equals(email) || !prevProps.phone.equals(phone)) {
      this.prepopulateFormData();
    }
  }

  prepopulateFormData = () => {
    const { personFormData, contactsFormData } = this.constructOriginalData();
    const personPrepopulated = !personFormData.isEmpty();
    const contactsPrepopulated = !contactsFormData.isEmpty();

    this.setState({
      contactsFormData: contactsPrepopulated ? contactsFormData.toJS() : {},
      contactsPrepopulated,
      personFormData: personPrepopulated ? personFormData.toJS() : {},
      personPrepopulated,
    });
  }

  constructOriginalData = () => {
    const {
      address,
      email,
      participant,
      phone
    } = this.props;

    const {
      [DOB]: dateOfBirth,
      [ETHNICITY]: ethnicity,
      [FIRST_NAME]: firstName,
      [LAST_NAME]: lastName,
      [RACE]: race,
      [SEX]: sex,
    } = getEntityProperties(participant, [DOB, ETHNICITY, FIRST_NAME, LAST_NAME, MUGSHOT, RACE, SEX]);

    const personFormData :Map = Map().withMutations((map :Map) => {
      if (firstName) map.setIn([getPageSectionKey(1, 1), getEntityAddressKey(0, PEOPLE, FIRST_NAME)], firstName);
      if (lastName) map.setIn([getPageSectionKey(1, 1), getEntityAddressKey(0, PEOPLE, LAST_NAME)], lastName);
      if (dateOfBirth) map.setIn([getPageSectionKey(1, 1), getEntityAddressKey(0, PEOPLE, DOB)], dateOfBirth);
      if (race) map.setIn([getPageSectionKey(1, 1), getEntityAddressKey(0, PEOPLE, RACE)], race);
      if (ethnicity) map.setIn([getPageSectionKey(1, 1), getEntityAddressKey(0, PEOPLE, ETHNICITY)], ethnicity);
      if (sex) map.setIn([getPageSectionKey(1, 1), getEntityAddressKey(0, PEOPLE, SEX)], sex);
    });

    const { [PHONE_NUMBER]: phoneNumber } = getEntityProperties(phone, [PHONE_NUMBER]);
    const { [EMAIL]: emailAddress } = getEntityProperties(email, [EMAIL]);
    const { [LOCATION_ADDRESS]: personAddress } = getEntityProperties(address, [LOCATION_ADDRESS]);

    const contactsFormData :Map = Map().withMutations((map :Map) => {
      if (phoneNumber) {
        map.setIn([getPageSectionKey(1, 1), getEntityAddressKey(0, CONTACT_INFORMATION, PHONE_NUMBER)], phoneNumber);
      }
      if (emailAddress) {
        map.setIn([getPageSectionKey(1, 1), getEntityAddressKey(1, CONTACT_INFORMATION, EMAIL)], emailAddress);
      }
      if (personAddress) {
        map.setIn([getPageSectionKey(1, 1), getEntityAddressKey(0, ADDRESS, LOCATION_ADDRESS)], personAddress);
      }
    });
    return { personFormData, contactsFormData };
  }

  createEntitySetIdsMap = () => {
    const { app } = this.props;
    return {
      [ADDRESS]: getEntitySetIdFromApp(app, ADDRESS),
      [CONTACT_INFORMATION]: getEntitySetIdFromApp(app, CONTACT_INFORMATION),
      [CONTACT_INFO_GIVEN]: getEntitySetIdFromApp(app, CONTACT_INFO_GIVEN),
      [LOCATED_AT]: getEntitySetIdFromApp(app, LOCATED_AT),
      [PEOPLE]: getEntitySetIdFromApp(app, PEOPLE),
    };
  };

  createPropertyTypeIdsMap = () => {
    const { edm } = this.props;
    return {
      [DOB]: getPropertyTypeIdFromEdm(edm, DOB),
      [EMAIL]: getPropertyTypeIdFromEdm(edm, EMAIL),
      [ETHNICITY]: getPropertyTypeIdFromEdm(edm, ETHNICITY),
      [FIRST_NAME]: getPropertyTypeIdFromEdm(edm, FIRST_NAME),
      [LAST_NAME]: getPropertyTypeIdFromEdm(edm, LAST_NAME),
      [LOCATION_ADDRESS]: getPropertyTypeIdFromEdm(edm, LOCATION_ADDRESS),
      [PHONE_NUMBER]: getPropertyTypeIdFromEdm(edm, PHONE_NUMBER),
      [PREFERRED]: getPropertyTypeIdFromEdm(edm, PREFERRED),
      [RACE]: getPropertyTypeIdFromEdm(edm, RACE),
      [SEX]: getPropertyTypeIdFromEdm(edm, SEX),
    };
  };

  createEntityIndexToIdMap = () => {
    const {
      address,
      email,
      participant,
      phone
    } = this.props;

    const entityIndexToIdMap :Map = Map().withMutations((map :Map) => {
      map.setIn([PEOPLE, 0], getEntityKeyId(participant));
      map.setIn([ADDRESS, 0], getEntityKeyId(address));
      map.setIn([CONTACT_INFORMATION, 0], getEntityKeyId(phone));
      map.setIn([CONTACT_INFORMATION, 1], getEntityKeyId(email));
    });
    return entityIndexToIdMap;
  }

  getAssociations = () => {
    const { participant } = this.props;
    const personEKID :UUID = getEntityKeyId(participant);
    return [
      [LOCATED_AT, personEKID, PEOPLE, 0, ADDRESS],
      [CONTACT_INFO_GIVEN, 0, CONTACT_INFORMATION, personEKID, PEOPLE],
      [CONTACT_INFO_GIVEN, 1, CONTACT_INFORMATION, personEKID, PEOPLE],
    ];
  }

  handleOnSubmitContacts = ({ formData } :Object) => {
    const { actions } = this.props;

    const dataToProcess = formData;
    const [entitySetIds, propertyTypeIds] = [this.createEntitySetIdsMap(), this.createPropertyTypeIdsMap()];

    const pageKey = getPageSectionKey(1, 1);
    const addressKey = getEntityAddressKey(0, ADDRESS, LOCATION_ADDRESS);
    const phoneKey = getEntityAddressKey(0, CONTACT_INFORMATION, PHONE_NUMBER);
    const emailKey = getEntityAddressKey(1, CONTACT_INFORMATION, EMAIL);
    if (!formData[pageKey][addressKey]) dataToProcess[pageKey][addressKey] = '';
    if (!formData[pageKey][phoneKey]) dataToProcess[pageKey][phoneKey] = '';
    if (!formData[pageKey][emailKey]) dataToProcess[pageKey][emailKey] = '';

    dataToProcess[pageKey][getEntityAddressKey(0, CONTACT_INFORMATION, PREFERRED)] = true;
    dataToProcess[pageKey][getEntityAddressKey(1, CONTACT_INFORMATION, PREFERRED)] = true;

    const entityData :{} = processEntityData(dataToProcess, entitySetIds, propertyTypeIds);
    const associationEntityData :{} = processAssociationEntityData(
      this.getAssociations(),
      entitySetIds,
      propertyTypeIds
    );
    actions.addNewParticipantContacts({ associationEntityData, entityData });
  }

  render() {
    const { actions, participant } = this.props;
    const {
      contactsFormData,
      contactsPrepopulated,
      personFormData,
      personPrepopulated,
    } = this.state;

    const entityIndexToIdMap = this.createEntityIndexToIdMap();
    const entitySetIds = this.createEntitySetIdsMap();
    const propertyTypeIds = this.createPropertyTypeIdsMap();

    const personFormContext :Object = {
      editAction: actions.editPersonDetails,
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
    };
    const contactsFormContext :Object = {
      editAction: actions.editParticipantContacts,
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
    };
    const participantEKID :UUID = getEntityKeyId(participant);
    return (
      <FormWrapper>
        <ButtonWrapper>
          <BackNavButton
              onClick={() => {
                actions.goToRoute(Routes.PARTICIPANT_PROFILE.replace(':subjectId', participantEKID));
              }}>
            Back to Profile
          </BackNavButton>
        </ButtonWrapper>
        <CardStack>
          <Card>
            <CardHeader padding="sm">Edit Person Details</CardHeader>
            <Form
                disabled={personPrepopulated}
                formContext={personFormContext}
                formData={personFormData}
                schema={personSchema}
                uiSchema={personUiSchema} />
          </Card>
          <Card>
            <CardHeader padding="sm">Edit Contact Information</CardHeader>
            <Form
                disabled={contactsPrepopulated}
                formContext={contactsFormContext}
                formData={contactsFormData}
                onSubmit={this.handleOnSubmitContacts}
                schema={contactsSchema}
                uiSchema={contactsUiSchema} />
          </Card>
        </CardStack>
      </FormWrapper>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  app: state.get(STATE.APP),
  edm: state.get(STATE.EDM),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    addNewParticipantContacts,
    editParticipantContacts,
    editPersonDetails,
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditPersonAndContactsForm);
