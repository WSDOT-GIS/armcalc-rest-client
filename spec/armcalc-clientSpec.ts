import ArmCalculator from "../armcalc-client";

// Install nock when not using a browser.
let nock;
if (typeof window === "undefined") {
    nock = require("nock");
}

// When comparing dates, tests to see if the objects represent the same date,
// instead of testing to see if they're the same instance of a Date object.
let dateCompareEquality: jasmine.CustomEqualityTester = function (first, second) {
    if (first instanceof Date && second instanceof Date) {
        return first.getTime() === second.getTime();
    }
};

describe("ArmCalculator", () => {

    let ac = new ArmCalculator();

    let theDate = new Date(Date.UTC(2014, 7, 19));

    it("should be able to calculate SRMP => ARM", done => {
        if (nock) {
            nock(ac.url).get(/.+/).reply(200, {"ABindicator": "", "ARM": 150.06, "CalculationReturnCode": 0, "CalculationReturnMessage": "", "RRQ": "", "RRT": "", "RealignmentYYYYMMDD": "19861204", "ReferenceYYYYMMDD": "20140819", "ResponseYYYYMMDD": "20140819", "SRMP": 150, "StateRoute": "005"});
        }
        let promise = ac.calcArm({
            SR: "005",
            SRMP: 150,
            ReferenceDate: theDate,
            ResponseDate: theDate
        });
        promise.then(acOut => {
            expect(typeof acOut).toEqual("object");
            expect(acOut.CalculationReturnCode).toEqual(0);
            done();
        });
        promise.catch(error => {
            done.fail(error);
        });
    });

    it("should be able to calculate ARM => SRMP", done => {
        if (nock) {
            nock(ac.url).get(/.+/).reply(200, {"ABindicator": "", "ARM": 150, "CalculationReturnCode": 0, "CalculationReturnMessage": "", "RRQ": "", "RRT": "", "RealignmentYYYYMMDD": "19861204", "ReferenceYYYYMMDD": "20140719", "ResponseYYYYMMDD": "20140719", "SRMP": 149.94, "StateRoute": "005"});
        }
        let promise = ac.calcSrmp({
            SR: "005",
            ARM: 150,
            ReferenceDate: theDate,
            ResponseDate: theDate
        });
        promise.then(acOut => {
            expect(typeof acOut).toEqual("object");
            expect(acOut.CalculationReturnCode).toEqual(0);
            done();
        });
        promise.catch(error => {
            done.fail(error);
        });
    });

    it("should be able to perform batch calculations", done => {
        let batchInput = [
            {
                CalcType: 1,
                SR: "005",
                RRT: "",
                RRQ: "",
                ABIndicator: null,
                ReferenceDate: theDate,
                ARM: 0.32,
                SRMP: 0.0,
                ResponseDate: theDate
            },
            {
                CalcType: 0,
                SR: "005",
                RRT: "",
                RRQ: "",
                ABIndicator: null,
                ReferenceDate: theDate,
                ARM: 0.0,
                SRMP: 150.0,
                ResponseDate: theDate
            }
        ];
        if (nock) {
            nock(ac.url).post(/.+/).reply(200, [{"ABIndicator": "", "ARM": 0.32, "CalcType": 1, "RRQ": "", "RRT": "", "ReferenceDate": "\/Date(1408431600000-0700)\/", "ResponseDate": "\/Date(1408431600000-0700)\/", "SR": "005", "SRMP": 0.32, "TransId": null, "CalculationReturnCode": 0, "CalculationReturnMessage": "", "RealignmentDate": "\/Date(534067200000-0800)\/"}, {"ABIndicator": "", "ARM": 150.06, "CalcType": 0, "RRQ": "", "RRT": "", "ReferenceDate": "\/Date(1408431600000-0700)\/", "ResponseDate": "\/Date(1408431600000-0700)\/", "SR": "005", "SRMP": 150, "TransId": null, "CalculationReturnCode": 0, "CalculationReturnMessage": "", "RealignmentDate": "\/Date(534067200000-0800)\/"}]);
        }
        let promise = ac.calcBatch(batchInput);
        promise.then(acOuts => {
            expect(Array.isArray(acOuts)).toBe(true);
            expect(acOuts.length).toEqual(batchInput.length);
            acOuts.forEach((acOut, i) => {
                expect(acOut.CalculationReturnCode).toEqual(0);
                let acIn = batchInput[i];
                // Names of properties that should be equal in both input and output.
                let propNames = ["CalcType", "SR", "RRT", "RRQ", "ReferenceDate", /*"ARM", "SRMP", "ABIndicator",*/ "ResponseDate"];
                for (let propName of propNames) {
                    let inVal = acIn[propName];
                    let outVal = acOut[propName];
                    if (/Date$/.test(propName)) {
                        // Test to see that input and output dates are near each other.
                        // We only care about the YYYY-MM-DD portion, not the time.
                        expect((inVal as Date).getDate()).toBeCloseTo((outVal as Date).getDate());
                    } else {
                        expect(inVal).toEqual(outVal);
                    }
                }
            });
            done();
        });
        promise.catch(error => {
            done.fail(error);
        });
    });
});