import { comp, filter, map, transduce, reduced, drop } from "transducers-js";

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
 * Metered Accumulation Transducer
 *   1. waste time loading files from disk
 *   2. remove non-numbers,
 *   3. multiple by 3
 *   4. subtract 1
 *   5. accumulate results splitting on positive & negative
 *   6. when function has processed for x milliseconds, delay and continue the next run loop
 *
 * Why does transducer's per __item__ beat Array's per __function__
 * processing? We can combine the per item and early termination
 * to have fine grain control over the data flow without changing the
 * transform!
 *
 * A common front-end use case would be to search multiple objects
 * in an array for a matching text. This could be a CPU intenstive
 * operation and as the size of the array grows the CPU takes
 * more time while can kill the UI.
 *
 * If the array is 1,000,000 items do we need to process all of that
 * in a single 16ms run loop? Or it is important to process some
 * so that we can show feedback to the UI?
 *
 * We can add metering on a transducer to accumulate as much
 * as possible in a fixed amount of time.
 *
 * This means we can massively scale:
 * 1. the items in the array
 * 2. the CPU load of any or multiple transforms
 * 3. and also be 100% agnostic to the user's machine
 *
 * The example below will run for 10ms, pause, return what ever
 * is accumulated and then continue in the next JS run loop.
 *
 * Regardless of the array size, runtime of a function or the user's
 * machine the processing will never dip below 60FPS!
 ********/
const wasteTimeLoadingFiles = (num: number) => {
  for (var i = 0; i < 5; i++) {
    // @ts-ignore
    const file = require("fs").readFileSync("./package.json");
  }
  return num;
};

function meteredTransducer<Accumulation>(
  xf: (num: number) => number,
  f: (acc: Accumulation, num: number) => Accumulation,
  init: Accumulation,
  coll: number[],
  onTick: (acc: Accumulation, left?: number) => void,
  maxMs: number = 10,
  waitMs: number = 3_000
): void {
  console.log("input: ", coll);
  const next = (startAt = 0, until = +new Date() + maxMs) => {
    const count = (n: any) => {
      startAt += 1;
      return n;
    };

    onTick(
      transduce(
        comp(drop(startAt), map(count), xf), // drop will start at last counted idx
        // @ts-ignore
        (acc: Accumulation, num: number) => {
          const accumulation = f(acc, num); // accumulate

          const hasTime = +new Date() < until;
          const isDone = startAt >= coll.length - 1;

          if (hasTime || isDone) return accumulation;

          setTimeout(() => next(startAt, +new Date() + maxMs), waitMs); // resume
          return reduced(accumulation); // pause processing
        },
        init,
        coll
      ),
      coll.length - startAt // left
    );
  };
  next();
}

/********
 * Metered Accumulation Transducer
 *   1. waste time loading files from disk
 *   2. remove non-numbers,
 *   3. multiple by 3
 *   4. subtract 1
 *   5. accumulate results splitting on positive & negative
 *   6. when function has processed for x milliseconds, delay and continue the next run loop
 ********/
meteredTransducer(
  comp(map(wasteTimeLoadingFiles), pipeline) as any,
  accumulator,
  { negative: [], positive: [] },
  [-1, "-bad-", 2, 3, 4] as number[],
  (batch) => {
    console.log("meteredTransducer: ", batch);
  }
);
console.log("------- processed --------");
// input:  [ -1, '-bad-', 2, 3, 4 ]
// step: -1
// print: -4
// accumulate: {"negative":[-4],"positive":[]}
// meteredTransducer:  { negative: [ -4 ], positive: [] }
// ------- processed --------
// step: -bad-
// step: 2
// print: 5
// accumulate: {"negative":[-4],"positive":[5]}
// meteredTransducer:  { negative: [ -4 ], positive: [ 5 ] }
// step: 3
// print: 8
// accumulate: {"negative":[-4],"positive":[5,8]}
// step: 4
// print: 11
// accumulate: {"negative":[-4],"positive":[5,8,11]}
// meteredTransducer:  { negative: [ -4 ], positive: [ 5, 8, 11 ] }
