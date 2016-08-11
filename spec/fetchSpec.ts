// Set appropriate fetch function for environment.
// Old browsers must use polyfill.

if (typeof window === "undefined") {
    fetch = require("node-fetch");
}

describe("ArmCalc test", () => {
    let rootUrl = "http://webappsqa.wsdot.loc/StateRoute/LocationReferencingMethod/Transformation/ARMCalc/ArmCalcService.svc/REST";
    let calcSrmpUrl = `${rootUrl}/CalcSrmp?sr=005&arm=150&ref=20140819&resp=20140819`;
    let calcArmUrl = `${rootUrl}/CalcArm?sr=005&srmp=150&ref=20140819&resp=20140819`;
    let batchUrl = `${rootUrl}/CalcBatch`;

    it("should be able to calculate SRMP", done => {
        let calcSrmpPromise = fetch(calcSrmpUrl).then((result) => {
            return result.json();
        });
        calcSrmpPromise.then(result => {
            expect(typeof result === "object").toBe(true);
            done();
        });
    });
    it("should be able to calculate ARM", done => {
        let calcArmPromise = fetch(calcArmUrl).then((result) => {
            return result.json();
        });
        calcArmPromise.then(result => {
            expect(typeof result === "object").toBe(true);
            done();
        });
    });
    it("should be able to calculate batch", done => {
        let batchInput = [
            {
                "CalcType": 1,
                "SR": "005",
                "RRT": "",
                "RRQ": "",
                "ABIndicator": "",
                "ReferenceDate": "\/Date(1408431600000-0700)\/",
                "ARM": 0.32,
                "SRMP": 0.0,
                "ResponseDate": "\/Date(1408431600000-0700)\/"
            },
            {
                "CalcType": 0,
                "SR": "005",
                "RRT": "",
                "RRQ": "",
                "ABIndicator": "",
                "ReferenceDate": "\/Date(1408431600000-0700)\/",
                "ARM": 0.0,
                "SRMP": 150.0,
                "ResponseDate": "\/Date(1408431600000-0700)\/"
            }
        ];

        let batchHeaders: any;
        if (typeof Headers !== "undefined") {
            batchHeaders = new Headers();
            batchHeaders.append("Content-Type", "application/json");
        } else {
            batchHeaders = {
                "Content-Type": "application/json"
            };
        }

        let calcBatchPromise = fetch(batchUrl, {
            method: "POST",
            headers: batchHeaders,
            body: JSON.stringify(batchInput)
        }).then(response => {
            return response.json();
        });

        calcBatchPromise.then(result => {
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toEqual(2);
            done();
        });
    });
});