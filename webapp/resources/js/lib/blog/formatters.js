const IT_MONTHS_SHORT = [
    "gen",
    "feb",
    "mar",
    "apr",
    "mag",
    "giu",
    "lug",
    "ago",
    "set",
    "ott",
    "nov",
    "dic",
];

function parseDate(value) {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
}

function pad(value) {
    return String(value).padStart(2, "0");
}

export function formatShortDate(value) {
    const date = parseDate(value);

    if (!date) {
        return "In arrivo";
    }

    return `${pad(date.getUTCDate())} ${
        IT_MONTHS_SHORT[date.getUTCMonth()]
    } ${date.getUTCFullYear()}`;
}

export function formatPublishedAt(value) {
    const date = parseDate(value);

    if (!date) {
        return "Data n.d.";
    }

    return `${pad(date.getUTCDate())} ${
        IT_MONTHS_SHORT[date.getUTCMonth()]
    } ${date.getUTCFullYear()}`;
}

export function formatDateTime(value) {
    const date = parseDate(value);

    if (!date) {
        return "Non disponibile";
    }

    return `${pad(date.getUTCDate())} ${
        IT_MONTHS_SHORT[date.getUTCMonth()]
    } ${date.getUTCFullYear()}, ${pad(date.getUTCHours())}:${pad(
        date.getUTCMinutes(),
    )} UTC`;
}
