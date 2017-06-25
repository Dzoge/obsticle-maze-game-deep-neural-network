interface IInput {
    getCommands(): string[];
    executeCommand(command: string): void;
}
interface IResult<TResult> {
    registerUpdateCallback(callback: (result: GameStatus<TResult>) => void): void;
}
interface IGame<TResult> extends IInput, IResult<TResult> {

}
class GameStatus<TResult>{
    finished: boolean;
    data: TResult;
}
class Randomizer {
    private _seedAmount: number = 1;

    public seed(amount): void {
        this._seedAmount = amount;
    }
    public next(): number {
        let val = Math.sin(this._seedAmount) * 1000000;
        this._seedAmount += 1;
        return val;
    }
}
class MazeGameStatus {
    public distance: number;
    public playerPosition: number;
}
class MazeGame implements IGame<MazeGameStatus>{
    private _maze: boolean[][];
    private _cols: number = 9;
    private _rows: number = 9;
    private _rand: Randomizer = new Randomizer();
    private _frameIntervalMs: number = 500;
    private _playerPos: number;
    private _updateCallbacks: ((result: GameStatus<MazeGameStatus>) => void)[] = [];
    private _gameStatus: GameStatus<MazeGameStatus>;
    private _loopTimeoutId: number;
    private _probabilityModulo: number = 7;

    public get maze(): boolean[][] {
        return this._maze;
    }

    constructor(probabilityModulo: number,
        frameIntervalMs: number) {
        this._probabilityModulo = probabilityModulo;
        this._frameIntervalMs = frameIntervalMs;
        this.reset();
    }

    public getCommands(): string[] {
        return ["reset", "left", "right"];
    }
    public executeCommand(command: string): void {
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
    }
    public registerUpdateCallback(callback: (result: GameStatus<MazeGameStatus>) => void): void {
        this._updateCallbacks.push(callback);
    }

    private init(): void {
        this._gameStatus = new GameStatus<MazeGameStatus>();
        this._gameStatus.data = new MazeGameStatus();
        this._gameStatus.data.distance = 0;
        this._gameStatus.data.playerPosition = this._playerPos;
        this._gameStatus.finished = false;
        this._playerPos = 4;
        this._maze = [];
        this._rand.seed(1);
        for (let r = 0; r < this._rows; r++) {
            this._maze[r] = [];
            for (var c = 0; c < this._cols; c++) {
                this._maze[r][c] = false;
            }
        }

        clearTimeout(this._loopTimeoutId);
    }
    private run(): void {
        let __this = this;
        __this.processGameLoop();
        if (this._gameStatus.finished) { return; }
        __this._loopTimeoutId = setTimeout(function () { __this.run(); }, this._frameIntervalMs);
    }

    private processGameLoop(): void {
        this._maze.pop();
        let newRow: boolean[] = this.generateNewRow();
        this._maze.unshift(newRow);
        this.validatePlayer();
        this._gameStatus.data.distance++;
        this._gameStatus.data.playerPosition = this._playerPos;
        this.triggerUpdateCallbacks();
    }
    private generateNewRow(): boolean[] {
        var row = [];
        for (let r = 0; r < this._cols; r++) {
            let nextRand: number = Math.abs(Math.round(this._rand.next()));
            let pushVal: boolean = nextRand % this._probabilityModulo == 0;
            row.push(pushVal);
        }
        return row;
    }
    private validatePlayer(): void {
        this._gameStatus.finished = !!this._maze[this._rows - 1][this._playerPos];
    }
    private triggerUpdateCallbacks(): void {
        this._updateCallbacks.forEach(c => c(this._gameStatus));
    }
    private movePlayer(moveDirection: string): void {
        let direction = moveDirection == "left" ? -1 : moveDirection == "right" ? 1 : 0;
        this._playerPos += direction;
        this._playerPos = Math.min(this._cols - 1, Math.max(this._playerPos, 0));
    }
    private reset(): void {
        this.init();
        this.run();
    }
}