import { getModelForClass, prop } from '@typegoose/typegoose';

export interface IPlacementSchema {
    r: number;
    x: number;
    y: number;
}

export interface IPuzzleSolutionSchema {
    votes: number; // number of people who have voted for this solution
    score: number; // StackRabbit evaluation
    firstPiece: IPlacementSchema; // placement of first piece
    secondPiece: IPlacementSchema; // placement of second piece
}

export interface IPuzzleAttemptSchema {
    playerElo: number;
    isCorrect: boolean;
}

// Define the IUser interface
export interface IPuzzleSchema {

    id: string; // unique id of the puzzle
    status: PuzzleStatus;

    board: string; // encoded board
    initialElo: number; // initial elo of the puzzle
    elo: number; // current puzzle difficulty elo

    correctSolution: IPuzzleSolutionSchema; // the correct solution to the puzzle
    incorrectSolutions: IPuzzleSolutionSchema[]; // incorrect solutions to the puzzle

    attempts: IPuzzleAttemptSchema[]; // attempts at solving the puzzle

}

export enum PuzzleStatus {
    UNEXPLORED = "UNEXPLORED", // no one has attempted the puzzle yet
    PENDING = "PENDING", // at least one person has attempted the puzzle, but not enough to be stable
    STABLE = "STABLE", // puzzle elo is now fixed
}

// User class with Typegoose decorators, implementing the IUser interface
class PuzzleSchema implements IPuzzleSchema {

    @prop({ required: true, unique: true})
    public id!: string;

    @prop({ required: true, enum: PuzzleStatus})
    public status!: PuzzleStatus;
    
    @prop({ required: true })
    public board!: string;

    @prop({ required: true })
    public initialElo!: number;

    @prop({ required: true })
    public elo!: number;

    @prop({ required: true })
    public correctSolution!: IPuzzleSolutionSchema;

    @prop({ required: true })
    public incorrectSolutions!: IPuzzleSolutionSchema[];

    @prop({ default: [] })
    public attempts!: IPuzzleAttemptSchema[];

}

// Convert User class to a Mongoose model
const DBPuzzle = getModelForClass(PuzzleSchema);

export default DBPuzzle;
