// Ours
import { playerUnits, enemiesLevel1, Unit, PlayerUnit, weapons } from './unit_class';
import { SECRET_DEBUGGING_LOSE, SECRET_DEBUGGING_WIN } from 'main';

// Like getInput()
import promptFunc from 'prompt-sync';
const prompt = promptFunc();
import fs from 'node:fs';
import _ from 'lodash';


const ALPHABET = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
export const QUIT_INPUT = 'q';

// const FAKE_TEST_DATA = {
//   'terrainMap': {
//     'D14': '#',
//     'G13': 'F', 
//     'D10': 'T',
//   },
//   'unitToLoc': {
//     'eA': ['I', '2'],
//     'eb3': ['D', '10'],
//     'ea7': ['H', '4'],
//     'es8': ['J', '4'],
//     'a': ['I', '14'],
//     'f': ['J', '14'],
//     'l': ['I', '15'],
//     'm': ['J', '15'],
//   },
//   'locToUnit': {
//     'I2': 'eA',
//     'D10': 'eb3',
//     'H4': 'ea7',
//     'J4': 'es8',
//     'I14': 'a',
//     'J14': 'f',
//     'I15': 'l',
//     'J15': 'm',
//   }
// }

export class Map {
  numRows; // 16
  numCols; // 11, A-J
  terrainMap : Record<string, string> = {}; // Dictionary: location -> terrain. Shouldn't change
  unitToLoc : Record<string, [string, string]> = {}; // Dictionary: unit -> location
  locToUnit : Record<string, string> = {}; // Dictionary: location -> unit

  // private, just for quick checking
  allUnits : Record<string, Unit>; 

  constructor(filename : string) {
    const data = fs.readFileSync(filename, 'utf8');
    const lines = data.split('\n');

    const firstLine = lines.shift();
    if (!firstLine) {
      throw "Map file not formatted correctly.";
    }
    const numRowsCols = firstLine.split(',');
    this.numRows = Number(numRowsCols[0]);
    this.numCols = Number(numRowsCols[1]);

    for (let row = 0; row < lines.length; row++) {
      const lineStr = lines[row];

      const cells = lineStr.split(',');
      for (let col = 0; col < cells.length; col++) {
        const visualRow = row+1;
        const visualRowStr = String(visualRow);
        const visualColStr = ALPHABET[col];

        const cellStr = cells[col].trim();
        if (cellStr !== '-') {
          const terrain = cellStr[0];
          const unitChar = cellStr.slice(1);

          this.addToMapsConstructorHelper(visualRowStr, visualColStr, terrain, unitChar);
        }
      }
    }

    // // Fake test data
    // this.numRows = 16;
    // this.numCols = 11; 
    // this.terrainMap = FAKE_TEST_DATA['terrainMap']
    // this.unitToLoc = FAKE_TEST_DATA['unitToLoc']
    // this.locToUnit = FAKE_TEST_DATA['locToUnit']

    this.allUnits = {...playerUnits, ...enemiesLevel1};
  }

  addToMapsConstructorHelper(visualRowStr : string, visualColStr : string, terrain : string, rawUnitChar : string) {
    if (terrain !== '-') {
      this.terrainMap[visualColStr+visualRowStr] = terrain;
    }

    if (rawUnitChar) {
      const unitChar = (rawUnitChar[0] === 'p') ? rawUnitChar[1] : rawUnitChar

      this.unitToLoc[unitChar] = [visualColStr, visualRowStr];
      this.locToUnit[visualColStr+visualRowStr] = unitChar;
    }
  }

  rawPrintBorder() {
    console.log('   +' + '----+'.repeat(this.numCols));
  }

  rawPrintCell(visualRowStr : string, visualColStr : string) {
    const terrain = this.terrainMap[visualColStr + visualRowStr];
    if (terrain === '#') { // terrainMap has wall
      process.stdout.write('####');
    } else {
      let terrainLetters = '  ';
      if (terrain === 'F') { // terrainMap has fort
        terrainLetters = '{}';
      } else if (terrain === 'T') { // terrainMap has tree
        terrainLetters = '<>';
      }

      const unitChar = this.locToUnit[visualColStr + visualRowStr]
      const unitLetters = unitChar ? this.allUnits[unitChar].getVisualUnitLetters() : '  ';

      process.stdout.write(terrainLetters[0] + unitLetters + terrainLetters[1]);
    }
  }

