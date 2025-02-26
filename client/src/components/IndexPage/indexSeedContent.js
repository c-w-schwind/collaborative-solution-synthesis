const indexSeedContent = `
    <h1>Welcome</h1>
    <p>
        This <strong>seeded version of the platform</strong> is designed for <strong>deep, structured collaboration on solutions</strong>. 
        It enables users to collectively explore, refine, and evaluate ideas before they move forward. 
        Solutions are built from <strong>solution elements</strong>, which are further analyzed through 
        <strong>considerations</strong> (pros, cons, and neutral points) and discussed in 
        <strong>dedicated discussion spaces</strong>.
    </p>

    <p>This seeded version includes two types of content:</p>

    <h2>1. Meta Example Solutions</h2>
    <p>
        These structured examples illustrate how the platform works, using <strong>meta commentary</strong> 
        to explain its processes and structure. Their titles are written in <strong>[Braces]</strong> to 
        distinguish them from real-world solutions.
    </p>

    <h3>Available Meta Example Solutions</h3>
    <ul>
        <li>
            <strong>[Example Solution]</strong> – A comprehensive demonstration covering all possible cases:
            <ul>
                <li>Three established solution elements</li>
                <li>Proposed new elements, each in a different stage (private draft, review phase, and voting phase)</li>
                <li>Change proposals in various stages (private draft, review phase, and voting phase)</li>
            </ul>
        </li>
        <li><strong>[Example Draft Solution]</strong> <em>(red background)</em> – Demonstrates how a new solution begins as a draft, where it can be refined before submission.</li>
        <li><strong>[Example Review Solution]</strong> <em>(red background with a dashed border)</em> – Shows the review phase, where selected reviewers provide feedback before a solution moves forward.</li>
    </ul>

    <h3>Viewing & Editing Permissions</h3>
    <ul>
        <li>To see <strong>unpublished solutions</strong> (those still in <strong>draft</strong> or <strong>under review</strong>) as well as unpublished elements, you need to be logged in.</li>
        <li><strong>Once logged in, you can freely edit the drafts</strong> that have been created under the example user.</li>
        <li>Login credentials for an account with these permissions are available in the <strong>description of [Example Solution]</strong>.</li>
    </ul>

    <hr>

    <h2>2. Real-World Example Solutions (In Progress)</h2>
    <p>
        These are <strong>concrete solutions</strong> that illustrate how the platform is used for real problem-solving. 
        Each solution consists of multiple <strong>solution elements</strong>, <strong>considerations</strong>, 
        and <strong>discussion spaces</strong>.
    </p>

    <p>
        Each real-world solution is linked to a <strong>challenge</strong>—a central issue it aims to address. 
        For demonstration purposes, the <strong>challenge description has been inserted as a static placeholder</strong>, 
        as the challenge system is not yet implemented.
    </p>

    <h3>Where to Find Them</h3>
    <ul>
        <li><strong>Challenge Description</strong>: Located in the <strong>top menu under "Challenge"</strong></li>
        <li><strong>Proposed Solutions</strong>: Listed under <strong>"Solutions"</strong></li>
    </ul>

    <hr>

    <h2>Visual Indicators for Proposal States</h2>
    <p>
        Throughout the platform, different proposal states are marked using a <strong>consistent color code</strong>:
    </p>
    <ul>
        <li><strong>Drafts</strong>: Red background</li>
        <li><strong>Under Review</strong>: Red background with a dashed border</li>
        <li><strong>Public but undecided proposals</strong> (addition or change proposals): Blue background</li>
    </ul>
    <p>
        These visual markers apply <strong>globally</strong> across all solutions, solution elements, and proposals to make their current state easily recognizable.
    </p>

    <hr>

    <h2>Explore & Understand the Process</h2>
    <p>
        These examples serve as <strong>guides to understanding how solutions evolve</strong>, 
        from initial drafts through structured review phases, before reaching a final developed state. 
        By exploring them, you’ll gain insights into how collective intelligence shapes and refines ideas on this platform.
    </p>
`;

export default indexSeedContent;