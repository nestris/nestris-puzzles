import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { GameState } from "./tetris-models/game-state";
import { TetrisBoard } from "./tetris-models/tetris-board";
import { TetrominoType } from "./tetris-models/tetromino-type";
import { getRawStackrabbitMoves, getStackrabbitMoves } from "./stackrabbit";

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




app.get("/", (req: Request, res: Response) => {

    const state = new GameState(
        new TetrisBoard(),
        TetrominoType.I_TYPE,
        TetrominoType.J_TYPE,
    );

    console.time("C++");
    const moves = getStackrabbitMoves(state);
    console.timeEnd("C++");

    moves.nb.forEach((move, i) => {

        console.log(`Move ${i + 1}:`);

        const board = state.getBoard().copy();
        move.firstPlacement.blitToBoard(board);
        if (move.secondPlacement) move.secondPlacement.blitToBoard(board);
        board.print();

        console.log("Score:", move.score);

    });


    res.send(moves);
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});