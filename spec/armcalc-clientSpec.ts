import ArmCalculator from "../armcalc-client";

describe("ArmCalculator", () => {
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
                ABIndicator: "",
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
                ABIndicator: "",
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
            done();
        });
        promise.catch(error => {
            done.fail(error);
        });
    });
});