  printMap() {
    console.log('\n\nDEBUG');
    console.log(this.unitToLoc);
    console.log(this.locToUnit);

    // column labels
    process.stdout.write('\n     ');
    for (let col = 0; col < this.numCols; col++) {
      process.stdout.write(ALPHABET[col] + '    ');
    }
    process.stdout.write('\n');

    // each row
    for (let row = 0; row < this.numRows; row++) {
      this.rawPrintBorder();

      // row label
      const visualRow = row+1;
      const visualRowStr = String(visualRow);
      if (visualRow < 10) {
        process.stdout.write(' ' + visualRowStr + ' |');
      } else {
        process.stdout.write(visualRowStr + ' |');
      }
      
      // actual row
      for (let col = 0; col < this.numCols; col++) {
        const visualColStr = ALPHABET[col];
        this.rawPrintCell(visualRowStr, visualColStr);
        process.stdout.write('|');
      }
      process.stdout.write('\n');
    }

    // last line
    this.rawPrintBorder();
  }
}

// ----------------------------------------

enum TurnStatus {
  TurnDone = 0,
  CanActOnly = 1,
  CanMoveOrAct = 2
}

enum Actions {
  Wait = 'Wait',
  Move = 'Move',
  Heal = 'Heal',
  Fight = 'Fight'
}

class BattleUnit {
  origUnit : Unit;
  currHP : number; 
  turnStatus : TurnStatus; 

  constructor(origUnit : Unit) {
    this.origUnit = origUnit;
    this.currHP = this.origUnit.unitStats['hp'];
    this.turnStatus = TurnStatus.CanMoveOrAct;
  }

  loseHP(hpLost : number) {
    const newHP = this.currHP - hpLost;
    this.currHP = newHP >= 0 ? newHP : 0;
  }

  healHP(hpHealed : number) {
    const newHP = this.currHP + hpHealed;
    const maxHP = this.origUnit.unitStats['hp'];
    this.currHP = newHP <= maxHP ? newHP : maxHP;
  }

  checkIsAlive() {
    return (this.currHP > 0);
  }

  markMoved() {
    this.turnStatus = TurnStatus.CanActOnly;
  }

  markTurnDone() {
    this.turnStatus = TurnStatus.TurnDone;
  }

  resetForNextTurn() {
    this.turnStatus = TurnStatus.CanMoveOrAct;
  }

  checkTurnRemaining() {
    return this.turnStatus !== TurnStatus.TurnDone;
  }
}

export class BattleEngine {
  map : Map;
  playerBattleUnits : Record<string, BattleUnit> = {};
  enemyBattleUnits : Record<string, BattleUnit> = {};
  turnCounter : number;

  constructor(mapFilename : string, playerUnits : Record<string, PlayerUnit>) {
    this.map = new Map(mapFilename);
    for (const [playerChar, origUnit] of Object.entries(playerUnits)) {
      const battleUnit = new BattleUnit(origUnit);
      this.playerBattleUnits[playerChar] = battleUnit; 
    }
    for (const [enemyChar, origUnit] of Object.entries(enemiesLevel1)) {
      const battleUnit = new BattleUnit(origUnit);
      this.enemyBattleUnits[enemyChar] = battleUnit; 
    }
    this.turnCounter = 1;
  }

  chooseRemainingCharacter() : string|null { 
    const availableChars = _.pickBy(this.playerBattleUnits, 
      (battleUnit) => {
        return (battleUnit.checkIsAlive() && battleUnit.checkTurnRemaining())
      });
    if (_.isEmpty(availableChars)) {
      return null;
    }

    while (true) {
      console.log('\nSelect character:');
      for (const [playerChar, battleUnit] of Object.entries(availableChars)) {
        console.log('(' + playerChar + ') ' + (battleUnit.origUnit as PlayerUnit).playerUnitName);
      }
      const input = prompt('> ').toLowerCase();
  
      if (input in availableChars) {
        return input;
      } else {
        console.log('Sorry, please enter a valid input. ')
      }
    } 
  }

