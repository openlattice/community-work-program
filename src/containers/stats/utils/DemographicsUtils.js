// @flow
import { List, Map, fromJS } from 'immutable';

import { ETHNICITY_VALUES, RACE_VALUES, SEX_VALUES } from '../../../core/edm/constants/DataModelConsts';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import {
  getEntityProperties,
} from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';
import { ETHNICITY_ALIASES, RACE_ALIASES } from '../consts/StatsConsts';

const { ETHNICITY, RACE, SEX } = PROPERTY_TYPE_FQNS;

const getDemographicsFromPersonData = (personMap :Map) => {

  let raceDemographicsData :Map = Map().withMutations((map :Map) => {
    RACE_VALUES.forEach((race :string) => map.set(race, 0));
  });
  let ethnicityDemographicsData :Map = Map().withMutations((map :Map) => {
    ETHNICITY_VALUES.concat([RACE_VALUES[5], RACE_VALUES[6]]).forEach((ethnicity :string) => map.set(ethnicity, 0));
  });
  let sexDemographicsData :Map = Map().withMutations((map :Map) => {
    SEX_VALUES.forEach((sex :string) => map.set(sex, 0));
  });

  personMap.forEach((person :Map) => {

    const { [ETHNICITY]: ethnicity, [RACE]: race, [SEX]: sex } = getEntityProperties(person, [ETHNICITY, RACE, SEX]);

    const currentTotalForRace :any = raceDemographicsData.get(race);
    if (race.length && isDefined(currentTotalForRace)) {
      raceDemographicsData = raceDemographicsData.set(race, currentTotalForRace + 1);
    }
    else if (race.length && !isDefined(currentTotalForRace)) {
      let alternateFound :boolean = false;
      fromJS(RACE_ALIASES).forEach((listOfAlternates :List, standardName :string) => {
        listOfAlternates.forEach((alternate :string) => {
          if (race === alternate.trim()) {
            const currentTotal :number = raceDemographicsData.get(standardName, 0);
            raceDemographicsData = raceDemographicsData.set(standardName, currentTotal + 1);
            alternateFound = true;
          }
        });
      });
      if (!alternateFound) {
        const otherNotSpecifiedTotal = raceDemographicsData.get(RACE_VALUES[5], 0);
        raceDemographicsData = raceDemographicsData.set(RACE_VALUES[5], otherNotSpecifiedTotal + 1);
      }
    }
    else if (!race.length) {
      const unknownTotal = raceDemographicsData.get(RACE_VALUES[6], 0);
      raceDemographicsData = raceDemographicsData.set(RACE_VALUES[6], unknownTotal + 1);
    }

    const currentTotalForEthnicity = ethnicityDemographicsData.get(ethnicity);
    if (ethnicity.length && isDefined(currentTotalForEthnicity)) {
      ethnicityDemographicsData = ethnicityDemographicsData.set(ethnicity, currentTotalForEthnicity + 1);
    }
    else if (ethnicity.length && !isDefined(currentTotalForEthnicity)) {
      let aliasFound :boolean = false;
      fromJS(ETHNICITY_ALIASES).forEach((ethnicityAliases :List, standardName :string) => {
        ethnicityAliases.forEach((alias :string) => {
          if (alias === ethnicity.trim()) {
            const currentTotal :number = ethnicityDemographicsData.get(standardName, 0);
            ethnicityDemographicsData = ethnicityDemographicsData.set(standardName, currentTotal + 1);
            aliasFound = true;
          }
        });
      });
      if (!aliasFound) {
        const otherNotSpecifiedTotal = ethnicityDemographicsData.get(RACE_VALUES[5], 0);
        ethnicityDemographicsData = ethnicityDemographicsData.set(RACE_VALUES[5], otherNotSpecifiedTotal + 1);
      }
    }
    else if (!ethnicity.length) {
      const unknownTotal = ethnicityDemographicsData.get(RACE_VALUES[6], 0);
      ethnicityDemographicsData = ethnicityDemographicsData.set(RACE_VALUES[6], unknownTotal + 1);
    }

    const currentTotalForSex :any = sexDemographicsData.get(sex);
    if (sex.length && isDefined(currentTotalForSex)) {
      sexDemographicsData = sexDemographicsData.set(sex, currentTotalForSex + 1);
    }
    else if (sex.length && !isDefined(currentTotalForSex)) {
      if (sex.trim() === 'M') {
        const currentTotalForMale :any = sexDemographicsData.get(SEX_VALUES[1]);
        sexDemographicsData = sexDemographicsData.set(SEX_VALUES[1], currentTotalForMale + 1);
      }
      if (sex.trim() === 'F') {
        const currentTotalForFemale :any = sexDemographicsData.get(SEX_VALUES[0]);
        sexDemographicsData = sexDemographicsData.set(SEX_VALUES[0], currentTotalForFemale + 1);
      }
    }
    else if (!sex.length) {
      const unknownTotal = sexDemographicsData.get(SEX_VALUES[2], 0);
      sexDemographicsData = sexDemographicsData.set(SEX_VALUES[2], unknownTotal + 1);
    }
  });

  raceDemographicsData = raceDemographicsData.asImmutable();
  ethnicityDemographicsData = ethnicityDemographicsData.asImmutable();
  sexDemographicsData = sexDemographicsData.asImmutable();

  return {
    ethnicityDemographicsData,
    raceDemographicsData,
    sexDemographicsData,
  };
};

/* eslint-disable import/prefer-default-export */
export {
  getDemographicsFromPersonData,
};
