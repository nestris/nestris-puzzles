import DBPuzzleUser, { IActivePuzzleSchema, IPuzzleUserSchema } from "./puzzle-user-schema";

// gets the information for a user. if user does not exist, create the user
export async function getUserByUsername(username: string): Promise<IPuzzleUserSchema> {
    
    const user = await DBPuzzleUser.findOne({ username: username });
    if (user) {
        console.log("User found:", user);
        return user;
    }
    else {
        const newUser = new DBPuzzleUser({
            username: username,
            elo: 1000,
            puzzlesSolved: 0,
        });
        console.log("User not found, creating new user:", newUser);
        await newUser.save();
        return newUser;
    }
}

// get the active puzzle for the user, if it exists
export async function getActivePuzzle(username: string): Promise<IActivePuzzleSchema | null> {
    const user = await getUserByUsername(username);
    return user.activePuzzle;
}

// set the active puzzle for a user
export async function setActivePuzzle(username: string, puzzle: IActivePuzzleSchema | null) {
    await DBPuzzleUser.findOneAndUpdate(
        {username: username},
        {
            activePuzzle: puzzle
        },
        {upsert: true}
    );
}

// set active puzzle for a user to null
export async function clearActivePuzzle(username: string) {
    await setActivePuzzle(username, null);
}