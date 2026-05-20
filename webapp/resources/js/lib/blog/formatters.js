export function formatShortDate(value) {
    if (!value) {
        return "In arrivo";
    }

    return new Date(value).toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export function formatPublishedAt(value) {
    if (!value) {
        return "Data n.d.";
    }

    return new Intl.DateTimeFormat("it-IT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
}

export function formatDateTime(value) {
    if (!value) {
        return "Non disponibile";
    }

    return new Intl.DateTimeFormat("it-IT", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}
