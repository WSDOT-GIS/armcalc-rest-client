/**
 * @module armcalc-rest-client
 * Module for performing ArmCalc calculations.
 */

import { parseWcfDate, toWcfDateString } from "./wcfDateUtils";

// Fetch is built-in to (modern) browser but Node requires module import.
let fetch = typeof window !== "undefined" ? window.fetch : require("node-fetch");

const defaultUrl = "http://webapps.wsdot.loc/StateRoute/LocationReferencingMethod/Transformation/ARMCalc/ArmCalcService.svc/REST";

/**
 * Handles custom JSON parsing.
 */
function reviver(k: string, v: any) {
    if (/Date$/.test(k) && typeof v === "string") {
        return parseWcfDate(v);
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
    let defs = {
        ReferenceDate: "ref",
        ResponseDate: "resp"
    };
    for (let key in input) {
        if (key === "CalcType") {
            continue;
        }
        if (input.hasOwnProperty(key)) {
            let value = input[key];
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
    private performCalcGet(input: ArmCalcInput, type: "Srmp" | "Arm"): Promise<ArmCalcOutput> {
        let search = toSearch(input);
        let getUrl = `${this.url}/Calc${type}?${search}`;
        return fetch(getUrl).then(response => {
            return response.text();
        }).then(txt => {
            return JSON.parse(txt, reviver);
        });
    }
    /**
     * Converts a value from ARM to SRMP.
     * @param {ArmCalcInput} input - Input parameters.
     * @return {Promise.<ArmCalcOutput>}
     */
    calcSrmp(input: ArmCalcInput): Promise<ArmCalcOutput> {
        return this.performCalcGet(input, "Srmp");
    }
    /**
     * Converts a value from SRMP to ARM.
     * @param {ArmCalcInput} input - Input parameters.
     * @return {Promise.<ArmCalcOutput>}
     */
    calcArm(input: ArmCalcInput): Promise<ArmCalcOutput> {
        return this.performCalcGet(input, "Arm");
    }
    /**
     * Perform multiple HTTP requests with one web service request.
     * @param {ArmCalcInput[]} inputs - input parameters
     * @return {Promise.<ArmCalcOutput>}
     */
    calcBatch(inputs: ArmCalcInput[]): Promise<ArmCalcOutput[]> {
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
        return fetch(batchUrl, {
            method: "POST",
            headers: batchHeaders,
            body: json
        }).then(response => {
            return response.text();
        }).then(txt => {
            return JSON.parse(txt, reviver);
        });
    }
}