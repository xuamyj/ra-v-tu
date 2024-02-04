// Ours
import { units } from './unit_class.js';

// Like getInput()
import promptFunc from 'prompt-sync';
const prompt = promptFunc();
import fs from 'node:fs';


export class DialogueEngine {
  LINE_WIDTH;
  

  constructor(lineWidth) {
    this.LINE_WIDTH = lineWidth;
  }

  startPrintDialogue() {
    console.log('\n(hit enter to continue)');
    console.log('+' + '-'.repeat(this.LINE_WIDTH-2) + '+');
    console.log('|' + ' '.repeat(this.LINE_WIDTH-2) + '|');
  }

  endPrintDialogue({addExtraSpace}={}) {
    if (addExtraSpace) {
      console.log('|' + ' '.repeat(this.LINE_WIDTH-2) + '|');
    }
    console.log('+' + '-'.repeat(this.LINE_WIDTH-2) + '+');
  }

  rawPrintLine(wordArray) {
    process.stdout.write('| ');
    // let wordArray = line.split(" ");

    let counter = this.LINE_WIDTH-4;
    while(true) {
      // if no more words, break
      if (wordArray.length == 0) {
        break;
      }
      const nextWord = wordArray.shift();

      // if need a new line
      if (counter-(nextWord.length+1) < 0) {
        process.stdout.write(' '.repeat(counter));
        process.stdout.write(' |' + '\n' + '| ');
        counter = this.LINE_WIDTH-4; // reset counter; assume all words are shorter than this :)
      }
      process.stdout.write(nextWord + ' ');
      counter -= (nextWord.length+1)
    }

    process.stdout.write(' '.repeat(counter));
    process.stdout.write(' |\n');
  }

  printDialogueFromTxt(filename) {
    try {
      const data = fs.readFileSync(filename, 'utf8');
      const lines = data.split('\n');
      for (const line of lines) {

        // empty lines
        if (line.length === 0) {
          // this.rawPrintLine([line]);
          const input = prompt('| ')

        // lines with dialogue
        } else {
          let wordArray = line.split(" ");

          // handle the name
          const firstWord = wordArray.shift();
          const charOrName = firstWord.slice(0, -1);
          if (charOrName.toLowerCase() in units) {
            const unitName = units[charOrName.toLowerCase()].unitName;
            this.rawPrintLine(['[ ' + unitName + ' ]']);
          } else {
            const otherName = charOrName.replace(/[A-Z]/g, " $&").slice(1); // https://stackoverflow.com/questions/73820261/break-camel-case-function-in-javascript
            this.rawPrintLine(['[ ' + otherName + ' ]']);
          }

          // print the rest
          this.rawPrintLine(wordArray);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  printDialogueFromUnit() {
    console.log('\n[Not implemented yet]');
  }

  runDialogueFromTxt(filename) {
    this.startPrintDialogue();
    this.printDialogueFromTxt(filename);
    this.endPrintDialogue({addExtraSpace: false});
  }

  runDialogueFromUnit() {
    console.log('\n[Not implemented yet]');
  }
  
}