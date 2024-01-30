import { getModelForClass, index, prop } from '@typegoose/typegoose';
import { IPlacementSchema, PuzzleStatus } from '../puzzle/puzzle-schema';

// a submission of a puzzle attempt by a user
export interface IPuzzleSubmissionSchema {

    // identifying submission information
    submissionID: string; // unique id of the submission
    username: string; // username of the user who submitted the puzzle
    puzzleID: string; // id of the puzzle submitted

    // data related to the submission
    timestamp: Date; // timestamp of the submission
    isCorrect: boolean; // whether the submission was correct or not
    firstPlacement: IPlacementSchema; // first placement of the submission
    secondPlacement: IPlacementSchema; // second placement of the submission
    
    // data related to the player
    playerEloBeforeSubmission: number; // elo of the player before submission
    playerEloAfterSubmission: number; // elo of the player after submission
    playerPuzzlesSolved: number; // number of puzzles solved by the player including this submission
    
    // data related to the puzzle
    puzzleStatusBeforeSubmission: PuzzleStatus; // status of the puzzle before submission
    puzzleStatusAfterSubmission: PuzzleStatus; // status of the puzzle after submission
    puzzleEloBeforeSubmission: number; // elo of the puzzle submitted before submission
    puzzleEloAfterSubmission: number; // elo of the puzzle submitted after submission
    puzzleAttempts: number; // number of attempts of the puzzle including this submission    
}

@index({submissionID: 1}, {unique: true})
class PuzzleSubmissionSchema implements IPuzzleSubmissionSchema {

    @prop({ required: true})
    public submissionID!: string;

    @prop({ required: true })
    public username!: string;

    @prop({ required: true })
    public puzzleID!: string;

    @prop({ required: true })
    public timestamp!: Date;

    @prop({ required: true })
    public isCorrect!: boolean;

    @prop({ required: true })
    public firstPlacement!: IPlacementSchema;

    @prop({ required: true })
    public secondPlacement!: IPlacementSchema;

    @prop({ required: true })
    public playerEloBeforeSubmission!: number;

    @prop({ required: true })
    public playerEloAfterSubmission!: number;

    @prop({ required: true })
    public playerPuzzlesSolved!: number;

    @prop({ required: true })
    public puzzleStatusBeforeSubmission!: PuzzleStatus;

    @prop({ required: true })
    public puzzleStatusAfterSubmission!: PuzzleStatus;

    @prop({ required: true })
    public puzzleEloBeforeSubmission!: number;

    @prop({ required: true })
    public puzzleEloAfterSubmission!: number;

    @prop({ required: true })
    public puzzleAttempts!: number;
}

// Convert User class to a Mongoose model
const DBPuzzleSubmission = getModelForClass(PuzzleSubmissionSchema);

export default DBPuzzleSubmission;
