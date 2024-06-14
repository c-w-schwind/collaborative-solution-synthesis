const formSubmissionService = async (url, formData, entityType, onSuccessfulSubmit, method = "POST") => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/${url}`, {
            method: method,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            if (response.status === 401) {
                throw new Error('Unauthorized: Your session might have expired. Please log in again.');
            } else if (response.status === 500) {
                throw new Error('Server Error: There was a problem on our end. Please try again later.');
            } else {
                throw new Error(errorText || `Failed to submit ${entityType}: ${response.status}`);
            }
        }

        const data = await response.json();
        console.log('Submit successful:', data);
        onSuccessfulSubmit(data);
    } catch (err) {
        console.error('Fetch operation failed:', err.message);
        let errorMessage = `Error: There was a problem submitting your ${entityType}. Please check your internet connection and try again.`;
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

export default formSubmissionService;