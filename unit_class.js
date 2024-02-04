
const EMPTY_STATS = {
  // currentStats shouldn't have level
  'hp': 0,
  'str': 0,
  'mag': 0,
  'def': 0,
  'res': 0,
  'skill': 0,
  'speed': 0,
  'mov': 0
}

function addStatObjs(statObjA, statObjB) {
  const resultStat = {
    // currentStats shouldn't have level
    'hp': statObjA['hp'] + statObjB['hp'],
    'str': statObjA['str'] + statObjB['str'],
    'mag': statObjA['mag'] + statObjB['mag'],
    'def': statObjA['def'] + statObjB['def'],
    'res': statObjA['res'] + statObjB['res'],
    'skill': statObjA['skill'] + statObjB['skill'],
    'speed': statObjA['speed'] + statObjB['speed'],
    'mov': statObjA['mov'] + statObjB['mov']
  }
  return resultStat;
}

class Unit {
  unitName;
  // stats
  unitStats;
  currentStats;
  // growth rates
  growthRates;
  
  constructor(unitName, unitDescription, unitStats, growthRates) {
    this.unitName = unitName;
    this.unitDescription = unitDescription;
    // stats
    this.unitStats = unitStats;
    this.currentStats = addStatObjs(this.unitStats, EMPTY_STATS);
    this.currentStats['level'] = null;
    // growth rates
    this.growthRates = growthRates;
  }
}

export const units = {
  'a': new Unit('Ava', 
  `\nAva really likes horses, and she can't help being a little enthusiastic! 
She fights with a sword. 
She is part of the traveling merchant group that also includes Foteini, Leonidas, and Malcolm.`,
  { // stats
    'level': 1,
    'hp': 19,
    'str': 7,
    'mag': 4,
    'def': 6,
    'res': 2,
    'skill': 7,
    'speed': 6,
    'mov': 5
  }, { // growth rates
    'hp': 45,
    'str': 45,
    'mag': 30,
    'def': 35,
    'res': 25,
    'skill': 40,
    'speed': 45,
  }), 

  'f': new Unit('Foteini', 
  `\nFoteini is very quiet and observant, two strengths that make her a great hunter! 
She fights with a bow. 
She is part of the traveling merchant group that also includes Ava, Leonidas, and Malcolm.`,
  { 
    'level': 11,
    'hp': 26,
    'str': 13,
    'mag': 0,
    'def': 10,
    'res': 4,
    'skill': 17,
    'speed': 11,
    'mov': 5
  }, { // growth rates
    'hp': 50,
    'str': 35,
    'mag': 0,
    'def': 35,
    'res': 20,
    'skill': 60,
    'speed': 40,
  }), 

  'l': new Unit('Leonidas', 
  `\nLeonidas seems reserved at first, but you can always rely on him to protect his friends. He is the best cook in the group! 
He fights with a lance. 
He is part of the traveling merchant group that also includes Ava, Foteini, and Malcolm.`,
  { 
    'level': 10,
    'hp': 25,
    'str': 13,
    'mag': 0,
    'def': 13,
    'res': 8,
    'skill': 11,
    'speed': 12,
    'mov': 5
  }, { // growth rates
    'hp': 30,
    'str': 40,
    'mag': 20,
    'def': 40,
    'res': 30,
    'skill': 40,
    'speed': 40,
  }), 

  'm': new Unit('Malcolm', 
    `\nMalcolm loves to read, and he can usually find the solution to any problem! 
He is a healer, so he uses a staff. 
He is part of the traveling merchant group that also includes Ava, Foteini, and Leonidas.`,
  { 
    'level':5,
    'hp': 19,
    'str': 2,
    'mag': 11,
    'def': 4,
    'res': 11,
    'skill': 5,
    'speed': 10,
    'mov': 7
  }, { // growth rates
    'hp': 30,
    'str': 5,
    'mag': 65,
    'def': 15,
    'res': 40,
    'skill': 25,
    'speed': 55,
  }), 
}
