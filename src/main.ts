import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { GameState } from "./tetris-models/game-state";
import { TetrisBoard } from "./tetris-models/tetris-board";
import { TetrominoType, getTetrominoName } from "./tetris-models/tetromino-type";
import { _rawStackrabbitMoves, getRawStackrabbitMoves, getStackrabbitMoves } from "./stackrabbit";
import { getRandomBoardState } from "./puzzle-generation/get-random-puzzle";
import { PuzzleEvaluation, evaluatePuzzle, getPuzzleEvaluationJSON, ratePuzzleDifficulty } from "./puzzle-generation/evaluate-puzzle";
import { BoardState } from "./puzzle-generation/puzzle-models";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/api/raw", (req: Request, res: Response) => {

    const state = new GameState(
        new TetrisBoard(),
        TetrominoType.T_TYPE,
        TetrominoType.T_TYPE,
    );

    console.time("C++");
    const result = getRawStackrabbitMoves(state);
    console.timeEnd("C++");

    
    res.send(result);
});

app.get("/api/simulate", (req: Request, res: Response) => {

    const state = new GameState(
        new TetrisBoard(),
        TetrominoType.T_TYPE,
        TetrominoType.T_TYPE,
    );

    for (let i = 0; i < 5; i++) {
        state.makeMove(0);
        state.print();
    }

    
    res.send("success");
});

app.get("/random", async (req: Request, res: Response) => {

    console.log("=======================\n\n");

    // keep generating puzzles until we get one that is rated
    let state: BoardState;
    let puzzle: PuzzleEvaluation | undefined = undefined;
    while (true) {
        state = getRandomBoardState();
        console.log("\nFirst piece", getTetrominoName(state.currentType));
        console.log("Second piece", getTetrominoName(state.nextType));
        console.log();
        puzzle = evaluatePuzzle(state);
        if (ratePuzzleDifficulty(puzzle) !== undefined) break;
    }
    
    state.board.print();
    console.log("Current Piece:", puzzle.correctSolution.firstPiece.getTetrisNotation());
    console.log("Next Piece:", puzzle.correctSolution.secondPiece.getTetrisNotation());
    
    res.send({puzzle: getPuzzleEvaluationJSON(puzzle)});
});




app.get("/", (req: Request, res: Response) => {

    const request = "00000000000000000000000000000000000000000000000000111011111011111111101111111110111111111011111111101111111110111111111011111111101111111110111111111011111111101111111110111111111011111111101111111110|18|0|1|1|X.|200|6|";
    const result = _rawStackrabbitMoves(request);


    res.send(result);
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});