import { comp, filter, into, map } from "transducers-js";

const spy = (text: string) => (any: unknown) => {
  console.log(`${text}:`, any);
  return any;
};
const isNumber = (num: unknown) => typeof num === "number";
const timesThree = (num: number) => num * 3;
const subtractOne = (num: number) => num - 1;
const step = spy("step");
const print = spy("print");

/********
 * Basic Transducer Example with static pipeline
 *   1. remove non-numbers,
 *   2. multiple by 3
 *   3. subtract 1
 *
 * Multiple simple functions can be composed together
 * as a reusable pipeline. This let's use describe
 * transformations in a human readable list of step and
 * keep it separate from when and where the data flow will happen.
 ********/
const pipeline = comp(
  map(step),
  filter(isNumber),
  map(timesThree),
  map(subtractOne),
  map(print)
);
function basicPipelineTransducer(items: number[]) {
  console.log("input: ", items);
  return into([], pipeline, items);
}
console.log(
  "basicPipelineTransducer: ",
  basicPipelineTransducer([-1, "--bad--", 0, 1, 2, -10] as number[])
);
// input:  [ -1, '--bad--', 0, 1, 2, -10 ]
// step: -1
// print: -4
// step: --bad--
// step: 0
// print: -1
// step: 1
// print: 2
// step: 2
// print: 5
// step: -10
// print: -31
// basicPipelineTransducer:  [ -4, -1, 2, 5, -31 ]
