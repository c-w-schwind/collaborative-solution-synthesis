import GenericForm from "../Forms/GenericForm";

function PostInput({onSuccessfulSubmit, parentType, parentNumber}) {
    const discussionSpacePost = [
        {name: 'title', label: 'Title', type: 'text', validation: {required: true}, height: "40px"},
        {name: 'content', label: 'Message', type: 'textarea', validation: {required: true}, height: "100px"},
    ];

    const submitPost = async (formData) => {
        const postData = { ...formData, parentType, parentNumber };

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/discussionSpace`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                if (response.status === 401) {
                    throw new Error('Unauthorized: Your session might have expired. Please log in again.');
                } else if (response.status === 500) {
                    throw new Error('Server Error: There was a problem on our end. Please try again later.');
                } else {
                    throw new Error(errorText || `Failed to submit post: ${response.status}`);
                }
            }

            const data = await response.json();
            console.log('Post created:', data);
            onSuccessfulSubmit();
        } catch (err) {
            console.error('There was a problem with the fetch operation:', err.message);
            let errorMessage = 'Error: There was a problem submitting your post. Please check your internet connection and try again.';
            if (err.message.includes('Unauthorized')) {
                errorMessage = 'Unauthorized: Your session might have expired. Please log in again.';
            } else if (err.message.includes('Server Error')) {
                errorMessage = 'Server Error: There was a problem on our end. Please try again later.';
            } else if (err.message.includes('Failed to fetch')) {
                errorMessage = 'Network Error: There was a problem connecting to the server. Please check your internet connection and try again.';
            }
            throw new Error(errorMessage);
        }
    };

    return (
        <GenericForm onSubmit={submitPost} config={discussionSpacePost}/>
    );
}

export default PostInput;