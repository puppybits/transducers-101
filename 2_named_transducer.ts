import { comp, filter, into, map } from "transducers-js";

/********
 * Basic Transducer Example with named functions
 *   1. remove non-numbers,
 *   2. multiple by 3
 *   3. subtract 1
 *
 * Transducers are just simple functions that take one
 * argument and return a result.
 *
 * Since it's just a basic function when set the function
 * to a variable it makes it highly composable.
 ********/
const spy = (text: string) => (any: unknown) => {
  console.log(`${text}:`, any);
  return any;
};
const isNumber = (num: unknown) => typeof num === "number";
const timesThree = (num: number) => num * 3;
const subtractOne = (num: number) => num - 1;
const step = spy("step");
const print = spy("print");

function basicNamedTransducer(items: number[]) {
  console.log("input: ", items);
  return into(
    [],
    comp(
      map(step),
      filter(isNumber),
      map(timesThree),
      map(subtractOne),
      map(print)
    ),
    items
  );
}
console.log(
  "basicNamedTransducer: ",
  basicNamedTransducer([-1, "--bad--", 0, 1, 2, -10] as number[])
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
// basicNamedTransducer:  [ -4, -1, 2, 5, -31 ]
