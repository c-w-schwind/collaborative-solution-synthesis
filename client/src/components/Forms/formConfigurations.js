export const formConfigurations = {
    solutionForm: {
        title: "Solution Proposal",
        description: "Your solution proposal will be initially submitted privately as a draft.\nThis allows you time to add solution elements and potential considerations, as well as to edit and review your proposal before sharing it with the community.",
        fields: [
            {name: 'title', label: 'Title', type: 'text', validation: {required: true}, height: "40px"},
            {name: 'overview', label: 'Overview', type: 'textarea', validation: {required: true}, height: "100px"},
            {name: 'description', label: 'Description', type: 'textarea', validation: {required: true}, height: "100px"},
        ]
    },
    draftTitleForm: {fields: [{name: 'title', type: 'text', validation: {required: true}, height: "40px"}]},
    draftOverviewForm: {fields: [{name: 'overview', type: 'textarea', validation: {required: true}, height: "200px"}]},
    draftDescriptionForm: {fields: [{name: 'description', type: 'textarea', validation: {required: true}, height: "250px"}]},
    draftChangeSummaryForm: {fields: [{name: 'changeSummary', type: 'textarea', validation: {required: true}, height: "250px"}]},
    elementForm: {
        title: "Solution Element Proposal",
        fields: [
            {name: 'elementType', label: 'Element Type', type: 'select', options: ['Primary', 'Supportive'], placeholder: "Select the type of the proposed element", validation: {required: true}},
            {name: 'title', label: 'Title', type: 'text', validation: {required: true}, height: "40px"},
            {name: 'overview', label: 'Overview', type: 'textarea', validation: {required: true}, height: "100px"},
            {name: 'description', label: 'Description', type: 'textarea', validation: {required: true}, height: "100px"},
        ]
    },
    considerationForm: {
        title: "Consideration",
        // properties, effects & consequences, etc.
        descriptions: {
            Solution: "Please note: These considerations are meant for the solution as a whole. If you have specific feedback or considerations for individual elements, please use the consideration section within each respective solution element.",
            SolutionElement: "This consideration applies specifically to the current solution element. If your consideration impacts multiple elements or the overall solution, please add it to the consideration section of the main solution proposal.",
        },
        fields: [
            {name: 'stance', label: 'Stance', type: 'select', options: ['Pro', 'Con', 'Neutral'], placeholder: "Select the stance of your consideration", validation: {required: true}},
            {name: 'title', label: 'Title', type: 'text', validation: {required: true}, height: "40px"},
            {name: 'description', label: 'Description', type: 'textarea', validation: {required: true}, height: "100px"},
        ]
    },
    commentForm: {
        fields: [
            //height 84px: current minimum possible height of a "comment card"
            {name: 'text', label: 'Comment', type: 'textarea', validation: {required: true}, height: "84px"},
        ]
    },
    discussionSpaceForm: {
        fields: [
            {name: 'title', label: 'Title', type: 'text', validation: {required: true}, height: "40px"},
            {name: 'content', label: 'Message', type: 'textarea', validation: {required: true}, height: "100px"},
        ]
    },
    registrationForm: {
        description: "Register a new account.",
        fields: [
            {name: 'username', type: 'text', label: 'Username', validation: {required: true}},
            {name: 'email', type: 'email', label: 'Email', validation: {required: true}},
            {name: 'password', type: 'password', label: 'Password', validation: {required: true}},
        ]
    },
};