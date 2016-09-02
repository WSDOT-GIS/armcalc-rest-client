/**
 * Parses a WCF date string into a Date object.
 * @param {string} wcfDate - WCF date string.
 * @example
 * "\/Date(1408431600000-0700)\/"
 * @returns {Date} parsed date
 * @throws {TypeError} Thrown if input is not a string
 * @throws {Error} Thrown if string is not in correct format.
 */
export declare function parseWcfDate(wcfDate: string): Date;
/**
 * Converts a Date into a WCF string representation of a date.
 * @param {Date} date - A date object.
 */
export declare function toWcfDateString(date: Date): string;
