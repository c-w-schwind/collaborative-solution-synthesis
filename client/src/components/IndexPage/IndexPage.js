import "./IndexPage.css";
import {useEffect, useState} from "react";
import {HOMEPAGE_PICTURE} from "../../constants";
import indexSeedContent from "./indexSeedContent";
import ExplanationCard from "../Cards/ExplanationCard";

const IndexPage = () => {
    const [isSeeded, setIsSeeded] = useState(false);

    const indexUnseededContent = `
        <div class="disclaimer-box">
            <h2>Platform Not Seeded</h2>
            <p>This platform has not yet been initialized with data.</p>
            <p>If you would like to see a <strong>preview of how it works</strong>, you can seed the database with example data.</p>
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
        <div className="index-page">
            <img src={HOMEPAGE_PICTURE} alt="Your Logo"/>
            <h1 className="index-title">[Untitled Collaborative Solution Synthesis Platform]</h1>
            <ExplanationCard content={isSeeded ? indexSeedContent : indexUnseededContent}/>
        </div>
    );
};

export default IndexPage;