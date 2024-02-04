// Ours
import { playerUnits, enemiesLevel1 } from './unit_class.js';

import fs from 'node:fs';


const ALPHABET = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

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
  terrainMap = {}; // Dictionary: location -> terrain. Shouldn't change
  unitToLoc = {}; // Dictionary: unit -> location
  locToUnit = {}; // Dictionary: location -> unit

  allUnits; 

  constructor(filename) {
    try {
      const data = fs.readFileSync(filename, 'utf8');
      const lines = data.split('\n');

      const numRowsCols = lines.shift().split(',');
      this.numRows = numRowsCols[0];
      this.numCols = numRowsCols[1];

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
    } catch (err) {
      console.error(err);
    }

    // // Fake test data
    // this.numRows = 16;
    // this.numCols = 11; 
    // this.terrainMap = FAKE_TEST_DATA['terrainMap']
    // this.unitToLoc = FAKE_TEST_DATA['unitToLoc']
    // this.locToUnit = FAKE_TEST_DATA['locToUnit']

    this.allUnits = {...playerUnits, ...enemiesLevel1};
  }

  addToMapsConstructorHelper(visualRowStr, visualColStr, terrain, rawUnitChar) {
    if (terrain !== '-') {
      this.terrainMap[visualColStr+visualRowStr] = terrain;
    }

    if (rawUnitChar) {
      const unitChar = (rawUnitChar[0] === 'p') ? rawUnitChar[1] : rawUnitChar

      this.unitToLoc[unitChar] = [visualRowStr, visualColStr];
      this.locToUnit[visualColStr+visualRowStr] = unitChar;
    }
  }

  rawPrintBorder() {
    console.log('   +' + '----+'.repeat(this.numCols));
  }

  rawPrintCell(visualRowStr, visualColStr) {
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

class BattleEngine {

}
