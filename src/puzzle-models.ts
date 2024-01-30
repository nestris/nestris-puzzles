import { IPlacementSchema } from "./database/puzzle/puzzle-schema";
import MoveableTetromino from "./tetris-models/moveable-tetromino";
import { TetrisBoard } from "./tetris-models/tetris-board";
import { TetrominoType } from "./tetris-models/tetromino-type";

export interface BoardState {
    board: TetrisBoard;
    currentType: TetrominoType;
    nextType: TetrominoType;
}

export interface Puzzle extends BoardState {

    elo: number, // puzzle difficulty elo

    attempts: number, // number of people who have attempted this puzzle
    successes: number, // number of people who have solved this puzzle

    correctSolution: PuzzleSolution; // the correct solution to the puzzle
    incorrectSolutions: PuzzleSolution[]; // incorrect solutions to the puzzle
}

// a possible solution to the puzzle. Part of the puzzle definition
export interface PuzzleSolution {
    votes: number; // number of people who have voted for this solution
    score: number; // StackRabbit evaluation
    firstPiece: MoveableTetromino; // placement of first piece
    secondPiece: MoveableTetromino; // placement of second piece
}

// a submission of a puzzle by a user
export interface PuzzleSubmission {
    puzzleID: string; // id of the puzzle
    userID: string; // id of the user
    firstPiece: IPlacementSchema; // placement of first piece
    secondPiece: IPlacementSchema; // placement of second piece
    isCorrect: boolean; // whether the submission was correct or not
    eloChange: number; // change in elo of the user
}