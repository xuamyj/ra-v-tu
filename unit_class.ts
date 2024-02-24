
type WeaponStatsType = {
  'power' ?: number; // healers only
  'damage' ?: number; // all other weapons
  'hit' ?: number;
  'crit' ?: number;  
  'range': number[];
}

class Weapon {
  weaponName;
  weaponStats;
  isHealing;
  
  constructor(weaponName : string, isHealing : boolean, weaponStats : WeaponStatsType) {
    this.weaponName = weaponName;
    this.isHealing = isHealing;
    this.weaponStats = weaponStats;
  }
}

export const weapons : Record<string, Weapon> = {
  's': new Weapon('Sword', false, 
  {
    'damage': 6,
    'hit': 90,
    'crit': 0,
    'range': [1]
  }),
  'l': new Weapon('Lance', false, 
  {
    'damage': 7,
    'hit': 80,
    'crit': 0,
    'range': [1]
  }),
  'a': new Weapon('Axe', false, 
  {
    'damage': 8,
    'hit': 70,
    'crit': 0,
    'range': [1]
  }),
  'b': new Weapon('Bow', false, 
  {
    'damage': 8,
    'hit': 80,
    'crit': 0,
    'range': [2]
  }),
  'h': new Weapon('Heal', true, 
  {
    'power': 8, 
    'range': [1]
  }),
}

export function weaponsTriangleAvB(weaponA : string, weaponB : string) {
  if ((weaponA === 's' && weaponB === 'a') || 
  (weaponA === 'a' && weaponB === 'l') || 
  (weaponA === 'l' && weaponB === 's')) {
    return 1; // A has advantage
  } else if ((weaponA === 'a' && weaponB === 's') || 
  (weaponA === 'l' && weaponB === 'a') || 
  (weaponA === 's' && weaponB === 'l')) {
    return -1; // A has disadvantage
  } else {
    return 0;
  }
}

// ----------------------------------------

export type UnitStatsType = {
  'level' : number,
  'hp' : number,
  'str' : number,
  'mag' : number,
  'def' : number,
  'res' : number,
  'skill' : number,
  'speed' : number,
  'mov' : number
}
type UnitGrowthRatesType = Omit<UnitStatsType, 'level'|'mov'>

export class Unit {
  visualChar;
  weaponInitial;
  unitStats;

  constructor(visualChar : string, weaponInitial : string, unitStats : UnitStatsType) {
    this.visualChar = visualChar;
    this.weaponInitial = weaponInitial;
    this.unitStats = unitStats;
  }

  getVisualUnitLetters() {
    return this.visualChar + this.weaponInitial;
  }
}

// ----------------------------------------

class EnemyUnit extends Unit {
  enemyName;
  
  constructor(enemyName : string, weaponInitial : string, unitStats: UnitStatsType) {
    super('e', weaponInitial, unitStats);

    this.enemyName = enemyName;
  }
}

function createAxeHenchman() {
  return new EnemyUnit('Axe Henchman', 'a',
  {
    'level': 2,
    'hp': 20,
    'str': 7,
    'mag': 0,
    'def': 3,
    'res': 1,
    'skill': 4,
    'speed': 5,
    'mov': 5
  });
}

function createBowHenchman() {
  return new EnemyUnit('Bow Henchman', 'b',
  {
    'level': 2,
    'hp': 19,
    'str': 7,
    'mag': 0,
    'def': 5,
    'res': 4,
    'skill': 9,
    'speed': 6,
    'mov': 5
  });
}

function createSwordHenchman() {
  return new EnemyUnit('Sword Henchman', 's',
  {
    'level': 2,
    'hp': 18,
    'str': 6,
    'mag': 0,
    'def': 2,
    'res': 2,
    'skill': 6,
    'speed': 9,
    'mov': 5
  });
}

function createAxeBanditLeader() {
  return new EnemyUnit('Bandit Leader', 'A',
  {
    'level': 4,
    'hp': 20,
    'str': 7,
    'mag': 2,
    'def': 7,
    'res': 3,
    'skill': 6,
    'speed': 7,
    'mov': 5
  });
}

export const enemiesLevel1 = {
  'ea1': createAxeHenchman(),
  'ea2': createAxeHenchman(),
  'eb3': createBowHenchman(),

  // 'ea4': createAxeHenchman(),
  // 'ea5': createAxeHenchman(),
  // 'es6': createSwordHenchman(),
  // TODO: go back to level1players.csv ^

  'ea7': createAxeHenchman(),
  'es8': createSwordHenchman(),
  'eb9': createBowHenchman(),
  'eA': createAxeBanditLeader()
}

// ----------------------------------------

export class PlayerUnit extends Unit {
  playerUnitName;
  playerUnitDescription;
  // growth rates
  growthRates;
  
  constructor(playerUnitName : string, visualChar : string, weaponInitial : string, playerUnitDescription : string, unitStats : UnitStatsType, growthRates : UnitGrowthRatesType) {
    super(visualChar, weaponInitial, unitStats);

    this.playerUnitName = playerUnitName;
    this.playerUnitDescription = playerUnitDescription;
    // growth rates
    this.growthRates = growthRates;
  }
}


// Record = dictionary / map
export const playerUnits : Record<string, PlayerUnit> = {
  'a': new PlayerUnit('Ava', 'A', 's',
  `\nAva really likes horses, and she can't help being a little enthusiastic! 
She fights with a sword. 
She is part of the traveling merchant group that also includes Foteini, Leonidas, and Malcolm.`,
  { // stats
    'level': 3,
    'hp': 22,
    'str': 8,
    'mag': 4,
    'def': 8,
    'res': 4,
    'skill': 8,
    'speed': 8,
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

  'f': new PlayerUnit('Foteini', 'F', 'b',
  `\nFoteini is very quiet and observant, two strengths that make her a great hunter! 
She fights with a bow. 
She is part of the traveling merchant group that also includes Ava, Leonidas, and Malcolm.`,
  { 
    'level': 3,
    'hp': 20,
    'str': 8,
    'mag': 0,
    'def': 5,
    'res': 2,
    'skill': 12,
    'speed': 10,
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

  'l': new PlayerUnit('Leonidas', 'L', 'l',
  `\nLeonidas seems reserved at first, but you can always rely on him to protect his friends. He is the best cook in the group! 
He fights with a lance. 
He is part of the traveling merchant group that also includes Ava, Foteini, and Malcolm.`,
  { 
    'level': 3,
    'hp': 25,
    'str': 9,
    'mag': 0,
    'def': 10,
    'res': 1,
    'skill': 11,
    'speed': 5,
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

  'm': new PlayerUnit('Malcolm', 'M', 'h',
    `\nMalcolm loves to read, and he can usually find the solution to any problem! 
He is a healer, so he uses a staff. 
He is part of the traveling merchant group that also includes Ava, Foteini, and Leonidas.`,
  { 
    'level':3,
    'hp': 19,
    'str': 2,
    'mag': 9,
    'def': 3,
    'res': 11,
    'skill': 5,
    'speed': 10,
    'mov': 5
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
