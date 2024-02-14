import {Consideration} from "../models/considerationModel.js";
import {validateRequiredFields} from "./utils.js";

export async function validateConsideration(consideration) {
    validateRequiredFields(consideration, ['stance', 'title', 'description'], "Consideration validation");

    if (!['pro', 'con', 'neutral'].includes(consideration.stance)) {
        throw new Error("Invalid stance. Must be 'pro', 'con', or 'neutral'.");
    }
}

export async function createConsiderations(considerationsData, author, session = null) {
    const considerations = Array.isArray(considerationsData) ? considerationsData : [considerationsData];
    try {
        const considerationsIds = [];
        for (const considerationData of considerations) {
            const consideration = new Consideration({
                ...considerationData,
                proposedBy: author
            });
            await consideration.save({ session });
            considerationsIds.push(consideration._id);
        }
        return considerationsIds;
    } catch (err) {
        console.error("Failed to create consideration(s):", err);
        throw err;
    }
}