/**
 * @module armcalc-rest-client
 * Module for performing ArmCalc calculations.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./wcfDateUtils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var wcfDateUtils_1 = require("./wcfDateUtils");
    // Fetch is built-in to (modern) browser but Node requires module import.
    // tslint:disable-next-line:no-var-requires
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
        var parts = match.splice(1).map(function (s) { return parseInt(s, 10); });
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
        /**
         * Converts a value from ARM to SRMP.
         * @param {ArmCalcInput} input - Input parameters.
         * @return {Promise.<ArmCalcOutput>}
         */
        ArmCalculator.prototype.calcSrmp = function (input) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.performCalcGet(input, "Srmp")];
                });
            });
        };
        /**
         * Converts a value from SRMP to ARM.
         * @param {ArmCalcInput} input - Input parameters.
         * @return {Promise.<ArmCalcOutput>}
         */
        ArmCalculator.prototype.calcArm = function (input) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.performCalcGet(input, "Arm")];
                });
            });
        };
        /**
         * Perform multiple HTTP requests with one web service request.
         * @param {ArmCalcInput[]} inputs - input parameters
         * @return {Promise.<ArmCalcOutput>}
         */
        ArmCalculator.prototype.calcBatch = function (inputs) {
            return __awaiter(this, void 0, void 0, function () {
                var json, batchUrl, batchHeaders, response, txt;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            json = JSON.stringify(inputs, replacer);
                            batchUrl = this.url + "/CalcBatch";
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
                            return [4 /*yield*/, fetch(batchUrl, {
                                    method: "POST",
                                    // tslint:disable-next-line:object-literal-sort-keys
                                    headers: batchHeaders,
                                    body: json
                                })];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.text()];
                        case 2:
                            txt = _a.sent();
                            return [2 /*return*/, JSON.parse(txt, reviver)];
                    }
                });
            });
        };
        ArmCalculator.prototype.performCalcGet = function (input, type) {
            return __awaiter(this, void 0, void 0, function () {
                var search, getUrl, response, txt, output, re, dateStringFields, key, match, _i, dateStringFields_1, key, match;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            search = toSearch(input);
                            getUrl = this.url + "/Calc" + type + "?" + search;
                            return [4 /*yield*/, fetch(getUrl)];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.text()];
                        case 2:
                            txt = _a.sent();
                            output = JSON.parse(txt, reviver);
                            // convert "...YYYYMMDD" fields to "...Date" fields.
                            output.CalcType = type === "Srmp" ? 1 : 0;
                            re = /^(\w+)YYYYMMDD$/;
                            dateStringFields = [];
                            for (key in output) {
                                if (key in output) {
                                    match = key.match(re);
                                    if (match) {
                                        dateStringFields.push(key);
                                    }
                                }
                            }
                            for (_i = 0, dateStringFields_1 = dateStringFields; _i < dateStringFields_1.length; _i++) {
                                key = dateStringFields_1[_i];
                                match = key.match(re);
                                if (match) {
                                    output[match[1] + "Date"] = yyyymmddToDate(output[key]);
                                    delete output[key];
                                }
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
                            return [2 /*return*/, output];
                    }
                });
            });
        };
        return ArmCalculator;
    }());
    exports.default = ArmCalculator;
});
