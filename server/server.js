import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import dotenv from "dotenv"
dotenv.config({ path: "./config.env" });

const app = express();
const port = process.env.PORT || 5555;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

import userRoutes from "./user/userRoutes.js";
import discussionSpaceRoutes from "./discussionSpace/discussionSpaceRoutes.js";
import solutionRoutes from "./solution/solutionRoutes.js";

app.use(userRoutes);
app.use(discussionSpaceRoutes); //could also use app.use("/discussionSpace", discussionSpaceRoutes);
app.use(solutionRoutes);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");

        app.listen(port, () => {
            console.log(`Server is running on port: ${port}`);
        });
    })
    .catch(err => console.error("Could not connect to MongoDB", err));