  chooseAction(c : string) {
    const battleUnit = this.playerBattleUnits[c];
    if (battleUnit.turnStatus === TurnStatus.TurnDone) {
      return null;
    }

    const possibleActions : Record<string,string> = {
      'w': Actions.Wait
    }
    if (battleUnit.turnStatus === TurnStatus.CanMoveOrAct) {
      possibleActions['m'] = Actions.Move;
    }
    const weapon = weapons[battleUnit.origUnit.weaponInitial];
    if (weapon.isHealing) {
      possibleActions['h'] = Actions.Heal;
    } else {
      possibleActions['f'] = Actions.Fight;
    }

    if (SECRET_DEBUGGING_LOSE) {
      possibleActions['d'] = '<S_D_LOSE>: Defeated';
    }

    while (true) {
      console.log('\nChoose Action:');
      for (const [actionChar, actionName] of Object.entries(possibleActions)) {
        console.log('(' + actionChar + ') ' + actionName);
      }
      const input = prompt('> ').toLowerCase();
  
      if (input in possibleActions) {
        return input;
      } else {
        console.log('Sorry, please enter a valid input. ')
      }
    } 
  }

  chooseFightTarget() {
    
  }

  chooseHealTarget() {

  }

  chooseMoveLoc() {

  }

  checkAllEnemiesDead() : boolean {
    const aliveEnemies = _.pickBy(this.enemyBattleUnits, 
      (battleUnit) => {
        return (battleUnit.checkIsAlive())
      });
    return (_.isEmpty(aliveEnemies));
  }

  playOneTurn() {
    this.map.printMap();
    console.log('\n' + 'Turn ' + this.turnCounter);

    while (true) {
      if (this.checkAllEnemiesDead()) { // no enemies left
        break;
      }

      const c = this.chooseRemainingCharacter();
      if (c === null) { // no characters left
        break;
      }
      const battleUnit = this.playerBattleUnits[c];
      const playerUnitName = (battleUnit.origUnit as PlayerUnit).playerUnitName

      while (true) {
        const ac = this.chooseAction(c);
        if (ac === null) { // no actions left (checkTurnRemaining() returned false at the beginning)
          console.log(playerUnitName + ' finished their turn.');
          break;
        }

        // chose something, do it
        if (ac === 'w') {
          console.log('\n' + playerUnitName + ' did Wait');
          battleUnit.markTurnDone();

        } else if (ac === 'm') {
          console.log('\n' + playerUnitName + ' did Move');
          battleUnit.markMoved();

        } else if (ac === 'h') {
          console.log('\n' + playerUnitName + ' did Heal');
          battleUnit.markTurnDone();

        } else if (ac === 'f') {
          console.log('\n' + playerUnitName + ' did Fight');

          if (SECRET_DEBUGGING_WIN) {
            const e = Object.keys(this.enemyBattleUnits)[0]
            // remove from map
            const [locX, locY] = this.map.unitToLoc[e];
            const loc = locX + locY;
            delete this.map.unitToLoc[e];
            delete this.map.locToUnit[loc];
            // remove generally 
            delete this.enemyBattleUnits[e];
            
            console.log("<S_D_WIN> One random enemy died");
          }

          battleUnit.markTurnDone();

        } else if (SECRET_DEBUGGING_LOSE && ac === 'd') {
          console.log('\n<S_D_LOSE>: ' + playerUnitName + ' was defeated');
          // remove generally 
          battleUnit.loseHP(1000);
          // remove from map
          const [locX, locY] = this.map.unitToLoc[c];
          const loc = locX + locY;
          delete this.map.unitToLoc[c];
          delete this.map.locToUnit[loc];

          // normally this would happen when you choose 'Fight', and then the defeat would happen after
          battleUnit.markTurnDone();
        } else {
          throw "Something went wrong with choosing the action."
        }
      }
    }

    // end of turn: reset units for next turn
    console.log('\nTurn ' + this.turnCounter + ' finished!');
    this.turnCounter++;
    for (const [playerChar, battleUnit] of Object.entries(this.playerBattleUnits)) {
      battleUnit.resetForNextTurn();
    }
  }

  playLevel() {
    while (true) {

      // Game lost!
      const aliveChars = _.pickBy(this.playerBattleUnits, 
        (battleUnit) => {
          return (battleUnit.checkIsAlive())
        });
      if (_.isEmpty(aliveChars)) { 
        console.log('\nAll your units died :(');
        console.log('<<<< GAME OVER >>>>');
        break;
      }

      // Game won!
      if (this.checkAllEnemiesDead()) {
        console.log('\nYou defeated all the enemies!');
        console.log('<<<< YOU WIN!!! >>>>');
        break;
      }

      // Game continues... 
      this.playOneTurn();
    }
  }

  // checkPlayerBattleUnits() {
  //   for (const [playerChar, battleUnit] of Object.entries(this.playerBattleUnits)) {
  //     console.log(playerChar);
  //     console.log(battleUnit);
  //   }
  // }

}
