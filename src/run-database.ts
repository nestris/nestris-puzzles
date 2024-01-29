import { connectToDatabase } from "./database/connect-to-database";
require('dotenv').config();

/*
Standalone .ts file to perform different database operations
*/

async function main() {
    
    
    await connectToDatabase();
    console.log("Connected to database");

}

main();