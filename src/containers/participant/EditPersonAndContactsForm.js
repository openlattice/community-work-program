// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map, getIn } from 'immutable';
import { Card, CardHeader, CardStack } from 'lattice-ui-kit';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import type { Match } from 'react-router';

import LogoLoader from '../../components/LogoLoader';

import * as Routes from '../../core/router/Routes';
import {
  addNewParticipantContacts,
  addPersonPhoto,
  editParticipantContacts,
  editPersonDetails,
  getInfoForEditPerson,
  updatePersonPhoto,
} from './ParticipantActions';
import { goToRoute } from '../../core/router/RoutingActions';
import {
  contactsSchema,
  contactsUiSchema,
  personSchema,
  personUiSchema,
  personPhotoSchema,
  personPhotoUiSchema,
} from './schemas/EditPersonAndContactsSchemas';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getPropertyTypeIdFromEdm
} from '../../utils/DataUtils';
import { getImageDataFromEntity, removeDataUriPrefix } from '../../utils/BinaryUtils';
import { isDefined } from '../../utils/LangUtils';
import { BackNavButton } from '../../components/controls/index';
import { PersonPhoto, PersonPicture } from '../../components/picture/PersonPicture';
import { PARTICIPANT_PROFILE_WIDTH } from '../../core/style/Sizes';
import { OL } from '../../core/style/Colors';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { APP, PERSON, STATE } from '../../utils/constants/ReduxStateConsts';
import type { GoToRoute } from '../../core/router/RoutingActions';

const {
  VALUE_MAPPERS,
  findEntityAddressKeyFromMap,
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData,
  processEntityDataForPartialReplace,
  replaceEntityAddressKeys,
} = DataProcessingUtils;

const {
  ADDRESS,
  CONTACT_INFORMATION,
  CONTACT_INFO_GIVEN,
  IMAGE,
  IS_PICTURE_OF,
  LOCATED_AT,
  PEOPLE
} = APP_TYPE_FQNS;
const {
  CITY,
  DOB,
  EMAIL,
  ETHNICITY,
  FIRST_NAME,
  FULL_ADDRESS,
  IMAGE_DATA,
  LAST_NAME,
  MUGSHOT,
  PHONE_NUMBER,
  PREFERRED,
  RACE,
  SEX,
  US_STATE,
  ZIP,
} = PROPERTY_TYPE_FQNS;

const {
  ACTIONS,
  ADD_PERSON_PHOTO,
  GET_INFO_FOR_EDIT_PERSON,
  PARTICIPANT,
  PERSON_PHOTO,
  PHONE,
  REQUEST_STATE,
  UPDATE_PERSON_PHOTO,
} = PERSON;

const imageValueMapper = (value :any, contentType :string = 'image/png') => ({
  data: removeDataUriPrefix(value),
  'content-type': contentType,
});

const mappers = {
  [VALUE_MAPPERS]: {
    [getEntityAddressKey(0, IMAGE, IMAGE_DATA)]: imageValueMapper
  }
};

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

const PreviewPhotoWrapper = styled.div`
  align-self: center;
  display: flex;
  justify-content: center;
  margin: 30px 0;
`;

const SubmittedMessage = styled.div`
  align-self: center;
  color: ${OL.GREEN01};
  font-weight: 600;
`;

type Props = {
  actions:{
    addNewParticipantContacts :RequestSequence;
    addPersonPhoto :RequestSequence;
    editParticipantContacts :RequestSequence;
    editPersonDetails :RequestSequence;
    getInfoForEditPerson :RequestSequence;
    goToRoute :GoToRoute;
    updatePersonPhoto :RequestSequence;
  },
  address :Map;
  addPersonPhotoRequestState :RequestState;
  app :Map;
  edm :Map;
  email :Map;
  getInfoForEditPersonRequestState :RequestState;
  initializeAppRequestState :RequestState;
  match :Match;
  participant :Map;
  personPhoto :Map;
  phone :Map;
  updatePersonPhotoRequestState :RequestState;
};

