import readline from "readline";
import { log } from "console";

const main = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  let lineSetting = null;
  let columnSetting = null;
  const lineStars =
    "***********************************************************************";

  rl.question(
    lineStars +
      "\n\n\tBienvenue dans le jeu de l'allumette\t\n\n" +
      lineStars +
      "\n\nCombien de lignes voulez vous ? ",
    function (line) {
      rl.question("combien de colonnes ", function (column) {
        lineSetting = parseInt(line);
        columnSetting = parseInt(column);

        if (Number.isNaN(lineSetting) || Number.isNaN(columnSetting)) {
          log(
            "Vous avez tapé des valeurs non numériques veuillez relancer svp "
          );
          rl.close();
        }
        let grid = new AilumetteGrid(lineSetting, columnSetting);
        new Game(grid).play(rl);
      });
    }
  );
};

export class Cell {
  static choices = [" ", "|"];
  constructor(choiceNumber = Math.floor(Math.random() * Cell.choices.length)) {
    this.content = Cell.choices[choiceNumber];
  }
}

export class AilumetteGrid {
  constructor(line, column) {
    this.line = line;
    this.column = column;
    this.grid = [];
    for (const x of [...Array(line).keys()]) {
      this.grid[x] = [];
      for (const y of [...Array(column).keys()]) {
        let cell = new Cell();
        this.grid[x].push(cell.content);
      }
    }
  }

  updateCells(x, matches) {
    let deleted = 0;
    let j = 0;
    while (deleted != matches && j < this.column) {
      if (this.grid[x - 1][j] == Cell.choices[1]) {
        this.grid[x - 1][j] = Cell.choices[0];
        deleted++;
      }
      j++;
    }
  }

  isEmpty() {
    const flatGrid = [].concat.apply([], this.grid);
    const found = flatGrid.indexOf(Cell.choices[1]);
    return found == -1;
  }

  countMatchesOnLine(line) {
    let count = 0;
    this.grid[line - 1].forEach((element) => {
      if (element == Cell.choices[1]) {
        count++;
      }
    });

    return count;
  }
  countMatchesAvailable() {
    let count = 0;
    for (let line = 0; line < this.line; line++) {
      this.grid[line].forEach((element) => {
        if (element == Cell.choices[1]) {
          count++;
        }
      });
    }
    return count;
  }
}

export const PLAYER_NAME = "Your";
export const IA_NAME = "Ia's";

export class Game {
  constructor(grid) {
    this.grid = grid;
    this.looser = null;
  }

  play(rl) {
    this.drawGrid();

    const ia = () => {
      let randomLine = Math.floor(Math.random() * this.grid.line) + 1;
      if (this.grid.countMatchesOnLine(randomLine) == 0) {
        ia();
      }
      console.log(IA_NAME + " turn");
      let randomMatch =
        Math.floor(Math.random() * this.grid.countMatchesOnLine(randomLine)) +
        1;
      if (this.grid.countMatchesAvailable() == 2) {
        randomMatch = 1;
      }
      this.grid.updateCells(randomLine, randomMatch);

      console.log(
        "IA removed ",
        randomMatch.toString() + " matches from line " + randomLine.toString()
      );
      this.drawGrid();
      if (this.grid.isEmpty()) {
        this.looser = IA_NAME;
        rl.close();
      } else {
        askQuestion();
      }
    };

    const askQuestion = () => {
      rl.question(PLAYER_NAME + " turn  \nLine : ", (line) => {
        rl.question("Match : ", (match) => {
          match = parseInt(match);
          line = parseInt(line);
          const msg = this.validateInput(line, match);
          if (msg != "") {
            console.log(msg);
            askQuestion();
          } else {
            this.grid.updateCells(line, match);
            console.log(
              "Player removed ",
              +String(match) + " matches from line " + String(line)
            );
            this.drawGrid();
            if (this.grid.isEmpty()) {
              this.looser = PLAYER_NAME;
              rl.close();
            } else {
              ia();
            }
          }
        });
      });
    };

    rl.on("close", () => {
      const msg =
        this.looser == PLAYER_NAME
          ? "You lost !!"
          : this.looser == IA_NAME
          ? "I’ll get you next time!!"
          : "Kiss";
      console.log("\n" + msg + "\n");
      process.exit(0);
    });

    askQuestion();
  }

  drawHeaderOrFooter(column) {
    for (let i = 0; i < column * 2; i++) {
      process.stdout.write("*");
    }
    process.stdout.write("\n");
  }

  drawGrid() {
    this.drawHeaderOrFooter(this.grid.column);
    for (const x of [...Array(this.grid.line).keys()]) {
      for (const y of [...Array(this.grid.column).keys()]) {
        if (y == 0 || y == this.grid.column) {
          process.stdout.write("*");
        }
        process.stdout.write(this.grid.grid[x][y]);
        if (y == this.grid.column - 1) {
          process.stdout.write("  *");
        }
      }
      process.stdout.write("\n");
    }
    this.drawHeaderOrFooter(this.grid.column);
  }

  validateInput(line, matches) {
    if (line == 0 || line > this.grid.line) {
      return "Error: this line is out of range";
    } else if (
      Number.isNaN(line) ||
      Number.isNaN(matches) ||
      line < 0 ||
      matches < 0 ||
      typeof line != "number" ||
      typeof matches != "number"
    ) {
      return "Error: invalid input (positive number expected)";
    } else if (matches == 0) {
      return "Error: you have to remove at least one match";
    } else if (this.grid.countMatchesOnLine(line) < matches) {
      return "not enough matches on this line";
    }
    return "";
  }
}

main();
