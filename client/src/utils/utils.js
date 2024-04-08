// Format MongoDB date to German format and timezone
export function formatToGermanTimezone(isoDateString) {
    if (!isoDateString) {
        console.error('Invalid or missing date string:', isoDateString);
        return 'Invalid date';
    }

    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) {
        console.error('Invalid date created from:', isoDateString);
        return 'Invalid date';
    }

    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Europe/Berlin'
    };

    const formattedDate = new Intl.DateTimeFormat('de-DE', options).format(date);

    return `${formattedDate} Uhr`;
}


export const debounce = (func, wait) => {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};