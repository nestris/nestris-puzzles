import { connectToDatabase } from "./database/connect-to-database";
import { generateAndAddPuzzlesToDatabase } from "./puzzle-generation/generate-puzzles";
require('dotenv').config();

/*
Standalone .ts file to perform different database operations
*/

async function main() {
    
    
    await connectToDatabase();
    console.log("Connected to database");

    await generateAndAddPuzzlesToDatabase(1);

}

main();