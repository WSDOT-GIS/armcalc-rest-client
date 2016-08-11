/**
 * Parses a WCF date string into a Date object.
 * @param {string} wcfDate - WCF date string.
 * @example
 * "\/Date(1408431600000-0700)\/"
 * @returns {Date} parsed date
 * @throws {TypeError} Thrown if input is not a string
 * @throws {Error} Thrown if string is not in correct format.
 */
export function parseWcfDate(wcfDate: string): Date {
    // Ensure a string was provided as input.
    if (typeof wcfDate !== "string") {
        throw new TypeError("Invalid input type");
    }
    // Regexp matches WCF date format. [full match, date as int, offset or undefined]
    let re = /\/Date\((\d+)(-\d+)?\)\//;
    let match = wcfDate.match(re);
    if (!match) {
        throw new Error("Invalid format.");
    }

    let [main, offset] = match.slice(1).map(s => {
        return s ? parseInt(s, 10) : 0;
    });
    let time = main + offset;

    return new Date(time);
}

/**
 * Converts a Date into a WCF string representation of a date.
 * @param {Date} date - A date object.
 */
export function toWcfDateString(date: Date) {
    if (!(date && date instanceof Date)) {
        throw new TypeError(`Input is not date: ${date} (${typeof date})`);
    }
    return `/Date(${date.getTime()})/`;
}