import {useEffect, useState} from "react";
import ExplanationCard from "../Cards/ExplanationCard";
import challengeSeedContent from "./challengeSeedContent";

// This component displays the challenge section. It has not been built yet.
// If the database has been seeded, it shows a static challenge content example.
// Otherwise, it displays an informational message about the missing section.
const ChallengePage = () => {
    const [isSeeded, setIsSeeded] = useState(false);

    const sectionInfo = `<div class="disclaimer-box">
            <h2>This Section Has Not Been Built Yet</h2>
            <p>The challenge framework has not yet been implemented on the platform. However, if you would like to see a <strong>preview of how it might look</strong>, you can seed the database with example data.</p>
            <p>For instructions on how to do this, please refer to the <strong>README</strong> file.</p>
        </div>`;

    useEffect(() => {
        // Fetch the seeding status from the backend
        fetch("http://localhost:5555/settings/seed-status")
            .then((res) => res.json())
            .then((data) => setIsSeeded(data.seedCompleted))
            .catch((err) => console.error("Error fetching seed status:", err));
    }, []);

    return (
        <div className="solution-list-page">
            <ExplanationCard content={isSeeded ? challengeSeedContent : sectionInfo}/>
        </div>
    );
};

export default ChallengePage;
