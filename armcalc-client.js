/**
 * @module armcalc-rest-client
 * Module for performing ArmCalc calculations.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "./wcfDateUtils"], factory);
    }
})(function (require, exports) {
    "use strict";
    var wcfDateUtils_1 = require("./wcfDateUtils");
    // Fetch is built-in to (modern) browser but Node requires module import.
    var fetch = typeof window !== "undefined" ? window.fetch : require("node-fetch");
    var defaultUrl = "http://webapps.wsdot.loc/StateRoute/LocationReferencingMethod/Transformation/ARMCalc/ArmCalcService.svc/REST";
    /**
     * Parses YYYYMMDD string into a date
     * @param {string} yyyymmdd - date string
     * @returns {Date} parsed date
     */
    function yyyymmddToDate(yyyymmdd) {
        var re = /^(\d{4})(\d{2})(\d{2})$/;
        var match = yyyymmdd.match(re);
        if (!match) {
            throw new Error("Invalid format");
        }
        var parts = match.splice(1).map(function (s) {
            return parseInt(s, 10);
        });
        return new Date(parts[0], parts[1], parts[2]);
    }
    /**
     * Handles custom JSON parsing.
     */
    function reviver(k, v) {
        if (/Date$/.test(k) && typeof v === "string") {
            return wcfDateUtils_1.parseWcfDate(v);
        }
        else if (v === "") {
            return null;
        }
        else {
            return v;
        }
    }
    /**
     * Handles custom JSON serialization.
     */
    function replacer(k, v) {
        if (/Date$/.test(k)) {
            v = typeof v === "string" ? new Date(v) : v;
            var wcfDate = wcfDateUtils_1.toWcfDateString(v);
            return wcfDate;
        }
        else {
            return v;
        }
    }
    /**
     * Converts a number to string and pads with leading zero.
     */
    function padNumber(n, len) {
        if (len === void 0) { len = 2; }
        var s = n.toString();
        while (s.length < len) {
            s = "0" + s;
        }
        return s;
    }
    /**
     * Converts a date into YYYYMMDD format.
     */
    function dateToSearchFormat(date) {
        return [date.getFullYear(), padNumber(date.getMonth() + 1), padNumber(date.getDate())].join("");
    }
    /**
     * Converts an object into an URL search query string.
     */
    function toSearch(input) {
        var outputParts = [];
        var defs = {
            ReferenceDate: "ref",
            ResponseDate: "resp"
        };
        for (var key in input) {
            if (key === "CalcType") {
                continue;
            }
            if (input.hasOwnProperty(key)) {
                var value = input[key];
                if (value === undefined || value === null || value === "") {
                    continue;
                }
                else if (value instanceof Date) {
                    value = dateToSearchFormat(value);
                }
                outputParts.push(encodeURIComponent(defs[key] || key.toLowerCase()) + "=" + encodeURIComponent(value));
            }
        }
        return outputParts.join("&");
    }
    /**
     * Class that calls web service to perform ARM <=> SRMP calculations.
     */
    var ArmCalculator = (function () {
        /**
         * Creates a new instance of ArmCalculator class.
         * @param {string} [url] - Web service URL. You only need to provide this parameter if you are overriding the default URL.
         */
        function ArmCalculator(url) {
            if (url === void 0) { url = defaultUrl; }
            this.url = url;
        }
        /**
         * Requests a GET operation from the ArmCalc web service.
         * @param {ArmCalcInput} input - Input parameters.
         * @param {string} type - The type of output measure type: "Srmp" or "Arm".
         * @return {Promise.<ArmCalcOutput>}
         */
        ArmCalculator.prototype.performCalcGet = function (input, type) {
            var search = toSearch(input);
            var getUrl = this.url + "/Calc" + type + "?" + search;
            return fetch(getUrl).then(function (response) {
                return response.text();
            }).then(function (txt) {
                var output = JSON.parse(txt, reviver);
                // convert "...YYYYMMDD" fields to "...Date" fields.
                output.CalcType = type === "Srmp" ? 1 : 0;
                var re = /^(\w+)YYYYMMDD$/;
                // Get the fields that have dates as strings.
                var dateStringFields = [];
                for (var key in output) {
                    var match = key.match(re);
                    if (match) {
                        dateStringFields.push(key);
                    }
                }
                for (var _i = 0, dateStringFields_1 = dateStringFields; _i < dateStringFields_1.length; _i++) {
                    var key = dateStringFields_1[_i];
                    var match = key.match(re);
                    output[match[1] + "Date"] = yyyymmddToDate(output[key]);
                    delete output[key];
                }
                // Fix casing on "ABindicator" property name.
                if (output.hasOwnProperty("ABindicator")) {
                    output.ABIndicator = output.ABindicator;
                    delete output.ABindicator;
                }
                if (output.StateRoute) {
                    output.SR = output.StateRoute;
                    delete output.StateRoute;
                }
                return output;
            });
        };
        /**
         * Converts a value from ARM to SRMP.
         * @param {ArmCalcInput} input - Input parameters.
         * @return {Promise.<ArmCalcOutput>}
         */
        ArmCalculator.prototype.calcSrmp = function (input) {
            return this.performCalcGet(input, "Srmp");
        };
        /**
         * Converts a value from SRMP to ARM.
         * @param {ArmCalcInput} input - Input parameters.
         * @return {Promise.<ArmCalcOutput>}
         */
        ArmCalculator.prototype.calcArm = function (input) {
            return this.performCalcGet(input, "Arm");
        };
        /**
         * Perform multiple HTTP requests with one web service request.
         * @param {ArmCalcInput[]} inputs - input parameters
         * @return {Promise.<ArmCalcOutput>}
         */
        ArmCalculator.prototype.calcBatch = function (inputs) {
            var json = JSON.stringify(inputs, replacer);
            var batchUrl = this.url + "/CalcBatch";
            var batchHeaders;
            if (typeof Headers !== "undefined") {
                // browser
                batchHeaders = new Headers();
                batchHeaders.append("Content-Type", "application/json");
            }
            else {
                // Node.js
                batchHeaders = {
                    "Content-Type": "application/json"
                };
            }
            return fetch(batchUrl, {
                method: "POST",
                headers: batchHeaders,
                body: json
            }).then(function (response) {
                return response.text();
            }).then(function (txt) {
                return JSON.parse(txt, reviver);
            });
        };
        return ArmCalculator;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ArmCalculator;
});
