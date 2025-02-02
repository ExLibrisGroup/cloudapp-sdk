export const MAX_PORT = Math.pow(2, 16) - 1;

export const notEmpty = value => {
    if ((value||"").trim().length === 0) {
        return "Value must not be empty";
    }
    return true;
}

export const minLength = min => {
    return value => {
        if ((value||"").length < min) {
            return `Value must be at least ${min} characters long`;
        }
        return true;
    }
}

export const validateURL = value => {
    if (!/https?:\/\/.{3,}/.test(value)) {
        return `Value must be a valid URL`;
    }
    return true;
}

export const validatePort = value => {
    if (isNaN(value)) {
        return "Value must be a number";
    }
    if (!([80, 443].indexOf(value) > -1 || (value > 1024 && value < MAX_PORT))) {
        return `Valid values: 80, 443, 1025-${MAX_PORT}`;
    }
    return true;
}
