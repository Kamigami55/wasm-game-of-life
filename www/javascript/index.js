// =========================================================================

// FPS meter logic
// https://www.clicktorelease.com/blog/calculating-fps-with-requestIdleCallback/

var fpsDiv = document.getElementById("fpsValue");
var frames = 0;
var startTime = performance.now();
var FPSNormal = 0;

// Every 1000ms, let's update the framerate
function calculateFPSNormal() {
  var t = performance.now();
  var dt = t - startTime;

  // if elapsed time is greater than 1s
  if (dt > 1000) {
    // calculate the frames drawn over the period of time
    FPSNormal = (frames * 1000) / dt;
    // and restart the values
    frames = 0;
    startTime = t;
  }
  frames++;
}

function updateLabel(fps) {
  fpsDiv.textContent = Math.round(fps);
}

// =========================================================================

// Game of Life logic

class Cell {
  constructor(value) {
    this.value = value;
  }

  get isDead() {
    return this.value === Cell.DEAD;
  }

  get isAlive() {
    return this.value === Cell.ALIVE;
  }
}

Cell.DEAD = 0;
Cell.ALIVE = 1;

class Universe {
  constructor() {
    this.width = 64;
    this.height = 64;
    this.cells = [];

    for (let i = 0; i < this.width * this.height; i++) {
      if (i % 2 === 0 || i % 7 === 0) {
        this.cells.push(new Cell(Cell.ALIVE));
      } else {
        this.cells.push(new Cell(Cell.DEAD));
      }
    }
  }

  getIndex(row, column) {
    return row * this.width + column;
  }

  liveNeighborCount(row, column) {
    let count = 0;
    for (let deltaRow of [this.height - 1, 0, 1]) {
      for (let deltaCol of [this.width - 1, 0, 1]) {
        if (deltaRow === 0 && deltaCol === 0) {
          continue;
        }

        const neighborRow = (row + deltaRow) % this.height;
        const neighborCol = (column + deltaCol) % this.width;
        const idx = this.getIndex(neighborRow, neighborCol);
        count += this.cells[idx].isAlive ? 1 : 0;
      }
    }

    return count;
  }

  tick() {
    const next = [...this.cells];

    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        const idx = this.getIndex(row, col);
        const cell = this.cells[idx];
        const liveNeighbors = this.liveNeighborCount(row, col);

        let nextCell;
        if (cell.isAlive && liveNeighbors < 2) {
          nextCell = Cell.DEAD;
        } else if (
          cell.isAlive &&
          (liveNeighbors === 2 || liveNeighbors === 3)
        ) {
          nextCell = Cell.ALIVE;
        } else if (cell.isAlive && liveNeighbors > 3) {
          nextCell = Cell.DEAD;
        } else if (!cell.isAlive && liveNeighbors === 3) {
          nextCell = Cell.ALIVE;
        } else {
          nextCell = cell.value;
        }

        next[idx] = new Cell(nextCell);
      }
    }

    this.cells = next;
  }

  render() {
    return this.toString();
  }

  toString() {
    return this.cells.toString();
  }

  // get width() {
  //   return this.width;
  // }

  // get height() {
  //   return this.height;
  // }

  // get cells() {
  //   return this.cells;
  // }
}

// =========================================================================

// Canvas Render logic

const CELL_SIZE = 5; // px
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

// Construct the universe, and get its width and height.
// const universe = Universe.new();
// const width = universe.width();
// const height = universe.height();
const universe = new Universe();
const width = universe.width;
const height = universe.height;

// Give the canvas room for all of our cells and a 1px border
// around each of them.
const canvas = document.getElementById("game-of-life-canvas");
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;

const ctx = canvas.getContext("2d");

const renderLoop = () => {
  universe.tick();

  drawGrid();
  drawCells();

  // We're doing nothing, except updating the framerate
  calculateFPSNormal();
  updateLabel(FPSNormal);

  requestAnimationFrame(renderLoop);
};

const drawGrid = () => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  // Vertical lines.
  for (let i = 0; i <= width; i++) {
    ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
    ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
  }

  // Horizontal lines.
  for (let j = 0; j <= height; j++) {
    ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
    ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
  }

  ctx.stroke();
};

const getIndex = (row, column) => {
  return row * width + column;
};

const drawCells = () => {
  // const cellsPtr = universe.cells();
  // const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);
  const cells = universe.cells;

  ctx.beginPath();

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);

      ctx.fillStyle = cells[idx].isDead ? DEAD_COLOR : ALIVE_COLOR;

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  ctx.stroke();
};

drawGrid();
drawCells();
requestAnimationFrame(renderLoop);

// =========================================================================
