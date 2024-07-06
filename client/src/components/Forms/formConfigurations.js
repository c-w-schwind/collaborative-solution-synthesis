export const formConfigurations = {
    solutionForm: {
        title: "Solution Proposal",
        description: "Your solution proposal will be submitted privately first.\nThis allows you to take some time and add solution elements & potential considerations, as well as to edit & review it before publishing to the community.",
        fields: [
            {name: 'title', label: 'Title', type: 'text', validation: {required: true}, height: "40px"},
            {name: 'overview', label: 'Overview', type: 'textarea', validation: {required: true}, height: "100px"},
            {name: 'description', label: 'Description', type: 'textarea', validation: {required: true}, height: "100px"},
        ]
    },

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