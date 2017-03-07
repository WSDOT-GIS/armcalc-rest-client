/**
 * Valid calculation types.
 */
export declare enum CalcTypes {
    /** SRMP to ARM */
    SrmpToArm = 0,
    /** ARM to SRMP */
    ArmToSrmp = 1
}

export declare type ABIndicator = "A" | "B" | null;

/**
 * Defines an ARM Calc operation.
 */
export interface ArmCalcInput {
    /** Calculation Type. 0 = SRMP to ARM, 1 = ARM to SRMP */
    CalcType?: CalcTypes;
    /** Three digit state route ID. */
    SR: string;
    /** Related Route Type */
    RRT?: string;
    /** Related Route Qualifier */
    RRQ?: string;
    /** Ahead / Back indicator for SRMP. "A" or null, or "B" */
    ABIndicator?: ABIndicator;
    /** Input data collection date */
    ReferenceDate: Date;
    /** Accumulated Route Mileage. Actual measure */
    ARM?: number;
    /** State Route Milepost - Posted milepost. May not match actual measure due to route adjustments over time. */
    SRMP?: number;
    /** Output date. Use this to match an LRS publication date. */
    ResponseDate: Date;
    /** Transaction ID. Use a unique ID with batch results. */
    TransId?: string;
}

/**
 * ArmCalc output.
 */
export interface ArmCalcOutput extends ArmCalcInput {
    /** Calculation return code. */
    CalculationReturnCode: number;
    /** Calulation return message. Will not have value if return code is 0. */
    CalculationReturnMessage: string;
    /** Realignment date. Date that a route was last realigned. */
    RealignmentDate: Date;
}