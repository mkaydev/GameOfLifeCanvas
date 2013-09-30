CELL_WIDTH = 5;
CELL_HEIGHT = 5;

Cell: function Cell() {
    this.state = this.DEAD_STATE;
    this.nextState = this.DEAD_STATE;
}
Cell.prototype.ALIVE_STATE = 0;
Cell.prototype.DEAD_STATE = 1;

Cell.prototype.isAlive = function isAlive() {
    return (this.state === this.ALIVE_STATE);
};

Cell.prototype.die = function die() {
    this.state = this.DEAD_STATE;
};

Cell.prototype.rise = function rise() {
    this.state = this.ALIVE_STATE;
};

Cell.prototype.initializeState = function initializeState() {
    var rand = Math.random();
    if (rand <= 0.5) {
        this.rise();
    } else {
        this.die();
    }
};

Cell.prototype.initializeNextState = function getNextStep(neighborCells) {
    var aliveCount = 0;
    for (var i = 0; i < neighborCells.length; i++) {
        if (neighborCells[i].isAlive()) aliveCount++;
    }

    if (aliveCount < 2) {
        // under-population
        this.nextState = this.DEAD_STATE;
    } else if (aliveCount > 3) {
        // over-crowding
        this.nextState = this.DEAD_STATE;
    } else if (aliveCount === 3) {
        // reproduction
        this.nextState = this.ALIVE_STATE;
    } else {
        if (this.isAlive()) {
            this.nextState = this.ALIVE_STATE;
        } else {
            this.nextState = this.DEAD_STATE;
        }
    }
 }

Cell.prototype.step = function step() {
    if (this.nextState === this.DEAD_STATE) {
        this.die();
    } else if (this.nextState === this.ALIVE_STATE) {
        this.rise();
    }
}

Cell.prototype.drawCell = function drawCell(x, y, context) {
    if (this.isAlive()) {
        context.fillStyle = "black";
    } else {
        context.fillStyle = "white";
    }
    context.fillRect(x, y, x + CELL_WIDTH, y + CELL_HEIGHT);
}


Game: function Game(colCount, rowCount, canvasId) {
    this.canvasId = canvasId;
    this.canvas = document.getElementById(this.canvasId);

    this.colCount = colCount;
    this.rowCount = rowCount;
    this.height = this.colCount * CELL_HEIGHT;
    this.width = this.rowCount * CELL_WIDTH;
    $("#" + canvasId).attr("width", this.width);
    $("#" + canvasId).attr("height", this.height);

    this.cells = [];
    this.createCells();
}

Game.prototype.stepInterval = 100;
Game.prototype.stepLoopId = null;
Game.prototype.running = false;
Game.prototype.play = function play() {
    if (this.stepLoopId === null) {
        this.stepLoopId = setInterval(this.step.bind(this), this.stepInterval);
        this.running = true;
    }
}
Game.prototype.stop = function stop() {
    if (this.stepLoopId === null) return;
    window.clearInterval(this.stepLoopId);
    this.stepLoopId = null;
    this.running = false;
}


Game.prototype.createCells = function createCells() {
    for (var i = 0; i < this.colCount; i++) {
        var col = [];
        for (var j = 0; j < this.rowCount; j++) {
            var cell = new Cell();
            col.push(cell);
        }
        this.cells.push(col);
    }
}

Game.prototype.drawCells = function drawCells() {
    var context = this.canvas.getContext("2d");
    for (var col = 0; col < this.cells.length; col++) {
        for (var row = 0; row < this.cells[col].length; row++) {
            var x = col * CELL_WIDTH;
            var y = row * CELL_HEIGHT;
            this.cells[col][row].drawCell(x, y, context);
        }
    }
}

Game.prototype.initializeCellStates = function initializeCellStates() {
    this.stop();
    for (var col = 0; col < this.cells.length; col++) {
        for (var row = 0; row < this.cells[col].length; row++) {
            this.cells[col][row].initializeState();
        }
    }
    this.drawCells();
};

Game.prototype.getNeighborCells = function getNeighborCells(col, row) {
    /*console.log(col, row,
     [(col - 1 + this.colCount) % this.colCount, (row - 1 + this.rowCount) % this.rowCount],
     [(col - 1 + this.colCount) % this.colCount, (row) % this.rowCount],
     [(col - 1 + this.colCount) % this.colCount,(row + 1) % this.rowCount],

     [(col) % this.colCount,(row - 1 + this.rowCount) % this.rowCount],
     [(col) % this.colCount,(row + 1) % this.rowCount],

     [(col + 1) % this.colCount,(row - 1 + this.rowCount) % this.rowCount],
     [(col + 1) % this.colCount,(row) % this.rowCount],
     [(col + 1) % this.colCount,(row + 1) % this.rowCount]
     );   */

    return [
        this.cells[(col - 1 + this.colCount) % this.colCount][(row - 1 + this.rowCount) % this.rowCount],
        this.cells[(col - 1 + this.colCount) % this.colCount][(row) % this.rowCount],
        this.cells[(col - 1 + this.colCount) % this.colCount][(row + 1) % this.rowCount],

        this.cells[(col) % this.colCount][(row - 1 + this.rowCount) % this.rowCount],
        this.cells[(col) % this.colCount][(row + 1) % this.rowCount],

        this.cells[(col + 1) % this.colCount][(row - 1 + this.rowCount) % this.rowCount],
        this.cells[(col + 1) % this.colCount][(row) % this.rowCount],
        this.cells[(col + 1) % this.colCount][(row + 1) % this.rowCount]
    ];
}

Game.prototype.step = function step() {
    for (var col = 0; col < this.cells.length; col++) {
        for (var row = 0; row < this.cells[col].length; row++) {
            var neighborCells = this.getNeighborCells(col, row);
            this.cells[col][row].initializeNextState(neighborCells);
            //console.log(row, col, this.cells[col][row].nextState);
        }
    }

    for (var col = 0; col < this.cells.length; col++) {
        for (var row = 0; row < this.cells[col].length; row++) {
            this.cells[col][row].step();
        }
    }
    this.drawCells();
}

Game.prototype.killCells = function killCells() {
    for (var col = 0; col < this.cells.length; col++) {
        for (var row = 0; row < this.cells[col].length; row++) {
            this.cells[col][row].die();
        }
    }
    this.drawCells();
}

Game.prototype.clear = function clear() {
    this.stop();
    this.killCells();
}


$(document).ready(function() {
    var canvasId = "game";
    var colCount = 80;
    var rowCount = 80;
    var game = new Game(colCount, rowCount, canvasId);
    $("#clear").click(game.clear.bind(game));
    $("#initialize").click(game.initializeCellStates.bind(game));
    $("#play").click(game.play.bind(game));
    $("#stop").click(game.stop.bind(game));

});