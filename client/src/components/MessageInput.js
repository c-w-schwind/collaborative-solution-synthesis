import {useEffect, useState} from "react";
import './MessageInput.css';

function MessageInput({onPostSuccess, onPostError, onInputChange}) {
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [isFormFilled, setIsFormFilled] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        onInputChange(isFormFilled);
    }, [isFormFilled, onInputChange]);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (isFormFilled) {
                event.preventDefault();
                event.returnValue = 'You have unsaved changes! Are you sure you want to leave?';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isFormFilled]);

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData(prevState => {
            const updatedFormData = { ...prevState, [name]: value };
            setIsFormFilled(Object.values(updatedFormData).some(val => val.trim() !== ''));
            return updatedFormData;
        });
        setError('');
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!formData.title.trim()) {
            setError('Title cannot be empty');
            return;
        }
        if (!formData.content.trim()) {
            setError('Message content cannot be empty');
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
            onPostError();
            const errorCode = error.message.match(/\d+/) ? error.message.match(/\d+/)[0] : null;

            if (errorCode === '401') {
                setError('Unauthorized: Your session might have expired. Please log in again.');
            } else if (errorCode === '500') {
                setError('Server Error: There was a problem on our end. Please try again later.');
            } else {
                setError('Error: There was a problem submitting your post. Please check your internet connection and try again.');
            }
            console.error('There was a problem with the fetch operation:', error.message);
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