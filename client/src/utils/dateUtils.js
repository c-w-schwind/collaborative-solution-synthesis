// Format MongoDB date to German format and timezone
export function formatToGermanTimezone(isoDateString) {
    if (!isoDateString) {
        console.error('Invalid or missing date string:', isoDateString);
        return 'Invalid date'; // or any fallback value you see fit
    }

    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) {
        console.error('Invalid date created from:', isoDateString);
        return 'Invalid date'; // or the original isoDateString for reference
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

    // Replace ':' with ' Uhr ' for the hour and minute separator
    return `${formattedDate} Uhr`;
}
