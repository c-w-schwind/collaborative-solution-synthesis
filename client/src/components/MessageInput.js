import { useState } from "react";
import './MessageInput.css';

function MessageInput({onPostSuccess}) {
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
            console.error('There was a problem with the fetch operation:', error.message);
            setError("There was a problem submitting your post. Please try again later.");
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