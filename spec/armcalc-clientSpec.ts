import ArmCalculator from "../armcalc-client";

// When comparing dates, tests to see if the objects represent the same date,
// instead of testing to see if they're the same instance of a Date object.
let dateCompareEquality: jasmine.CustomEqualityTester = function (first, second) {
    if (first instanceof Date && second instanceof Date) {
        return first.getTime() === second.getTime();
    }
};

describe("ArmCalculator", () => {

    // Register the custom date equality comparer.
    beforeEach(() => {
        jasmine.addCustomEqualityTester(dateCompareEquality);
    });


    let ac = new ArmCalculator();

    it("should be able to calculate SRMP => ARM", done => {
        let promise = ac.calcArm({
            SR: "005",
            SRMP: 150,
            ReferenceDate: new Date(2014, 7, 19),
            ResponseDate: new Date(2014, 7, 19)
        });
        promise.then(acOut => {
            expect(typeof acOut).toEqual("object");
            done();
        });
        promise.catch(error => {
            done.fail(error);
        });
    });

    it("should be able to calculate ARM => SRMP", done => {
        let promise = ac.calcSrmp({
            SR: "005",
            ARM: 150,
            ReferenceDate: new Date(2014, 7, 19),
            ResponseDate: new Date(2014, 7, 19)
        });
        promise.then(acOut => {
            expect(typeof acOut).toEqual("object");
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
                ReferenceDate: new Date(2014, 7, 19),
                ARM: 0.32,
                SRMP: 0.0,
                ResponseDate: new Date(2014, 7, 19)
            },
            {
                CalcType: 0,
                SR: "005",
                RRT: "",
                RRQ: "",
                ABIndicator: null,
                ReferenceDate: new Date(2014, 7, 19),
                ARM: 0.0,
                SRMP: 150.0,
                ResponseDate: new Date(2014, 7, 19)
            }
        ];
        let promise = ac.calcBatch(batchInput);
        promise.then(acOuts => {
            expect(Array.isArray(acOuts)).toBe(true);
            expect(acOuts.length).toEqual(batchInput.length);
            batchInput.forEach((acOut, i) => {
                let acIn = batchInput[i];
                // Names of properties that should be equal in both input and output.
                let propNames = ["CalcType", "SR", "RRT", "RRQ", "ReferenceDate", /*"ARM", "SRMP", "ABIndicator",*/ "ResponseDate"];
                for (let propName of propNames) {
                    let inVal = acIn[propName];
                    let outVal = acOut[propName];
                    expect(inVal).toEqual(outVal);
                }
            });
            done();
        });
        promise.catch(error => {
            done.fail(error);
        });
    });
});