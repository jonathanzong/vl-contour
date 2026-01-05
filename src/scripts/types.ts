import { UnitSpec } from "vega-lite/build/src/spec";
import { AnyMark, MarkDef } from "vega-lite/build/src/mark";
import * as vega from "vega";

// As suggested: https://dev.to/vborodulin/ts-how-to-override-properties-with-type-intersection-554l
type Override<T1, T2> = Omit<T1, keyof T2> & T2;

export interface ContourMarkDef extends MarkDef {
  type: "contour";
  smooth?: boolean;
  thresholds?: vega.ExprRef | number[];
}

export type VlContourMark = AnyMark | "contour" | ContourMarkDef;

// actual unit spec, is either top level or is top level
export type VlContourUnitSpec = Override<
  UnitSpec<any>,
  {
    mark: VlContourMark;
  }
>;
