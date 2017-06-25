var GameStatus = (function () {
    function GameStatus() {
    }
    return GameStatus;
}());
var Randomizer = (function () {
    function Randomizer() {
        this._seedAmount = 1;
    }
    Randomizer.prototype.seed = function (amount) {
        this._seedAmount = amount;
    };
    Randomizer.prototype.next = function () {
        var val = Math.sin(this._seedAmount) * 1000000;
        this._seedAmount += 1;
        return val;
    };
    return Randomizer;
}());
var MazeGameStatus = (function () {
    function MazeGameStatus() {
    }
    return MazeGameStatus;
}());
var MazeGame = (function () {
    function MazeGame(probabilityModulo, frameIntervalMs) {
        this._cols = 9;
        this._rows = 9;
        this._rand = new Randomizer();
        this._frameIntervalMs = 500;
        this._updateCallbacks = [];
        this._probabilityModulo = 7;
        this._probabilityModulo = probabilityModulo;
        this._frameIntervalMs = frameIntervalMs;
        this.reset();
    }
    Object.defineProperty(MazeGame.prototype, "maze", {
        get: function () {
            return this._maze;
        },
        enumerable: true,
        configurable: true
    });
    MazeGame.prototype.getCommands = function () {
        return ["reset", "left", "right"];
    };
    MazeGame.prototype.executeCommand = function (command) {
        switch (command) {
            case "left":
            case "right":
                this.movePlayer(command);
                break;
            case "reset":
                this.reset();
                break;
        }
        this.triggerUpdateCallbacks();
    };
    MazeGame.prototype.registerUpdateCallback = function (callback) {
        this._updateCallbacks.push(callback);
    };
    MazeGame.prototype.init = function () {
        this._gameStatus = new GameStatus();
        this._gameStatus.data = new MazeGameStatus();
        this._gameStatus.data.distance = 0;
        this._gameStatus.data.playerPosition = this._playerPos;
        this._gameStatus.finished = false;
        this._playerPos = 4;
        this._maze = [];
        this._rand.seed(1);
        for (var r = 0; r < this._rows; r++) {
            this._maze[r] = [];
            for (var c = 0; c < this._cols; c++) {
                this._maze[r][c] = false;
            }
        }
        clearTimeout(this._loopTimeoutId);
    };
    MazeGame.prototype.run = function () {
        var __this = this;
        __this.processGameLoop();
        if (this._gameStatus.finished) {
            return;
        }
        __this._loopTimeoutId = setTimeout(function () { __this.run(); }, this._frameIntervalMs);
    };
    MazeGame.prototype.processGameLoop = function () {
        this._maze.pop();
        var newRow = this.generateNewRow();
        this._maze.unshift(newRow);
        this.validatePlayer();
        this._gameStatus.data.distance++;
        this._gameStatus.data.playerPosition = this._playerPos;
        this.triggerUpdateCallbacks();
    };
    MazeGame.prototype.generateNewRow = function () {
        var row = [];
        for (var r = 0; r < this._cols; r++) {
            var nextRand = Math.abs(Math.round(this._rand.next()));
            var pushVal = nextRand % this._probabilityModulo == 0;
            row.push(pushVal);
        }
        return row;
    };
    MazeGame.prototype.validatePlayer = function () {
        this._gameStatus.finished = !!this._maze[this._rows - 1][this._playerPos];
    };
    MazeGame.prototype.triggerUpdateCallbacks = function () {
        var _this = this;
        this._updateCallbacks.forEach(function (c) { return c(_this._gameStatus); });
    };
    MazeGame.prototype.movePlayer = function (moveDirection) {
        var direction = moveDirection == "left" ? -1 : moveDirection == "right" ? 1 : 0;
        this._playerPos += direction;
        this._playerPos = Math.min(this._cols - 1, Math.max(this._playerPos, 0));
    };
    MazeGame.prototype.reset = function () {
        this.init();
        this.run();
    };
    return MazeGame;
}());
