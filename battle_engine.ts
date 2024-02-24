// Ours
import { playerUnits, enemiesLevel1, Unit, PlayerUnit, weapons } from './unit_class';
import { Map } from './map_class';
import { SECRET_DEBUGGING_LOSE, SECRET_DEBUGGING_WIN } from 'main';

// Like getInput()
import promptFunc from 'prompt-sync';
const prompt = promptFunc();
import _ from 'lodash';


export const QUIT_INPUT = 'q';

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

  checkNeedsHealing() {
    return (this.currHP < this.origUnit.unitStats.hp);
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

  printBattleUnit({locationStr} : {locationStr ?: string}) { 
    if (locationStr) {
      process.stdout.write(locationStr + ' ');
    }

    const st = this.origUnit.unitStats;
    console.log(
      this.origUnit.visualChar + this.origUnit.weaponInitial + ': HP ' + this.currHP + '/' + st.hp + '\t' +
      st.str + ' Str, ' + 
      st.mag + ' Mag, ' + 
      st.def + ' Def, ' + 
      st.res + ' Res, ' + 
      st.skill + ' Skl, ' + 
      st.speed + ' Spd, ' + 
      st.mov + ' Mov \t' + 
      'Lvl ' + st.level
    );
  }
}

export class BattleEngine {
  map : Map;
  playerBattleUnits : Record<string, BattleUnit> = {};
  enemyBattleUnits : Record<string, BattleUnit> = {};
  turnCounter : number;

  constructor(mapFilename : string) {
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

  // ----------------------------------------

  chooseFightTarget() {
    
  }

  chooseHealTarget() {

  }

  chooseMoveLoc = (c : string, battleUnit : BattleUnit) => {
    const [currColStr, currRowStr] = this.map.unitToLoc[c]
    const movableSquares = this.map.getMovableSquares(currColStr, currRowStr, battleUnit.origUnit.unitStats.mov);

    const printableSquares = Array.from(movableSquares);
    printableSquares.sort();

    while (true) {
      console.log('\nEnter location:');
      console.log('(Options: ' + printableSquares.join(', ') + ')');
      const input = prompt('> ').toUpperCase();

      if (movableSquares.has(input)) {
        return input;
      } else {
        console.log('Sorry, please enter a valid input. ')
      }
    }
  }

  // ----------------------------------------

  consolePrintDS = () => {
    this.map.printMap();

    // print player stats
    const aliveChars = _.pickBy(this.playerBattleUnits, 
      (battleUnit) => {
        return (battleUnit.checkIsAlive())
      });
    for (const [playerChar, battleUnit] of Object.entries(aliveChars)) {
      battleUnit.printBattleUnit({});
    }

    console.log();

    console.log('Enemies:');
    // print enemy stats
    const aliveEnemies = _.pickBy(this.enemyBattleUnits, 
      (battleUnit) => {
        return (battleUnit.checkIsAlive())
      });
    for (const [enemyChar, battleUnit] of Object.entries(aliveEnemies)) {
      const [locX, locY] = this.map.unitToLoc[enemyChar];
      battleUnit.printBattleUnit({'locationStr': locX + locY});
    }
  }

  chooseRemainingCharacter() : string|null { 
    const availableChars = _.pickBy(this.playerBattleUnits, 
      (battleUnit) => {
        return (battleUnit.checkIsAlive() && battleUnit.checkTurnRemaining())
      });
    if (_.isEmpty(availableChars)) {
      return null;
    }

    // Console display so people know what they're choosing from 
    this.consolePrintDS();

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
    const currLoc = this.map.unitToLoc[c];

    // wait
    const possibleActions : Record<string,string> = {
      'w': Actions.Wait
    }

    // move
    if (battleUnit.turnStatus === TurnStatus.CanMoveOrAct) {
      possibleActions['m'] = Actions.Move;
    }

    // heal and fight
    const weapon = weapons[battleUnit.origUnit.weaponInitial];

    const friendCharArr = this.map.getUnitsInRange(currLoc[0], currLoc[1], weapon.weaponStats.range, this.map.isFriend);
    const healableFriendArr = _.pickBy(friendCharArr, 
      (friendChar) => {
        const battleUnit = this.playerBattleUnits[friendChar];
        return (battleUnit.checkNeedsHealing())
      });
    const enemyCharArr = this.map.getUnitsInRange(currLoc[0], currLoc[1], weapon.weaponStats.range, this.map.isEnemy);

    if (weapon.isHealing && 
      _.size(healableFriendArr) > 0) {
        possibleActions['h'] = Actions.Heal;
    } else if (!weapon.isHealing && 
      enemyCharArr.length > 0) {
        possibleActions['f'] = Actions.Fight;
    }

    // --- end action choices ---

    if (SECRET_DEBUGGING_LOSE) {
      possibleActions['d'] = '<S_D_LOSE>: Defeated';
    }

    while (true) {
      console.log('\nChoose action:');
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

  checkAllEnemiesDead() : boolean {
    const aliveEnemies = _.pickBy(this.enemyBattleUnits, 
      (battleUnit) => {
        return (battleUnit.checkIsAlive())
      });
    return (_.isEmpty(aliveEnemies));
  }

  playOneTurn() {
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
          const resultLoc = this.chooseMoveLoc(c, battleUnit);
          this.map.moveThere(c, resultLoc);

          console.log('\n' + playerUnitName + ' moved to ' + resultLoc);
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
