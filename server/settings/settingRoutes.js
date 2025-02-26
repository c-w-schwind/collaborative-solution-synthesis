import express from "express";
import Setting from "./settingModel.js";

const settingRoutes = express.Router();


settingRoutes.get("/settings/seed-status", async (req, res) => {
    try {
        const seedStatus = await Setting.findOne({key: "seedCompleted"});
        res.json({seedCompleted: !!seedStatus?.value}); // Convert to boolean
    } catch (error) {
        console.error("Error fetching seed status:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
});

export default settingRoutes;