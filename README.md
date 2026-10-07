# **[Collaborative Solution Synthesis] (Untitled)**

## **Overview**

**Collaborative Solution Synthesis** is a platform prototype designed to facilitate **collective intelligence** in structured problem-solving. It enables communities to collaboratively **define challenges, develop solutions, and iteratively refine them**, ensuring a more structured and productive discourse than traditional discussion platforms.

Beyond problem-solving, the platform aims to **foster collective wisdom**, helping communities better understand **which issues matter most, where challenges arise, and how different perspectives align or diverge**. Through structured deliberation, users gain insight into underlying complexities, ultimately leading to **better solutions and stronger consensus**.

The system is intended for **small communities**, where structured dialogue and thoughtful contributions are prioritized over high-volume interactions.

## **Key Features**

- **Structured Challenge Definition** – Challenges are broken down into **key aspects** before solutions are proposed.
- **Solution Evolution** – Users **merge, refine, and enhance** solutions rather than posting independent ideas.
- **Consideration System** – Contributions are assessed through **pros, cons, and neutral points**, helping the community evaluate their impact.
- **Discussion Spaces** – Each challenge, solution, and element has a dedicated discussion space.
- **Proposal & Voting Mechanism** – Users can propose **new solutions, modifications, or refinements**, which undergo a **community review & voting process**.
- **Authentication & Authorization** – User access is managed with **JWT-based authentication** and role-based access control.

## **Tech Stack**

- **Frontend**: React.js, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Authentication**: JWT, bcrypt.js
- **Configuration**: dotenv

## **Project Status**

This project is a **work in progress**. While many core functionalities are implemented, additional features and refinements are still in development. The platform will undergo **live testing in a controlled small-scale environment** once it reaches a minimum viable version.

## **Installation & Setup**

### **Prerequisites**
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (recommended version: 16+)
- [MongoDB](https://www.mongodb.com/) (local instance or cloud service)

### **Clone the Repository**
```sh
git clone https://github.com/your-repo-url.git
cd your-project-folder
```

### **Backend Setup**

1. Navigate to the `server` directory:
   ```sh
   cd server
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file and configure the required variables:
   ```sh
   PORT=5000
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-secret-key
   ```
4. Start the backend server:
   ```sh
   npm run dev
   ```

### **Frontend Setup**

1. Navigate to the `client` directory:
   ```sh
   cd client
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend:
   ```sh
   npm start
   ```

The application should now be running at `http://localhost:3000` (frontend) and `http://localhost:5000` (backend).

## **Seeding the Database (Optional)**

To populate the database with the included sample data, follow these steps:

1. Ensure that MongoDB is running and that your `MONGODB_URI` is configured correctly.
2. Navigate to the `server` directory:
   ```sh
   cd server
   ```
3. Run the seed script:
   ```sh
   npm run seed
   ```

The seed script clears the existing application data and repopulates the database with the sample users, solutions, solution elements, considerations, discussion posts, and counters contained in `server/seed/data/`.

> **Warning:** Running `npm run seed` deletes and replaces the existing application data in the configured database. Do not run it against a database containing data you want to preserve.

To modify the sample dataset, edit the corresponding JSON files in `server/seed/data/` before running the seed command again.

### **Demo Account**

The seed data includes a demo account that is connected to several pre-populated private drafts and review-stage proposals.

Use the following credentials after seeding the database:

```text
Email: user@platform.com
Password: password
```

Using this account is recommended when exploring the project, as it provides access to functionality and example content that is not visible to anonymous users or newly registered accounts, including:

- Private solution drafts
- Private solution element drafts
- Change proposals
- Proposals in the review phase
- Pre-populated examples explaining the draft and review workflows

You can also register a new account through the application. A newly registered user can create and interact with their own content, but will not have access to the private example drafts associated with the seeded demo account.

> **Note:** These credentials are intended exclusively for the local seeded development/demo environment and should not be used for a production deployment.

### **Adding Synthetic Voting Data (Optional)**

By default, the seed script inserts the existing voting data contained in the seed files.

If you want to generate synthetic voting activity, navigate to the `server/seed` directory and run:

```sh
node addVotes.js
```

This script randomly assigns upvotes and downvotes to considerations and their comments and modifies the local `considerations.json` seed file.

Afterwards, run:

```sh
npm run seed
```

from the `server` directory to populate the database with the updated seed data.

> **Note:** `addVotes.js` modifies the local seed JSON file. Running `npm run seed` afterwards will use that modified data when rebuilding the database.


## **Usage**

Once the application is running, users can:
- **Sign up & log in** to access the platform.
- ~~**Create a new challenge**, defining key aspects of the problem.~~ *(Not yet implemented.)*
- **Propose solutions** and contribute to existing ones.
- **Engage in discussions** via dedicated discussion spaces.
- **Add considerations** to existing solutions, solution elements, and proposals to help assess their strengths, weaknesses, and implications.
- **Vote on considerations** to refine ideas collectively.
- **Draft proposals privately**, iterate on them, and submit them for **review**. After an initial review phase, proposals are refined collaboratively before being published for **community evaluation** and **final voting**.

## **Future Development**

The platform is still in development and not yet fully functional. The following features are necessary to reach a **minimum viable testable version**:

- **Phased proposal process** – While proposal states exist, the backend logic connecting them is still to be implemented.
- **Deletion proposals** – Allowing users to propose the removal of solutions or solution elements when they are obsolete or redundant.
- **Expanded consideration functionality** – Introducing a **more granular interaction model** for evaluating contributions beyond the current prototype version.
- **Proposal voting system** – Implementing a structured **community voting mechanism** for approving or rejecting proposals.
- **Highlighting system** – Mechanisms to clearly mark **new contributions and recent changes** within discussions and solution spaces.
- **Notification system** – Ensuring users are informed of **important updates**, such as voting phases, major content changes, or review assignments.
- **Anonymity options** – Introducing the ability for users to contribute anonymously where appropriate.
- **Potentially:** **LLM integration** to assist in structuring content and improving clarity.

## **Limitations & Acknowledgements**

This platform is a **prototype** designed to test structured problem-solving in small communities. While it enhances collective intelligence, it is **not a decision-making tool** but rather a framework for **exploring and refining ideas collaboratively**.

### **Goals**
- Enable **structured discussions** that go beyond unstructured debates.
- Foster **collective wisdom**, ensuring that users develop a deeper understanding of **community priorities, obstacles, and perspectives**.
- Integrate **diverse viewpoints** into the problem-solving process, helping participants work toward **more comprehensive and refined solutions**.
- Create a space where ideas **evolve through structured iteration**, rather than being drowned out by noise.

### **What This Platform is NOT**
- A place for **quick debates or casual discussions**.
- A system that **automatically resolves disputes**.
- A decision-making tool for **binding resolutions**.

The platform will undergo real-world testing to assess its effectiveness and be refined based on community feedback.