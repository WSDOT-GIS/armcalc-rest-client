import { ArmCalcInput, ArmCalcOutput } from "./Messages";
/**
 * Class that calls web service to perform ARM <=> SRMP calculations.
 */
export default class ArmCalculator {
    url: string;
    /**
     * Creates a new instance of ArmCalculator class.
     * @param {string} [url] - Web service URL. You only need to provide this parameter if you are overriding the default URL.
     */
    constructor(url?: string);
    /**
     * Requests a GET operation from the ArmCalc web service.
     * @param {ArmCalcInput} input - Input parameters.
     * @param {string} type - The type of output measure type: "Srmp" or "Arm".
     * @return {Promise.<ArmCalcOutput>}
     */
    private performCalcGet(input, type);
    /**
     * Converts a value from ARM to SRMP.
     * @param {ArmCalcInput} input - Input parameters.
     * @return {Promise.<ArmCalcOutput>}
     */
    calcSrmp(input: ArmCalcInput): Promise<ArmCalcOutput>;
    /**
     * Converts a value from SRMP to ARM.
     * @param {ArmCalcInput} input - Input parameters.
     * @return {Promise.<ArmCalcOutput>}
     */
    calcArm(input: ArmCalcInput): Promise<ArmCalcOutput>;
    /**
     * Perform multiple HTTP requests with one web service request.
     * @param {ArmCalcInput[]} inputs - input parameters
     * @return {Promise.<ArmCalcOutput>}
     */
    calcBatch(inputs: ArmCalcInput[]): Promise<ArmCalcOutput[]>;
}
