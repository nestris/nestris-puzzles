import DBPuzzleSubmission, { IPuzzleSubmissionSchema } from "./puzzle-submission-schema";

export async function addNewSubmissionToDatabase(submission: IPuzzleSubmissionSchema) {
    const newSubmission = new DBPuzzleSubmission(submission);
    await newSubmission.save();
    console.log("New submission added to database:", newSubmission);
}