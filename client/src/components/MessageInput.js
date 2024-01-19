import { useState } from "react";
import './MessageInput.css';

function MessageInput() {
    const [formData, setFormData] = useState({ postTitle: '', postMessage: '' });
    const [error, setError] = useState('');

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
        setError(''); // Clear error when user starts typing
    }

    function handleSubmit(event) {
        event.preventDefault();
        
        if (!formData.postMessage.trim()) {
            setError('Message content cannot be empty');
            return;
        }
        if (!formData.postTitle.trim()) {
            setError('Title cannot be empty');
            return;
        }

        // Process form data
        console.log("This is the title: " + formData.postTitle + "\nThis is the message: " + formData.postMessage);

        //only reset if successfully written into database? what is the way to check this?
        setFormData({ postTitle: '', postMessage: '' });    //reset
    }

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <textarea
                name="postTitle"
                value={formData.postTitle}
                onChange={handleChange}
                className="title-area"
                placeholder="Title"
            />
            <textarea
                name="postMessage"
                value={formData.postMessage}
                onChange={handleChange}
                className="text-area"
                placeholder="Write your message here..."
            />
            {error && <div className="form-error">{error}</div>}
            <button type="submit">Send</button>
        </form>
    );
}

export default MessageInput;