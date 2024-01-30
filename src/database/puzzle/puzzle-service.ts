import { Puzzle, PuzzleSolution } from "../../puzzle-models";
import DBPuzzle, { IPlacementSchema, IPuzzleSchema, IPuzzleSolutionSchema, PuzzleStatus } from "./puzzle-schema";
import { v4 as uuid } from "uuid";

// convert PuzzleSolution into serializable IPuzzleSolutionSchema
function encodeSolution(solution: PuzzleSolution): IPuzzleSolutionSchema {
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

// convert Puzzle into serializable IPuzzleSchema
function encodePuzzle(puzzle: Puzzle): IPuzzleSchema {
    return {
        id: uuid(),
        status: PuzzleStatus.PENDING,
        board: puzzle.board.toBinaryString(),
        initialElo: puzzle.elo,
        elo: puzzle.elo,
        correctSolution: encodeSolution(puzzle.correctSolution),
        incorrectSolutions: puzzle.incorrectSolutions.map(encodeSolution),
        attempts: 0,
        successes: 0,
        usernames: []
    };
}

// Adds a new puzzle to the database
export async function addPuzzleToDatabase(puzzle: Puzzle) {
    const dbPuzzle = new DBPuzzle(encodePuzzle(puzzle));
    await dbPuzzle.save();
}

// Adds an array of puzzles to the database
// returns a list of puzzle IDs
export async function batchAddPuzzlesToDatabase(puzzles: Puzzle[]): Promise<string[]> {
    const encodedPuzzles = puzzles.map(encodePuzzle);
    const dbPuzzles = encodedPuzzles.map((puzzle) => new DBPuzzle(puzzle));
    await DBPuzzle.insertMany(dbPuzzles);

    return encodedPuzzles.map((puzzle) => puzzle.id);
}

export async function updatePuzzleAfterPuzzleSubmission(
    puzzleID: string,
    firstPiece: IPlacementSchema,
    secondPiece: IPlacementSchema,
    isCorrect: boolean,
    newElo: number,
    newStatus: PuzzleStatus,
) {

    const puzzle = await DBPuzzle.findOne({ id: puzzleID });
    if (puzzle === null) throw new Error(`Puzzle with id ${puzzleID} not found`);

    // check if (firstsPiece, secondPiece) is in incorectSolutions
    const incorrectSolution = puzzle.incorrectSolutions.find((solution) => {
        return (
            solution.firstPiece.r === firstPiece.r &&
            solution.firstPiece.x === firstPiece.x &&
            solution.firstPiece.y === firstPiece.y &&
            solution.secondPiece.r === secondPiece.r &&
            solution.secondPiece.x === secondPiece.x &&
            solution.secondPiece.y === secondPiece.y
        );
    });

    // if incorrect solution is found, increment votes
    if (incorrectSolution !== undefined) {
        incorrectSolution.votes++;
    }

    // update other fields
    puzzle.elo = newElo;
    puzzle.status = newStatus;
    puzzle.attempts++;
    if (isCorrect) puzzle.successes++;

    // save puzzle
    await puzzle.save();
}

// from the database, get a random puzzle within elo bounds and matching status
// the puzzle must not have previously been given to the user
// if such a puzzle does not exist, return null
export async function getBoundedRandomPuzzleFromDB(
    username: string,
    minElo: number,
    maxElo: number,
    status: PuzzleStatus
): Promise<IPuzzleSchema | null> {

    try {
        // Define the aggregation pipeline
        const pipeline = [
            { $match: {
                elo: { $gte: minElo, $lte: maxElo }, // elo is between minElo and maxElo, inclusive
                usernames: { $ne: username }, // username is not in usernames list
                status: status // matching status
            }},
            { $sample: { size: 1 } } // get one random puzzle only
        ];

        // Perform the aggregation
        const [puzzle] = await DBPuzzle.aggregate(pipeline);

        return puzzle || null;
    } catch (error) {
        console.error(`Error fetching random ${status} puzzle with elo range (${minElo}, ${maxElo})`, error);
        return null;
    }
}

// same as getBoundedRandomPuzzleFromDB(), but with no elo or status restrictions
export async function getRandomPuzzleFromDB(username: string): Promise<IPuzzleSchema | null> {

    try {
        // Define the aggregation pipeline
        const pipeline = [
            { $match: {
                usernames: { $ne: username }, // username is not in usernames list
            }},
            { $sample: { size: 1 } } // get one random puzzle only
        ];

        // Perform the aggregation
        const [puzzle] = await DBPuzzle.aggregate(pipeline);

        return puzzle || null;
    } catch (error) {
        console.error("Error fetching random puzzle:", error);
        return null;
    }
}