type State = {
  contactsFormData :Object;
  contactsPrepopulated :boolean;
  personFormData :Object;
  personPrepopulated :boolean;
  personPhotoFormData :Object;
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
      personPhotoFormData: {},
    };
  }

  componentDidUpdate(prevProps :Props) {
    const {
      actions,
      app,
      address,
      email,
      getInfoForEditPersonRequestState,
      match: {
        params: { participantId: personEKID }
      },
      participant,
      phone,
    } = this.props;
    if (!prevProps.app.get(PEOPLE) && app.get(PEOPLE) && personEKID) {
      actions.getInfoForEditPerson({ personEKID });
    }
    if ((prevProps.getInfoForEditPersonRequestState === RequestStates.PENDING
      && getInfoForEditPersonRequestState !== RequestStates.PENDING)
      || !prevProps.participant.equals(participant)
      || !prevProps.address.equals(address)
      || !prevProps.email.equals(email)
      || !prevProps.phone.equals(phone)) {
      this.prepopulateFormData();
    }
  }

  prepopulateFormData = () => {
    const { contactsFormData, personFormData, photoFormData } = this.constructOriginalData();
    const personPrepopulated = !personFormData.isEmpty();
    const contactsPrepopulated = !contactsFormData.isEmpty();
    const personPhotoPrepopulated = !photoFormData.isEmpty();

    this.setState({
      contactsFormData: contactsPrepopulated ? contactsFormData.toJS() : {},
      contactsPrepopulated,
      personFormData: personPrepopulated ? personFormData.toJS() : {},
      personPrepopulated,
      personPhotoFormData: personPhotoPrepopulated ? photoFormData.toJS() : {},
    });
  }

  constructOriginalData = () => {
    const {
      address,
      email,
      participant,
      personPhoto,
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
    const {
      [CITY]: city,
      [FULL_ADDRESS]: streetAddress,
      [US_STATE]: state,
      [ZIP]: zipCode,
    } = getEntityProperties(address, [CITY, FULL_ADDRESS, US_STATE, ZIP]);

    const contactsFormData :Map = Map().withMutations((map :Map) => {
      if (!phone.isEmpty()) {
        map.setIn([getPageSectionKey(1, 1), getEntityAddressKey(0, CONTACT_INFORMATION, PHONE_NUMBER)], phoneNumber);
      }
      if (!email.isEmpty()) {
        map.setIn([getPageSectionKey(1, 2), getEntityAddressKey(1, CONTACT_INFORMATION, EMAIL)], emailAddress);
      }
      if (!address.isEmpty()) {
        map.setIn([getPageSectionKey(1, 3), getEntityAddressKey(0, ADDRESS, FULL_ADDRESS)], streetAddress);
        map.setIn([getPageSectionKey(1, 3), getEntityAddressKey(0, ADDRESS, CITY)], city || '');
        map.setIn([getPageSectionKey(1, 3), getEntityAddressKey(0, ADDRESS, US_STATE)], state || '');
        map.setIn([getPageSectionKey(1, 3), getEntityAddressKey(0, ADDRESS, ZIP)], zipCode || '');
      }
    });

    const imageUrl = getImageDataFromEntity(personPhoto);
    const photoFormData :Map = Map().withMutations((map :Map) => {
      if (imageUrl) map.setIn([getPageSectionKey(1, 1), getEntityAddressKey(0, IMAGE, IMAGE_DATA)], imageUrl);
    });
    return { contactsFormData, personFormData, photoFormData };
  }

  createEntitySetIdsMap = () => {
    const { app } = this.props;
    return {
      [ADDRESS]: getEntitySetIdFromApp(app, ADDRESS),
      [CONTACT_INFORMATION]: getEntitySetIdFromApp(app, CONTACT_INFORMATION),
      [CONTACT_INFO_GIVEN]: getEntitySetIdFromApp(app, CONTACT_INFO_GIVEN),
      [IMAGE]: getEntitySetIdFromApp(app, IMAGE),
      [IS_PICTURE_OF]: getEntitySetIdFromApp(app, IS_PICTURE_OF),
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
      [FULL_ADDRESS]: getPropertyTypeIdFromEdm(edm, FULL_ADDRESS),
      [IMAGE_DATA]: getPropertyTypeIdFromEdm(edm, IMAGE_DATA),
      [LAST_NAME]: getPropertyTypeIdFromEdm(edm, LAST_NAME),
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
      personPhoto,
      phone
    } = this.props;

    const entityIndexToIdMap :Map = Map().withMutations((map :Map) => {
      map.setIn([ADDRESS, 0], getEntityKeyId(address));
      map.setIn([CONTACT_INFORMATION, 0], getEntityKeyId(phone));
      map.setIn([CONTACT_INFORMATION, 1], getEntityKeyId(email));
      map.setIn([IMAGE, 0], getEntityKeyId(personPhoto));
      map.setIn([PEOPLE, 0], getEntityKeyId(participant));
    });
    return entityIndexToIdMap;
  }

  getContactsAssociations = () => {
    const { participant } = this.props;
    const personEKID :UUID = getEntityKeyId(participant);
    return [
      [CONTACT_INFO_GIVEN, 0, CONTACT_INFORMATION, personEKID, PEOPLE],
      [CONTACT_INFO_GIVEN, 1, CONTACT_INFORMATION, personEKID, PEOPLE],
      [LOCATED_AT, personEKID, PEOPLE, 0, ADDRESS],
    ];
  }

  handleOnSubmitContacts = ({ formData } :Object) => {
    const { actions } = this.props;

    const dataToProcess = formData;
    const [entitySetIds, propertyTypeIds] = [this.createEntitySetIdsMap(), this.createPropertyTypeIdsMap()];

    const phoneKey = getEntityAddressKey(0, CONTACT_INFORMATION, PHONE_NUMBER);
    const emailKey = getEntityAddressKey(1, CONTACT_INFORMATION, EMAIL);
    const addressKey = getEntityAddressKey(0, ADDRESS, FULL_ADDRESS);

    if (!formData[getPageSectionKey(1, 1)][phoneKey]) dataToProcess[getPageSectionKey(1, 1)][phoneKey] = '';
    if (!formData[getPageSectionKey(1, 2)][emailKey]) dataToProcess[getPageSectionKey(1, 2)][emailKey] = '';
    if (!formData[getPageSectionKey(1, 3)][addressKey]) dataToProcess[getPageSectionKey(1, 3)][addressKey] = '';

    dataToProcess[getPageSectionKey(1, 1)][getEntityAddressKey(0, CONTACT_INFORMATION, PREFERRED)] = true;
    dataToProcess[getPageSectionKey(1, 2)][getEntityAddressKey(1, CONTACT_INFORMATION, PREFERRED)] = true;

    const entityData :{} = processEntityData(dataToProcess, entitySetIds, propertyTypeIds);
    const associationEntityData :{} = processAssociationEntityData(
      this.getContactsAssociations(),
      entitySetIds,
      propertyTypeIds
    );
    actions.addNewParticipantContacts({ associationEntityData, entityData });
  }

  handleOnSubmitPhoto = ({ formData } :Object) => {
    const { actions, participant } = this.props;
    const personEKID :UUID = getEntityKeyId(participant);
    const associations = [
      [IS_PICTURE_OF, 0, IMAGE, personEKID, PEOPLE, {}]
    ];

    const entitySetIds :Object = this.createEntitySetIdsMap();
    const propertyTypeIds :Object = this.createPropertyTypeIdsMap();

    const entityData :Object = processEntityData(formData, entitySetIds, propertyTypeIds, mappers);
    const associationEntityData :Object = processAssociationEntityData(
      associations,
      entitySetIds,
      propertyTypeIds
    );
    actions.addPersonPhoto({ associationEntityData, entityData });
  }

  handleOnUpdatePhoto = ({ formData } :Object) => {
    const { actions } = this.props;

    const entityIndexToIdMap = this.createEntityIndexToIdMap();
    const entitySetIds = this.createEntitySetIdsMap();
    const propertyTypeIds = this.createPropertyTypeIdsMap();

    const draftWithKeys = replaceEntityAddressKeys(
      formData,
      findEntityAddressKeyFromMap(entityIndexToIdMap)
    );

    const mappersWithKeys = replaceEntityAddressKeys(
      mappers,
      findEntityAddressKeyFromMap(entityIndexToIdMap)
    );

    const entityData = processEntityDataForPartialReplace(
      draftWithKeys,
      {},
      entitySetIds,
      propertyTypeIds,
      mappersWithKeys
    );
    actions.updatePersonPhoto({ entityData });
  }

  handleOnChangePhoto = ({ formData } :Object) => {
    this.setState({ personPhotoFormData: formData });
  }

  handleOnClickBackButton = () => {
    const {
      actions,
      participant,
    } = this.props;
    const participantEKID :UUID = getEntityKeyId(participant);
    actions.goToRoute(Routes.PARTICIPANT_PROFILE.replace(':participantId', participantEKID));
  }

  render() {
    const {
      actions,
      addPersonPhotoRequestState,
      getInfoForEditPersonRequestState,
      initializeAppRequestState,
      personPhoto,
      updatePersonPhotoRequestState,
    } = this.props;
    const {
      contactsFormData,
      contactsPrepopulated,
      personFormData,
      personPrepopulated,
      personPhotoFormData,
    } = this.state;

    if (initializeAppRequestState === RequestStates.PENDING
      || getInfoForEditPersonRequestState === RequestStates.PENDING) {
      return (
        <LogoLoader
            loadingText="Please wait..."
            size={60} />
      );
    }

    const existingPhotoUrl = getImageDataFromEntity(personPhoto);
    const imagePreviewUrl = getIn(
      personPhotoFormData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, IMAGE, IMAGE_DATA)]
    ) || existingPhotoUrl;

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

    let submitPhotoAction = this.handleOnSubmitPhoto;
    if (!personPhoto.isEmpty()) {
      submitPhotoAction = this.handleOnUpdatePhoto;
    }

    return (
      <FormWrapper>
        <ButtonWrapper>
          <BackNavButton
              onClick={this.handleOnClickBackButton}>
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
          <Card>
            <CardHeader padding="sm">Add profile photo</CardHeader>
            {
              isDefined(imagePreviewUrl)
                && (
                  <PreviewPhotoWrapper>
                    <PersonPhoto>
                      <PersonPicture src={imagePreviewUrl} />
                    </PersonPhoto>
                  </PreviewPhotoWrapper>
                )
            }
            {
              (addPersonPhotoRequestState === RequestStates.SUCCESS
                || updatePersonPhotoRequestState === RequestStates.SUCCESS)
              && (
                <SubmittedMessage>Submitted!</SubmittedMessage>
              )
            }
            <Form
                formData={personPhotoFormData}
                onChange={this.handleOnChangePhoto}
                onSubmit={submitPhotoAction}
                schema={personPhotoSchema}
                uiSchema={personPhotoUiSchema} />
          </Card>
        </CardStack>
      </FormWrapper>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const app = state.get(STATE.APP);
  const edm = state.get(STATE.EDM);
  const person = state.get(STATE.PERSON);
  return ({
    [PERSON.ADDRESS]: person.get(PERSON.ADDRESS),
    addPersonPhotoRequestState: person.getIn([ACTIONS, ADD_PERSON_PHOTO, REQUEST_STATE]),
    app,
    edm,
    [PERSON.EMAIL]: person.get(PERSON.EMAIL),
    getInfoForEditPersonRequestState: person.getIn([ACTIONS, GET_INFO_FOR_EDIT_PERSON, REQUEST_STATE]),
    initializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
    [PARTICIPANT]: person.get(PARTICIPANT),
    [PERSON_PHOTO]: person.get(PERSON_PHOTO),
    [PHONE]: person.get(PHONE),
    updatePersonPhotoRequestState: person.getIn([ACTIONS, UPDATE_PERSON_PHOTO, REQUEST_STATE]),
  });
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    addNewParticipantContacts,
    addPersonPhoto,
    editParticipantContacts,
    editPersonDetails,
    getInfoForEditPerson,
    goToRoute,
    updatePersonPhoto,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditPersonAndContactsForm);
