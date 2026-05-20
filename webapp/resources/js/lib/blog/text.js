export function safeText(value) {
    if (typeof value === "symbol") {
        return value.description || "";
    }

    if (value == null) {
        return "";
    }

    return String(value);
}

export function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
