import { UnitSpec } from "vega-lite/build/src/spec";
import { AnyMark } from "vega-lite/build/src/mark";
import { ValueDef } from "vega-lite/build/src/channeldef";
import { ExprRef } from "vega";
import { Encoding } from "vega-lite/build/src/encoding";

// As suggested: https://dev.to/vborodulin/ts-how-to-override-properties-with-type-intersection-554l
type Override<T1, T2> = Omit<T1, keyof T2> & T2;

export type VlContourMark = AnyMark | "contour";
export interface VlContourEncoding extends Encoding<any> {
  smooth: ValueDef<boolean>;
  thresholds: ValueDef<ExprRef | number[]>;
}

// actual unit spec, is either top level or is top level
export type VlContourUnitSpec = Override<
  UnitSpec<any>,
  {
    mark: VlContourMark;
    encoding: VlContourEncoding;
  }
>;
