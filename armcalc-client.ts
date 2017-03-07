/**
 * @module armcalc-rest-client
 * Module for performing ArmCalc calculations.
 */

import { parseWcfDate, toWcfDateString } from "./wcfDateUtils";

import { ArmCalcInput, ArmCalcOutput } from "./Messages";

// Fetch is built-in to (modern) browser but Node requires module import.
let fetch = typeof window !== "undefined" ? window.fetch : require("node-fetch");

const defaultUrl = "http://webapps.wsdot.loc/StateRoute/LocationReferencingMethod/Transformation/ARMCalc/ArmCalcService.svc/REST";

/**
 * Parses YYYYMMDD string into a date
 * @param {string} yyyymmdd - date string
 * @returns {Date} parsed date
 */
function yyyymmddToDate(yyyymmdd: string): Date {
    let re = /^(\d{4})(\d{2})(\d{2})$/;
    let match = yyyymmdd.match(re);
    if (!match) {
        throw new Error("Invalid format");
    }
    let parts = match.splice(1).map(s => {
        return parseInt(s, 10);
    });
    return new Date(parts[0], parts[1], parts[2]);
}

/**
 * Handles custom JSON parsing.
 */
function reviver(k: string, v: any) {
    if (/Date$/.test(k) && typeof v === "string") {
        return parseWcfDate(v);
    } else if (v === "") {
        return null;
    } else {
        return v;
    }
}

/**
 * Handles custom JSON serialization.
 */
function replacer(k: string, v: any) {
    if (/Date$/.test(k)) {
        v = typeof v === "string" ? new Date(v) : v;
        let wcfDate = toWcfDateString(v);
        return wcfDate;
    } else {
        return v;
    }
}

/**
 * Converts a number to string and pads with leading zero.
 */
function padNumber(n: number, len: number = 2): string {
    let s = n.toString();
    while (s.length < len) {
        s = "0" + s;
    }
    return s;
}

/**
 * Converts a date into YYYYMMDD format.
 */
function dateToSearchFormat(date: Date): string {
    return [date.getFullYear(), padNumber(date.getMonth() + 1), padNumber(date.getDate())].join("");
}

/**
 * Converts an object into an URL search query string.
 */
function toSearch(input: ArmCalcInput): string {
    let outputParts: string[] = [];
    let defs: {
        [key: string]: string;
    } = {
            ReferenceDate: "ref",
            ResponseDate: "resp"
        };
    for (let key in input) {
        if (key === "CalcType") {
            continue;
        }
        if (input.hasOwnProperty(key)) {
            let value = (input as any)[key];
            if (value === undefined || value === null || value === "") {
                continue;
            } else if (value instanceof Date) {
                value = dateToSearchFormat(value);
            }
            outputParts.push(`${encodeURIComponent(defs[key] || key.toLowerCase())}=${encodeURIComponent(value)}`);
        }
    }
    return outputParts.join("&");
}

/**
 * Class that calls web service to perform ARM <=> SRMP calculations.
 */
export default class ArmCalculator {
    /**
     * Creates a new instance of ArmCalculator class.
     * @param {string} [url] - Web service URL. You only need to provide this parameter if you are overriding the default URL.
     */
    constructor(public url: string = defaultUrl) {
    }

    /**
     * Requests a GET operation from the ArmCalc web service.
     * @param {ArmCalcInput} input - Input parameters.
     * @param {string} type - The type of output measure type: "Srmp" or "Arm".
     * @return {Promise.<ArmCalcOutput>}
     */
    private async performCalcGet(input: ArmCalcInput, type: "Srmp" | "Arm"): Promise<ArmCalcOutput> {
        let search = toSearch(input);
        let getUrl = `${this.url}/Calc${type}?${search}`;
        let response: Response = await fetch(getUrl);
        let txt = await response.text();
        let output = JSON.parse(txt, reviver);
        // convert "...YYYYMMDD" fields to "...Date" fields.

        output.CalcType = type === "Srmp" ? 1 : 0;

        let re = /^(\w+)YYYYMMDD$/;

        // Get the fields that have dates as strings.
        let dateStringFields: string[] = [];
        for (let key in output) {
            let match = key.match(re);
            if (match) {
                dateStringFields.push(key);
            }
        }

        for (let key of dateStringFields) {
            let match = key.match(re);
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

        return output;
    }
    /**
     * Converts a value from ARM to SRMP.
     * @param {ArmCalcInput} input - Input parameters.
     * @return {Promise.<ArmCalcOutput>}
     */
    async calcSrmp(input: ArmCalcInput): Promise<ArmCalcOutput> {
        return this.performCalcGet(input, "Srmp");
    }
    /**
     * Converts a value from SRMP to ARM.
     * @param {ArmCalcInput} input - Input parameters.
     * @return {Promise.<ArmCalcOutput>}
     */
    async calcArm(input: ArmCalcInput): Promise<ArmCalcOutput> {
        return this.performCalcGet(input, "Arm");
    }
    /**
     * Perform multiple HTTP requests with one web service request.
     * @param {ArmCalcInput[]} inputs - input parameters
     * @return {Promise.<ArmCalcOutput>}
     */
    async calcBatch(inputs: ArmCalcInput[]): Promise<ArmCalcOutput[]> {
        let json = JSON.stringify(inputs, replacer);
        let batchUrl = `${this.url}/CalcBatch`;
        let batchHeaders: any;
        if (typeof Headers !== "undefined") {
            // browser
            batchHeaders = new Headers();
            batchHeaders.append("Content-Type", "application/json");
        } else {
            // Node.js
            batchHeaders = {
                "Content-Type": "application/json"
            };
        }

        let response: Response = await fetch(batchUrl, {
            method: "POST",
            headers: batchHeaders,
            body: json
        });
        let txt = await response.text();
        return JSON.parse(txt, reviver);
    }
}