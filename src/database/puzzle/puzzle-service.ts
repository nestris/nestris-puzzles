import { Puzzle, PuzzleSolution } from "../../puzzle-generation/puzzle-models";
import DBPuzzle, { IPuzzleSchema, IPuzzleSolutionSchema, PuzzleStatus } from "./puzzle-schema";
import { v4 as uuid } from "uuid";

// Adds a new puzzle to the database
export async function addPuzzleToDatabase(puzzle: Puzzle) {

    const encodeSolution = (solution: PuzzleSolution): IPuzzleSolutionSchema => {
        return {
            votes: solution.votes,
            score: solution.score,
            firstPiece: {
                r: solution.firstPiece.getRotation(),
                x: solution.firstPiece.getTranslateX(),
                y: solution.firstPiece.getTranslateY(),
            },
            secondPiece: {
                r: solution.secondPiece.getRotation(),
                x: solution.secondPiece.getTranslateX(),
                y: solution.secondPiece.getTranslateY(),
            }
        };
    }
    
    const puzzleSchema: IPuzzleSchema = {
        id: uuid(),
        status: PuzzleStatus.UNEXPLORED,
        board: puzzle.board.toBinaryString(),
        initialElo: puzzle.elo,
        elo: puzzle.elo,
        correctSolution: encodeSolution(puzzle.correctSolution),
        incorrectSolutions: puzzle.incorrectSolutions.map(encodeSolution),
        attempts: [],
    };

    const newPuzzle = new DBPuzzle({ puzzleSchema });
    await newPuzzle.save();
}
