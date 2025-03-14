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


export const getScrollbarWidth = () => {
    return window.innerWidth - document.documentElement.clientWidth;
};


// Manage scroll locking by tracking active locks to prevent re-enabling scroll prematurely
let scrollLockCount = 0;

export const lockBodyScroll = () => {
    if (scrollLockCount === 0) {
        document.body.classList.add('body-scroll-lock');
        document.body.setAttribute('aria-hidden', 'true');
    }
    scrollLockCount += 1;
};

export const unlockBodyScroll = () => {
    scrollLockCount = Math.max(scrollLockCount - 1, 0);
    if (scrollLockCount === 0) {
        document.body.classList.remove('body-scroll-lock');
        document.body.removeAttribute('aria-hidden');
    }
};