/*
Deals with selecting a puzzle for player to solve
*/

import { IActivePuzzleSchema, IPuzzleUserSchema } from "../database/puzzle-user.ts/puzzle-user-schema";
import { getUserByUsername } from "../database/puzzle-user.ts/puzzle-user-service";
import { IPuzzleSchema, PuzzleStatus } from "../database/puzzle/puzzle-schema";
import { getBoundedRandomPuzzleFromDB, getRandomPuzzleFromDB } from "../database/puzzle/puzzle-service";

/*
Given user info, find a puzzle matching
the user's elo that the user hasn't solved before

The selection algorithm is as follows:
50% chance: go to A
30% chance: go to B
20% chance: go to C

A: get STABLE puzzle that is +/-200 elo of user. if this fails, go to B
B: get STABLE puzzle is +/- 400 elo of user. if this fails, go to C
C: get PENDING puzzle that is +/- 400 elo of user. if this fails, go to D
D: get any puzzle of any elo. if this fails, throw error
*/
async function selectNewPuzzleForUser(user: IPuzzleUserSchema): Promise<IPuzzleSchema> {

    const rand = Math.random();

    // A (50% chance)
    if (rand < 0.5) {
        console.log("A: attempting (-200,200) stable search");
        const puzzleStable200 = await getBoundedRandomPuzzleFromDB(
            user.username, user.elo - 200, user.elo + 200, PuzzleStatus.STABLE
        );
        if (puzzleStable200) return puzzleStable200; // if matching puzzle is found, return it
    }

    // B (30% chance OR A fails)
    if (rand < 0.8) {
        console.log("B: attempting (-400,400) stable search");
        const puzzleStable400 = await getBoundedRandomPuzzleFromDB(
            user.username, user.elo - 400, user.elo + 400, PuzzleStatus.STABLE
        );
        if (puzzleStable400) return puzzleStable400; // if matching puzzle is found, return it
    }

    // C (20% chance OR A and B fail)
    console.log("C: attempting (-400,400) pending search");
    const puzzlePending400 = await getBoundedRandomPuzzleFromDB(
        user.username, user.elo - 400, user.elo + 400, PuzzleStatus.PENDING
    );
    if (puzzlePending400) return puzzlePending400;

    // D (A, B, and C fail)
    console.log("D: attempting search without restrictions");
    const puzzleAny = await getRandomPuzzleFromDB(user.username);
    if (puzzleAny) return puzzleAny;
    else throw new Error("Cannot find puzzle for user " + user.username);
}

// Given puzzle and user info, find the elo change for this pairing
// and return as an IActivePuzzleSchema
 function calculatePuzzlePairing(user: IPuzzleUserSchema, puzzle: IPuzzleSchema): IActivePuzzleSchema {

    // TODO
    const eloIncrease = -10;
    const eloDecrease = 10;

    return Object.assign(puzzle, {
        userEloIncrease: eloIncrease,
        userEloDecrease: eloDecrease
    });

}

/*
Gets the active puzzle info for the user, which includes the elo increase
and decrease if the user passes/fails the puzzle.
If the user has not started a puzzle, then a new puzzle is selected for the user.
If the user already has an active puzzle, return that instead.
*/
export async function getActivePuzzleForUser(username: string): Promise<IActivePuzzleSchema> {

    // fetch user info from DB
    const user = await getUserByUsername(username);

    console.log("Getting active puzzle for", user.username);

    // if user already has an active puzzle started, return that
    if (user.activePuzzle) {
        console.log("Return existing active puzzle:", user.activePuzzle.id);
        return user.activePuzzle;
    }

    // otherwise, select a new puzzle
    console.log("Selecting new puzzle for user");
    const selectedPuzzle = await selectNewPuzzleForUser(user);
    console.log("Puzzle selected:", selectedPuzzle.id);

    // calculate pairing and return result
    return calculatePuzzlePairing(user, selectedPuzzle);

}