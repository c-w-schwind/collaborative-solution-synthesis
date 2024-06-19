export const formConfigurations = {
    discussionSpaceForm: [
        {name: 'title', label: 'Title', type: 'text', validation: {required: true}, height: "40px"},
        {name: 'content', label: 'Message', type: 'textarea', validation: {required: true}, height: "100px"},
    ],
    considerationForm: [
        {name: 'stance', label: 'Stance', type: 'select', options: ['Pro', 'Con', 'Neutral'], validation: {required: true}},
        {name: 'title', label: 'Title', type: 'text', validation: {required: true}, height: "40px"},
        {name: 'description', label: 'Description', type: 'textarea', validation: {required: true}, height: "100px"},
    ],
    commentForm: [
        //height 84px: current minimum possible height of a "comment card"
        {name: 'text', label: 'Comment', type: 'textarea', validation: {required: true}, height: "84px"},
    ],
    registrationForm: [
        {name: 'username', type: 'text', label: 'Username', validation: {required: true}},
        {name: 'email', type: 'email', label: 'Email', validation: {required: true}},
        {name: 'password', type: 'password', label: 'Password', validation: {required: true}},
    ],
};