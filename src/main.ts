import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { GameState } from "./tetris-models/game-state";
import { TetrisBoard } from "./tetris-models/tetris-board";
import { TetrominoType } from "./tetris-models/tetromino-type";
import { getStackrabbitMoves } from "./stackrabbit";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {

    const state = new GameState(
        new TetrisBoard(),
        TetrominoType.I_TYPE,
        TetrominoType.J_TYPE,
    );

    console.time("C++");
    const result = getStackrabbitMoves(state);
    console.timeEnd("C++");

    res.send(result);
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});