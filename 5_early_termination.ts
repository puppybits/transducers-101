import {
  comp,
  filter,
  into,
  map,
  transduce,
  reduced,
  drop,
} from "transducers-js";

const spy = (text: string) => (any: unknown) => {
  console.log(`${text}:`, any);
  return any;
};
const isNumber = (num: unknown) => typeof num === "number";
const timesThree = (num: number) => num * 3;
const subtractOne = (num: number) => num - 1;
const step = spy("step");
const print = spy("print");
const pipeline = comp(
  map(step),
  filter(isNumber),
  map(timesThree),
  map(subtractOne),
  map(print)
);
type accumulation = { negative: number[]; positive: number[] };

const accumulator = (acc: accumulation, num: number): accumulation => {
  if (num < 0) acc.negative.push(num);
  if (num >= 0) acc.positive.push(num);

  console.log(`accumulate: ${JSON.stringify(acc)}`);
  return acc;
};

/********
 * early termination Transducer example
 *   1. remove non-numbers,
 *   2. multiple by 3
 *   3. subtract 1
 *   4. until num > 3, accumulate results splitting on positive & negative
 *
 * Unlike standard map/reduce functions, Transducers can
 * early terminate. Early termination can stop the rest
 * or the items in the array from processing. This
 * saves time when we don't want to process the rest of the
 * items.
 ********/
const accumulatorUntilGreaterThanThree = (
  acc: accumulation,
  num: number
): accumulation | any => {
  if (num > 3) {
    return reduced(acc);
  }
  return accumulator(acc, num);
};

function earlyTerminationAccumulator(items: unknown[]) {
  console.log("input: ", items);
  return transduce(
    pipeline,
    accumulatorUntilGreaterThanThree,
    { negative: [], positive: [] },
    items
  );
}
console.log(
  "earlyTerminationAccumulator: ",
  earlyTerminationAccumulator([-1, "--bad--", 0, 1, 2, -10] as number[])
);
// input:  [ -1, '--bad--', 0, 1, 2, -10 ]
// step: -1
// print: -4
// accumulate: {"negative":[-4],"positive":[]}
// step: --bad--
// step: 0
// print: -1
// accumulate: {"negative":[-4,-1],"positive":[]}
// step: 1
// print: 2
// accumulate: {"negative":[-4,-1],"positive":[2]}
// step: 2
// print: 5
// accumulate: {"negative":[-4,-1],"positive":[2,5]}
// earlyTerminationAccumulator:  { negative: [ -4, -1 ], positive: [ 2, 5 ] }
