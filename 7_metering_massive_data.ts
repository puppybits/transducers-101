import {
  comp,
  filter,
  into,
  map,
  transduce,
  reduced,
  drop,
} from "transducers-js";

const isNumber = (num: unknown) => typeof num === "number";
const timesThree = (num: number) => num * 3;
const subtractOne = (num: number) => num - 1;
const pipeline = comp(filter(isNumber), map(timesThree), map(subtractOne));

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
function meteringTransducer(xf: any, coll: number[], onTick: any) {
  const arrayAccumulate = (arr: number[], num: number) => {
    arr.push(num);
    return arr;
  };
  meteredTransducer(xf, arrayAccumulate, [] as any, coll, onTick, 10, 0);
}

/********
 * Metered Transducer for massive data sets
 *   1. remove non-numbers,
 *   2. multiple by 3
 *   3. subtract 1
 *   4. processed for x milliseconds, output, continue the next run loop
 *
 * To dial in the point of scale, here's an example of processing
 * as much data as you want. The machine will always be response
 * and provide more results on each JS run loop tick.
 *
 * Where do we go from here? Well what if the metered transducer
 * was stateful so when we pass in a new input it __cancels__
 * the current operation and starts on the new input?!
 *
 ********/
const generate = (len: number) =>
  new Array(len)
    .fill(null)
    .map((_, idx) =>
      idx === 1 ? "-bad-" : Math.floor(Math.random() * 100) * (idx % 2 ? 1 : -1)
    ) as number[];

// generate 200k items and log out to console on each js run loop
meteringTransducer(
  comp(filter(isNumber), map(timesThree), map(subtractOne)),
  generate(200_000),
  console.log
);

// --- Next Steps? ---
// - reset the metered transducer when new input sent
