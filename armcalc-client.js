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
     * Handles custom JSON parsing.
     */
    function reviver(k, v) {
        if (/Date$/.test(k) && typeof v === "string") {
            return wcfDateUtils_1.parseWcfDate(v);
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
     * Converts a date into YYYYMMDD format.
     */
    function dateToSearchFormat(date) {
        var dateFmt = new Intl.NumberFormat("en-us", {
            minimumIntegerDigits: 2,
        });
        return [date.getFullYear(), date.getMonth() + 1, date.getDate()].map(function (n) {
            return dateFmt.format(n);
        }).join("");
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
                outputParts.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
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
                return JSON.parse(txt, reviver);
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
