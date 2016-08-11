declare enum CalcTypes {
    SrmpToArm = 0,
    ArmToSrmp = 1
}

// type ABIndicator = "A" | "B" | "";

interface ArmCalcInput {
    CalcType?: CalcTypes;
    SR: string;
    RRT?: string;
    RRQ?: string;
    ABIndicator?: string;
    ReferenceDate: Date;
    ARM?: number;
    SRMP?: number;
    ResponseDate: Date;
    TransId?: string;
}

interface ArmCalcOutput extends ArmCalcInput {
    CalculationReturnCode: number;
    CalculationReturnMessage: string;
    RealignmentDate: Date;
}