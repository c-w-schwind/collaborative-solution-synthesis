import fs from "fs";
import path from "path";
import {dirname} from "path";
import {fileURLToPath} from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// File paths for users and considerations
const usersFilePath = path.resolve(__dirname, "../seed/data/users.json");
const considerationsFilePath = path.resolve(__dirname, "../seed/data/considerations.json");

// Load the JSON files
const users = JSON.parse(fs.readFileSync(usersFilePath, "utf-8"));
const considerations = JSON.parse(fs.readFileSync(considerationsFilePath, "utf-8"));

// Utility: Get a random number between min and max
function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

// Utility: Randomly sample n distinct elements from an array
function sampleArray(arr, n) {
    const copy = [...arr];
    const result = [];
    for (let i = 0; i < n && copy.length > 0; i++) {
        const idx = Math.floor(Math.random() * copy.length);
        result.push(copy.splice(idx, 1)[0]);
    }
    return result;
}

// Process each document in the considerations array
considerations.forEach((doc) => {
    // Process top-level votes (if present)
    if (doc.votes && Array.isArray(doc.votes.upvotes) && Array.isArray(doc.votes.downvotes)) {
        // Decide how many users participate (70% to 100% of all users)
        const participationCount = Math.floor(users.length * randomBetween(0.7, 1.0));
        // Select a random set of participating user IDs
        const participatingUsers = sampleArray(users, participationCount).map((user) => user._id);

        // Decide what percentage of participants upvote (70% to 100%)
        const upvoteCount = Math.floor(participatingUsers.length * randomBetween(0.7, 1.0));
        // Randomly select upvoters from the participating users
        const upvoters = sampleArray(participatingUsers, upvoteCount);
        // Downvoters are the remaining participants
        const downvoters = participatingUsers.filter((id) => !upvoters.includes(id));

        // Overwrite existing votes
        doc.votes.upvotes = upvoters;
        doc.votes.downvotes = downvoters;
    }

    // Process votes for each comment (if any)
    if (Array.isArray(doc.comments)) {
        doc.comments = doc.comments.map((comment) => {
            if (comment.votes && Array.isArray(comment.votes.upvotes) && Array.isArray(comment.votes.downvotes)) {
                // For comments, participation is 40% to 80% of all users
                const participationCount = Math.floor(users.length * randomBetween(0.4, 0.8));
                const participatingUsers = sampleArray(users, participationCount).map((user) => user._id);

                // Upvote ratio remains 70% to 100% of the participating users
                const upvoteCount = Math.floor(participatingUsers.length * randomBetween(0.7, 1.0));
                const upvoters = sampleArray(participatingUsers, upvoteCount);
                const downvoters = participatingUsers.filter((id) => !upvoters.includes(id));

                // Overwrite existing votes for comment
                comment.votes.upvotes = upvoters;
                comment.votes.downvotes = downvoters;
            }
            return comment;
        });
    }
});

// Write the updated considerations data back to the file
fs.writeFileSync(
    considerationsFilePath,
    JSON.stringify(considerations, null, 2),
    "utf-8"
);

console.log("Voting data updated successfully.");