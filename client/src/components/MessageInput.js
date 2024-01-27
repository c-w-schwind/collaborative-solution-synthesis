import { useState } from "react";
import './MessageInput.css';
import {useToasts} from "../context/ToastContext";

function MessageInput({onPostSuccess}) {
    const {addToast} = useToasts();
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [error, setError] = useState('');

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
        setError('');
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!formData.content.trim()) {
            setError('Message content cannot be empty');
            return;
        }
        if (!formData.title.trim()) {
            setError('Title cannot be empty');
            return;
        }

        try {
            const response = await fetch('http://localhost:5555/discussionSpace', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`Failed to submit post: ${response.status}`);
            }

            const data = await response.json();
            onPostSuccess();
            setFormData({title: '', content: ''});
            console.log('Post created:', data);
        } catch (error) {
            const errorCode = error.message.match(/\d+/) ? error.message.match(/\d+/)[0] : null;

            if (errorCode === '401') {
                setError('Unauthorized: Your session might have expired. Please log in again.');
            } else if (errorCode === '500') {
                setError('Server Error: There was a problem on our end. Please try again later.');
            } else {
                setError('Error: There was a problem submitting your post. Please check your internet connection and try again.');
            }
            console.error('There was a problem with the fetch operation:', error.message);
            addToast("Warning: To prevent losing your message, please copy and save it before refreshing or retrying.", 20000);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <textarea
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="title-area"
                placeholder="Title"
            />
            <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="text-area"
                placeholder="Write your message here..."
            />
            <div className="action-area">
                {error && <div className="form-error">{error}</div>}
                <button type="submit">Send</button>
            </div>
        </form>
    );
}

export default MessageInput;