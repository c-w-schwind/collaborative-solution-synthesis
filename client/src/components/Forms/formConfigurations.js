export const formConfigurations = {
    discussionSpaceForm: [
        { name: 'title', label: 'Title', type: 'text', validation: { required: true }, height: "40px" },
        { name: 'content', label: 'Message', type: 'textarea', validation: { required: true }, height: "100px" },
    ],
    considerationForm: [
        { name: 'stance', label: 'Stance', type: 'select', options: ['Pro', 'Con', 'Neutral'], validation: { required: true } },
        { name: 'title', label: 'Title', type: 'text', validation: { required: true }, height: "40px" },
        { name: 'description', label: 'Description', type: 'textarea', validation: { required: true }, height: "100px" },
    ],
};