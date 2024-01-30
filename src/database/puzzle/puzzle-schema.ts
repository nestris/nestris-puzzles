import { getModelForClass, prop } from '@typegoose/typegoose';
import { IPuzzleSubmissionSchema } from '../puzzle-submission/puzzle-submission-schema';

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


export interface IPuzzleSchema {

    id: string; // unique id of the puzzle
    status: PuzzleStatus;

    board: string; // encoded board
    initialElo: number; // initial elo of the puzzle
    elo: number; // current puzzle difficulty elo

    correctSolution: IPuzzleSolutionSchema; // the correct solution to the puzzle
    incorrectSolutions: IPuzzleSolutionSchema[]; // incorrect solutions to the puzzle

    attempts: number; // number of people who have attempted this puzzle
    successes: number; // number of people who have solved this puzzle

    usernames: string[]; // list of usernames of users that attempted the puzzle
}

export enum PuzzleStatus {
    PENDING = "PENDING", // puzzle elo is not fixed yet
    STABLE = "STABLE", // puzzle elo is now fixed
}

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

    @prop({ default: 0 })
    public attempts!: number;

    @prop({ default: 0 })
    public successes!: number;

    @prop({ default : [] })
    public usernames!: string[];

}

// Convert User class to a Mongoose model
const DBPuzzle = getModelForClass(PuzzleSchema);

export default DBPuzzle;
