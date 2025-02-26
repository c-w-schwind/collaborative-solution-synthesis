import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import {dirname} from "path";
import {fileURLToPath} from "url";
import {User} from "../user/userModel.js";
import {Solution} from "../solution/solutionModel.js";
import {SolutionElement} from "../solutionElement/solutionElementModel.js";
import {Consideration} from "../consideration/considerationModel.js";
import {DiscussionSpacePost} from "../discussionSpace/discussionSpacePostModel.js";
import Counter from "../counters/counterModel.js";
import Setting from "../settings/settingModel.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../config.env") });

// Load JSON files
const users = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../seed/data/users.json"), "utf-8"));
const solutions = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../seed/data/solutions.json"), "utf-8"));
const solutionElements = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../seed/data/solutionElements.json"), "utf-8"));
const considerations = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../seed/data/considerations.json"), "utf-8"));
const discussionSpacePosts = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../seed/data/discussionSpacePosts.json"), "utf-8"));
const counters = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../seed/data/counters.json"), "utf-8"));


const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB Connected...");

        // Clear existing data
        await User.deleteMany();
        await Solution.deleteMany();
        await SolutionElement.deleteMany();
        await Consideration.deleteMany();
        await DiscussionSpacePost.deleteMany();
        await Counter.deleteMany();
        await Setting.deleteMany();

        // Insert seed data
        await User.insertMany(users);
        await Solution.insertMany(solutions);
        await SolutionElement.insertMany(solutionElements);
        await Consideration.insertMany(considerations);
        await DiscussionSpacePost.insertMany(discussionSpacePosts);
        await Counter.insertMany(counters);

        // Store "seedCompleted" flag in the database
        await Setting.updateOne({key: "seedCompleted"}, {value: true}, {upsert: true});

        console.log("Database seeded successfully!");
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seedDatabase();