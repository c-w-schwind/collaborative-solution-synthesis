const API_URL = process.env.REACT_APP_API_URL;


export const fetchSolution = async (solutionNumber) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/solutions/${solutionNumber}`, {
        headers: token
            ? {"Authorization": `Bearer ${token}`, "Content-Type": "application/json"}
            : {"Content-Type": "application/json"},
    });

    if (!response.ok) {
        const error = new Error(`HTTP error! Status: ${response.status}`);
        if (response.status === 401) {
            error.message = token
                ? "This solution is private.\n\n\nYou don't have access to view it."
                : "Unauthorized access.\n\n\nPlease log in to view this solution.";
        }
        throw error;
    }

    return response.json();
};


export const deleteSolutionDraft = async (solutionNumber) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Unauthorized: No token found. Please log in.");

    const response = await fetch(`${API_URL}/solutions/${solutionNumber}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || `Failed to delete solution. Status: ${response.status}`);
        if (response.status === 404) {
            error.message = "Solution not found. It may have already been deleted.";
        } else if (response.status === 401 || response.status === 403) {
            error.message = "You are not authorized to delete this solution.";
        }
        throw error;
    }
};