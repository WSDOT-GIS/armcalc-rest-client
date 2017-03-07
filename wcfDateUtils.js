(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Parses a WCF date string into a Date object.
     * @param {string} wcfDate - WCF date string.
     * @example
     * "\/Date(1408431600000-0700)\/"
     * @returns {Date} parsed date
     * @throws {TypeError} Thrown if input is not a string
     * @throws {Error} Thrown if string is not in correct format.
     */
    function parseWcfDate(wcfDate) {
        // Ensure a string was provided as input.
        if (typeof wcfDate !== "string") {
            throw new TypeError("Invalid input type");
        }
        // Regexp matches WCF date format. [full match, date as int, offset or undefined]
        var re = /\/Date\((\d+)(-\d+)?\)\//;
        var match = wcfDate.match(re);
        if (!match) {
            throw new Error("Invalid format.");
        }
        var _a = match.slice(1).map(function (s) {
            return s ? parseInt(s, 10) : 0;
        }), main = _a[0], offset = _a[1];
        var time = main + offset;
        return new Date(time);
    }
    exports.parseWcfDate = parseWcfDate;
    /**
     * Converts a Date into a WCF string representation of a date.
     * @param {Date} date - A date object.
     */
    function toWcfDateString(date) {
        if (!(date && date instanceof Date)) {
            throw new TypeError("Input is not date: " + date + " (" + typeof date + ")");
        }
        return "/Date(" + date.getTime() + ")/";
    }
    exports.toWcfDateString = toWcfDateString;
});
