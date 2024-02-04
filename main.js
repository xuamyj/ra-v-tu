// Ours
import { units } from './unit_class.js';
import { DialogueEngine } from './dialogue_engine.js';

// Like getInput()
import promptFunc from 'prompt-sync';
const prompt = promptFunc();

const QUIT_INPUT = 'q';
const LINE_WIDTH = 80;

function loopCharacters(menuTitle, funcOnChar) {
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
    } else if (input in units) {
      funcOnChar(input);
    } else {
      console.log('Sorry, please enter a valid input. ')
    }
  } 
}

function printInfo(char) {
  console.log('\nAbout ' + units[char].unitName + ':');
  console.log(units[char].unitDescription);
}

function meetCharactersLoop() {
  loopCharacters('\nMeet the characters', printInfo);
}

function printStats(char) {
  const unit = units[char]
  console.log('\n' + unit.unitName + "'s stats:");
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
    if (unit.currentStats[stat] === null) {
      console.log(unit.unitStats[stat] + ' : ' + name);
    } else {
      console.log(unit.currentStats[stat] + ' / ' + unit.unitStats[stat] + ' : ' + name);
    }
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
  console.log('level 1');
}

// Run the main menu loop
function main() {
  console.log('\nWelcome to FE CAVALRY MINI!');
  const inputOptions = {
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
