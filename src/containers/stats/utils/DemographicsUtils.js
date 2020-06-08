// @flow
import { List, Map, fromJS } from 'immutable';

import {
  getEntityProperties,
} from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { ETHNICITY_VALUES, RACE_VALUES, SEX_VALUES } from '../../../core/edm/constants/DataModelConsts';
import { ETHNICITY_ALIASES, RACE_ALIASES } from '../consts/StatsConsts';

const { ETHNICITY, RACE, SEX } = PROPERTY_TYPE_FQNS;

const getDemographicsFromPersonData = (personMap :Map) => {

  let raceDemographics :Map = Map().withMutations((map :Map) => {
    RACE_VALUES.forEach((race :string) => map.set(race, 0));
  });
  let ethnicityDemographics :Map = Map().withMutations((map :Map) => {
    ETHNICITY_VALUES.concat([RACE_VALUES[5], RACE_VALUES[6]]).forEach((ethnicity :string) => map.set(ethnicity, 0));
  });
  let sexDemographics :Map = Map().withMutations((map :Map) => {
    SEX_VALUES.forEach((sex :string) => map.set(sex, 0));
  });

  personMap.forEach((person :Map) => {

    const { [ETHNICITY]: ethnicity, [RACE]: race, [SEX]: sex } = getEntityProperties(person, [ETHNICITY, RACE, SEX]);

    const currentTotalForRace :any = raceDemographics.get(race);
    if (race.length && isDefined(currentTotalForRace)) {
      raceDemographics = raceDemographics.set(race, currentTotalForRace + 1);
    }
    else if (race.length && !isDefined(currentTotalForRace)) {
      let alternateFound :boolean = false;
      fromJS(RACE_ALIASES).forEach((listOfAlternates :List, standardName :string) => {
        listOfAlternates.forEach((alternate :string) => {
          if (race === alternate.trim()) {
            const currentTotal :number = raceDemographics.get(standardName, 0);
            raceDemographics = raceDemographics.set(standardName, currentTotal + 1);
            alternateFound = true;
          }
        });
      });
      if (!alternateFound) {
        const otherNotSpecifiedTotal = raceDemographics.get(RACE_VALUES[5], 0);
        raceDemographics = raceDemographics.set(RACE_VALUES[5], otherNotSpecifiedTotal + 1);
      }
    }
    else if (!race.length) {
      const unknownTotal = raceDemographics.get(RACE_VALUES[6], 0);
      raceDemographics = raceDemographics.set(RACE_VALUES[6], unknownTotal + 1);
    }

    const currentTotalForEthnicity = ethnicityDemographics.get(ethnicity);
    if (ethnicity.length && isDefined(currentTotalForEthnicity)) {
      ethnicityDemographics = ethnicityDemographics.set(ethnicity, currentTotalForEthnicity + 1);
    }
    else if (ethnicity.length && !isDefined(currentTotalForEthnicity)) {
      let aliasFound :boolean = false;
      fromJS(ETHNICITY_ALIASES).forEach((ethnicityAliases :List, standardName :string) => {
        ethnicityAliases.forEach((alias :string) => {
          if (alias === ethnicity.trim()) {
            const currentTotal :number = ethnicityDemographics.get(standardName, 0);
            ethnicityDemographics = ethnicityDemographics.set(standardName, currentTotal + 1);
            aliasFound = true;
          }
        });
      });
      if (!aliasFound) {
        const otherNotSpecifiedTotal = ethnicityDemographics.get(RACE_VALUES[5], 0);
        ethnicityDemographics = ethnicityDemographics.set(RACE_VALUES[5], otherNotSpecifiedTotal + 1);
      }
    }
    else if (!ethnicity.length) {
      const unknownTotal = ethnicityDemographics.get(RACE_VALUES[6], 0);
      ethnicityDemographics = ethnicityDemographics.set(RACE_VALUES[6], unknownTotal + 1);
    }

    const currentTotalForSex :any = sexDemographics.get(sex);
    if (sex.length && isDefined(currentTotalForSex)) {
      sexDemographics = sexDemographics.set(sex, currentTotalForSex + 1);
    }
    else if (sex.length && !isDefined(currentTotalForSex)) {
      if (sex.trim() === 'M') {
        const currentTotalForMale :any = sexDemographics.get(SEX_VALUES[1]);
        sexDemographics = sexDemographics.set(SEX_VALUES[1], currentTotalForMale + 1);
      }
      if (sex.trim() === 'F') {
        const currentTotalForFemale :any = sexDemographics.get(SEX_VALUES[0]);
        sexDemographics = sexDemographics.set(SEX_VALUES[0], currentTotalForFemale + 1);
      }
    }
    else if (!sex.length) {
      const unknownTotal = sexDemographics.get(SEX_VALUES[2], 0);
      sexDemographics = sexDemographics.set(SEX_VALUES[2], unknownTotal + 1);
    }
  });

  raceDemographics = raceDemographics.asImmutable();
  ethnicityDemographics = ethnicityDemographics.asImmutable();
  sexDemographics = sexDemographics.asImmutable();

  return {
    ethnicityDemographics,
    raceDemographics,
    sexDemographics,
  };
};

/* eslint-disable import/prefer-default-export */
export {
  getDemographicsFromPersonData,
};
