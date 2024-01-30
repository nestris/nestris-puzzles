import { getModelForClass, index, prop } from '@typegoose/typegoose';
import { IPuzzleSchema } from '../puzzle/puzzle-schema';

/*
When a user requests for a puzzle, elo changes are calculated for the given user and puzzle,
and stored as an ActivePuzzle within the user. When the user solves the puzzle,
the elo updates using this info, and the ActivePuzzle is cleared
*/
export interface IActivePuzzleSchema extends IPuzzleSchema {
    userEloIncrease: number; // the amount of elo the user should gain if win
    userEloDecrease: number; // the amount of elo the user should lose if loss
}

// Storing the puzzle data for a user in the database
export interface IPuzzleUserSchema {
    username: string;
    elo: number;
    puzzlesSolved: number;
    activePuzzle: IActivePuzzleSchema | null;
}

// User class with Typegoose decorators, implementing the IUser interface
@index({username: 1}, {unique: true})
@index({elo: 1})
class PuzzleUserSchema implements IPuzzleUserSchema {

    @prop({ required: true})
    public username!: string;

    @prop({ required: true })
    public elo!: number;

    @prop({ default: 0 })
    public puzzlesSolved!: number;

    @prop({default: null})
    public activePuzzle!: IActivePuzzleSchema | null;
}

// Convert User class to a Mongoose model
const DBPuzzleUser = getModelForClass(PuzzleUserSchema);

export default DBPuzzleUser;
