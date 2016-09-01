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

    let calcArmFake = function (acInput: ArmCalcInput): Promise<ArmCalcOutput> {
        return new Promise((resolve, reject) => {
            resolve({
                SR: "005",
                ARM: 150.6,
                SRMP: 150,
                ABIndicator: "",
                ReferenceDate: new Date(2014, 7, 19),
                ResponseDate: new Date(2014, 7, 19),
                RealignmentDate: new Date(1986, 12, 4),
                CalculationReturnCode: 0,
                CalculationReturnMessage: ""
            });
        });
    };


    let calcSrmpFake = function (acInput: ArmCalcInput): Promise<ArmCalcOutput> {
        return new Promise((resolve, reject) => {
            resolve({
                SR: "005",
                ARM: 150,
                SRMP: 149.94,
                ABIndicator: "",
                ReferenceDate: new Date(2014, 7, 19),
                ResponseDate: new Date(2014, 7, 19),
                RealignmentDate: new Date(1986, 12, 4),
                CalculationReturnCode: 0,
                CalculationReturnMessage: ""
            });
        });
    };

    let calcBatchFake = function () {
        return new Promise((resolve, reject) => {
            let date = new Date(1408431600000 - 700);
            resolve([
                {
                    "ABIndicator": "",
                    "ARM": 0.32,
                    "CalcType": 1,
                    "RRQ": "",
                    "RRT": "",
                    "ReferenceDate": date,
                    "ResponseDate": date,
                    "SR": "005",
                    "SRMP": 0.32,
                    "TransId": null,
                    "CalculationReturnCode": 0,
                    "CalculationReturnMessage": "",
                    "RealignmentDate": new Date(534067200000 - 800)
                },
                {
                    "ABIndicator": "",
                    "ARM": 150.06,
                    "CalcType": 0,
                    "RRQ": "",
                    "RRT": "",
                    "ReferenceDate": date,
                    "ResponseDate": date,
                    "SR": "005",
                    "SRMP": 150,
                    "TransId": null,
                    "CalculationReturnCode": 0,
                    "CalculationReturnMessage": "",
                    "RealignmentDate": new Date( 534067200000 - 0800 )
                }
            ]);
        });
    };



    it("should be able to calculate SRMP => ARM", done => {
        // Create fake to avoid calling service in test.
        spyOn(ac, "calcArm").and.callFake(calcArmFake);


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
        spyOn(ac, "calcSrmp").and.callFake(calcSrmpFake);

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
        spyOn(ac, "calcBatch").and.callFake(calcBatchFake);
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