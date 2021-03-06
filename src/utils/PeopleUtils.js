// @flow
import React from 'react';
import type { Element } from 'react';

import toString from 'lodash/toString';
import { faUser, faUserCircle } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import { DateTime } from 'luxon';
import type { UUID } from 'lattice';

import { getImageDataFromEntity } from './BinaryUtils';
import { getEntityKeyId, getEntityProperties } from './DataUtils';
import { isDefined } from './LangUtils';

import { PersonPhoto, PersonPicture, StyledPersonPhoto } from '../components/picture/PersonPicture';
import { EMPTY_FIELD } from '../containers/participants/ParticipantsConstants';
import { PROPERTY_TYPE_FQNS } from '../core/edm/constants/FullyQualifiedNames';

const {
  CITY,
  DOB,
  FIRST_NAME,
  FULL_ADDRESS,
  LAST_NAME,
  MUGSHOT,
  PICTURE,
  US_STATE,
  ZIP,
} = PROPERTY_TYPE_FQNS;

const getPersonFullName = (personEntity :Map) :string => {

  let fullName :string = EMPTY_FIELD;
  const { [FIRST_NAME]: firstName, [LAST_NAME]: lastName } = getEntityProperties(personEntity, [FIRST_NAME, LAST_NAME]);
  if (!isDefined(firstName) || !isDefined(lastName)) return fullName;

  fullName = `${firstName} ${lastName}`;
  return fullName;
};

const getPersonDOB = (personEntity :Map) :string => {
  let personDOB :string = EMPTY_FIELD;
  const { [DOB]: dob } = getEntityProperties(personEntity, [DOB]);
  if (dob.length) {
    const dobDateTime = DateTime.fromISO(dob);
    if (dobDateTime.isValid) personDOB = dobDateTime.toLocaleString(DateTime.DATE_SHORT);
  }
  return personDOB;
};

const getPersonProfilePicture = (person :Map, image :Map) :Element<*> => {

  const defaultIcon :Element<any> = <FontAwesomeIcon icon={faUser} size="6x" color="#D8D8D8" />;

  if (isDefined(image) && !image.isEmpty()) {
    const imageURL = getImageDataFromEntity(image);
    return (
      <PersonPhoto>
        <PersonPicture src={imageURL} />
      </PersonPhoto>
    );
  }
  const { [MUGSHOT]: mugshot } = getEntityProperties(person, [MUGSHOT]);
  if (isDefined(mugshot) && mugshot.length) {
    return (
      <PersonPhoto>
        <PersonPicture src={mugshot} />
      </PersonPhoto>
    );
  }

  return defaultIcon;
};

const getPersonPictureForTable = (person :Map, small :boolean, personPhotosByPersonEKID :Map) :Element<*> => {

  let photo :string = '';

  const personEKID :UUID = getEntityKeyId(person);
  const personPhotoEntity :Map = personPhotosByPersonEKID.get(personEKID, Map());
  const urlResult = getImageDataFromEntity(personPhotoEntity);

  if (isDefined(urlResult)) {
    photo = urlResult;
  }
  else {
    const { [MUGSHOT]: mugshot, [PICTURE]: picture } = getEntityProperties(person, [MUGSHOT, PICTURE]);
    photo = mugshot || picture;
  }

  if (photo && photo.length) {
    return (
      <StyledPersonPhoto small={small}>
        <PersonPicture src={photo} alt="" />
      </StyledPersonPhoto>
    );
  }

  return (
    <FontAwesomeIcon icon={faUserCircle} color="#D8D8D8" size="2x" />
  );
};

const getHoursServed = (hoursWorked :number, hoursRequired :number) :string => {

  if (!hoursWorked && !hoursRequired) return EMPTY_FIELD;
  if (!isDefined(hoursWorked) || !isDefined(hoursRequired)) return EMPTY_FIELD;
  if (hoursRequired === 0) return EMPTY_FIELD;
  return `${toString(hoursWorked)} / ${toString(hoursRequired)}`;
};

const getPersonAddress = (address :Map) :string => {

  if (!Map.isMap(address)) return EMPTY_FIELD;

  const {
    [CITY]: city,
    [FULL_ADDRESS]: streetAddress,
    [US_STATE]: state,
    [ZIP]: zipCode,
  } = getEntityProperties(address, [CITY, FULL_ADDRESS, US_STATE, ZIP]);

  if (!streetAddress) return EMPTY_FIELD;
  if (!city || !state || !zipCode) return streetAddress;
  return `${streetAddress} ${city}, ${state} ${zipCode}`;
};

export {
  getHoursServed,
  getPersonAddress,
  getPersonDOB,
  getPersonFullName,
  getPersonPictureForTable,
  getPersonProfilePicture,
};
