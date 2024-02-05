// Ours
import { playerUnits, UnitStatsType } from './unit_class';
import { DialogueEngine } from './dialogue_engine';
import { Map } from './battle_engine';

// Like getInput()
import promptFunc from 'prompt-sync';
const prompt = promptFunc();

const LINE_WIDTH = 80;

const QUIT_INPUT = 'q';

function loopCharacters(menuTitle : string, funcOnChar : (playerChar:string)=>void) {
  while (true) {
    console.log(menuTitle + `:
      (a) Ava
      (f) Foteini
      (l) Leonidas
      (m) Malcolm
      (q) << Back to previous menu >>
    `);
    const input = prompt('> ').toLowerCase();

    if (input === QUIT_INPUT) {
      break;
    } else if (input in playerUnits) {
      funcOnChar(input);
    } else {
      console.log('Sorry, please enter a valid input. ')
    }
  } 
}

function printInfo(playerChar : string) {
  console.log('\nAbout ' + playerUnits[playerChar].playerUnitName + ':');
  console.log(playerUnits[playerChar].playerUnitDescription);
}

function meetCharactersLoop() {
  loopCharacters('\nMeet the characters', printInfo);
}

function printStats(playerChar : string) {
  const playerUnit = playerUnits[playerChar]
  console.log('\n' + playerUnit.playerUnitName + "'s stats:");
  const statsNames = {
    'level': 'Level',
    'hp': 'HP',
    'str': 'Strength',
    'mag': 'Magic',
    'def': 'Defense',
    'res': 'Resistance',
    'skill': 'Skill',
    'speed': 'Speed',
    'mov': 'Move'
  }
  console.log();
  for (const [stat, name] of Object.entries(statsNames)) {
    console.log(playerUnit.playerUnitStats[stat as keyof UnitStatsType] + ' : ' + name);
  }
}

function seeStatsLoop() {
  loopCharacters('\nSee character stats', printStats);
}

function play1Pre() {
  const engine = new DialogueEngine(LINE_WIDTH);
  engine.runDialogueFromTxt('1pre.txt');
}

function play1Post() {
  const engine = new DialogueEngine(LINE_WIDTH);
  engine.runDialogueFromTxt('1post.txt');
}

// can you take params into a pointer function?
function playLevel1() {
  console.log('\nLevel 1');
  const map = new Map('level1players.csv');
  map.printMap();
}

// Run the main menu loop
function main() {
  console.log('\nWelcome to FE CAVALRY MINI!');
  // (playerChar:string)=>void
  const inputOptions : Record<string, ()=>void> = {
    'a': meetCharactersLoop, 
    'b': seeStatsLoop,
    'c': play1Pre,
    'd': playLevel1, 
    'e': play1Post, 
  };

  while (true) {
    console.log(`\nMenu:
      (a) Meet the characters
      (b) See character stats
      (c) Play the story before Chapter 1
      (d) Play Chapter 1
      (e) Play the story after Chapter 1
      (q) Quit
    `);
    const input = prompt('> ').toLowerCase();

    if (input === QUIT_INPUT) {
      break;
    } else if (input in inputOptions) {
      inputOptions[input]();
    } else {
      console.log('Sorry, please enter a valid input. ')
    }
  } 

  console.log('Thank you for playing!');
}

main();
