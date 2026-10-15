
# Collaborative Solution Synthesis

*A full-stack prototype for structured collaborative problem-solving.*

## Overview

Collaborative Solution Synthesis explores how communities can analyze complex problems, develop solution proposals, and improve ideas through structured contributions rather than unstructured discussion alone.

The underlying concept is to support **collective intelligence**: participants can examine proposed solutions and their individual elements, discuss implications, contribute arguments for and against them, and iteratively develop alternatives. The long-term vision includes community review and decision-making workflows that help ideas evolve over time.

The prototype is intended primarily for **small communities**, where thoughtful participation and the relationships between contributions matter more than high-volume activity.

> **Project status:** This is an unfinished prototype, not a production-ready platform. Several core interaction and data-management features are implemented; the complete proposal review, approval, and publication workflow is not.

## Implemented Features

- **Solutions and solution elements** — Create and edit private drafts, view existing solutions, and organize solution proposals into individual components.
- **Structured considerations** — Attach pro, con, or neutral considerations to solutions and solution elements; add comments and vote on considerations and their comments.
- **Discussion spaces** — Participate in discussions associated with solutions and solution elements, including replies and paginated posts.
- **Change proposal drafts** — Create drafts for proposed changes to existing solutions or solution elements. The complete review and acceptance process is not yet implemented.
- **Authentication and access control** — JWT-based sign-in and author-/permission-based access to private drafts and related content.
- **Context-aware interface** — React-based forms, detail views, side panels, dialogs, loading states, and notifications for interacting with interconnected content.

## Planned or Partially Implemented Features

- **Structured challenge creation** — Define new challenges and break them down into key aspects. The prototype currently contains example challenge content, but users cannot create challenges through a complete workflow.
- **Multi-stage proposal review** — Submit drafts for review, collaborate with reviewers, and transition proposals between review and publication stages. Status fields and example review-stage records exist, but the end-to-end workflow is unfinished.
- **Proposal approval and voting** — Community decisions on accepting, rejecting, or replacing solutions and elements. This is distinct from the *implemented* voting on considerations and comments.
- **Solution evolution** — Complete workflows for integrating accepted changes, tracking historical versions, and deprecating or removing outdated content.
- **Further improvements** — More granular consideration interactions, activity highlighting, notifications, and optional anonymous contributions.
- **Potential future extension** — LLM-assisted structuring or clarification of contributions.

## Tech Stack

- **Frontend:** React, React Router, JavaScript, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JSON Web Tokens (JWT), bcryptjs
- **Configuration:** Create React App environment files (frontend), dotenv (backend)

The project is organized into separate `client/` and `server/` directories. The backend provides a REST API and data models for solutions, solution elements, considerations, discussions, and users.

## Getting Started

### Prerequisites

- Node.js and npm
- A MongoDB database (local or hosted)

**MongoDB transactions:** Some backend operations use MongoDB transactions. These require a **replica set or sharded deployment**; a standalone MongoDB instance does not support them. MongoDB Atlas or a locally configured replica set can be used.

### Clone the Repository

```bash
git clone https://github.com/c-w-schwind/collaborative-solution-synthesis.git
cd collaborative-solution-synthesis
```

The repository must be public, or your GitHub account must have access to it.

### Backend Setup

From the repository root:

```bash
cd server
npm install
```

Create `config.env` in the server/ directory with your own settings:

```env
PORT=5555
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key
```

Start the backend:

```bash
npm run dev
```

The API runs on **http://localhost:5555** by default, provided the database connection succeeds. The port can be changed with `PORT`.

### Frontend Setup

Open a **second terminal** in the repository root:

```bash
cd client
npm install
```

Create `client/.env.development`:

```env
REACT_APP_API_URL=http://localhost:5555
```

Start the React development server:

```bash
npm start
```

The application is then available at **http://localhost:3000**. Keep both the frontend and backend processes running while using it.

**Environment configuration:** This project uses `react-scripts`, which automatically loads `.env.development` for `npm start` and `.env.production` for `npm run build` (subject to higher-priority local overrides). For a production build, `REACT_APP_API_URL` must point to the intended deployed API. Values beginning with `REACT_APP_` are included in the client bundle and **must not contain secrets**. Keep backend credentials and other sensitive settings out of version control.

## Demo Data

The repository includes a seed dataset with users, solutions, solution elements, considerations, discussions, and example draft/review states. Seeding is **optional**, but recommended for exploring the prototype because some features depend on existing content.

### Seed the Database

From `server/`, with the database running and `MONGODB_URI` configured:

```bash
npm run seed
```

> **Warning:** The seed script **deletes and replaces existing application data** in the configured database. Use a disposable development database and do not run it against data you want to keep.

The seed files are stored in `server/seed/data/`. Edit those files if you want to change the examples before seeding.

### Demo Account

After seeding, use the following account to explore private drafts and pre-populated example content:

```text
Email: user@platform.com
Password: password
```

The seeded examples include private solution drafts, private solution-element drafts, change proposal drafts, and records already marked as being under review. **These review-stage examples illustrate the intended workflow; they do not mean the end-to-end review process is functional.**

You can also register a new account, create your own draft content, and interact with accessible discussions and considerations. New accounts do not automatically have access to the demo user's private drafts.

> **Demo only:** The credentials above are intentionally simple and intended solely for a local, isolated test environment. Do not use them in a public deployment.

### Generate Synthetic Voting Data (Optional)

The seed files already contain voting data. To regenerate synthetic votes on considerations and their comments, run the following from `server/seed/`:

```bash
node addVotes.js
```

This script **overwrites voting data in `server/seed/data/considerations.json`**. To load the modified data into MongoDB, return to `server/` and rerun:

```bash
npm run seed
```

This resets the database again. Back up the JSON file first if you want to preserve the original sample votes.

## Using the Prototype

With the frontend, backend, and (optionally) seeded database running, you can:

- Browse existing public solutions and inspect their constituent elements.
- Register and log in to create and edit private solution and solution-element drafts.
- Create drafts proposing changes to existing published solutions or accepted elements.
- Read or contribute to discussion spaces, subject to access permissions.
- Add pro, con, and neutral considerations; comment on them; and vote on considerations or comments.
- Explore different content views, comparison interfaces, contextual dialogs, and navigation between related objects.

**Not yet functional end to end:** Creating new challenges; submitting drafts through a real review phase; publishing or approving proposals through community voting; and automatically integrating accepted changes into a new published version.

## Scope and Limitations

This project was developed as a **technical and interaction-design prototype** for exploring structured collaborative reasoning. It is not a finished deliberation platform, a binding decision-making system, or a tool that automatically resolves disputes.

The broader goals are to make complex proposals easier to examine, allow different perspectives to remain visible, and help communities refine ideas through deliberate iteration. A controlled small-scale user test is an intended future step, not a completed validation study.

The implementation remains incomplete and has not been established as production-ready. Additional development, testing, and operational hardening would be needed before a public deployment.
