import { comp, filter, into, map } from "transducers-js";

/********
 * Basic Transducer Example
 *   1. remove non-numbers,
 *   2. multiple by 3
 *   3. subtract 1
 *
 * Use transducers just like any map/reduce/filter function but
 * with one big difference. Instead of processing the entire
 * array for each map/reduce/filter, transducers will process
 * an __item__ at a time.
 *
 * Processing per __item__ instead of per __function__ might
 * seem trivial but it's a huge advantage, as well see in a bit.
 * The key feature we achieve in processing per __item__ is we
 * __decouple transforms from flows__. We can describe a flow
 * while keeping the same transform.
 *
 * Here is a basic example:
 ********/
function basicTransducer(items: number[]) {
  console.log("input: ", items);
  return into(
    [],
    comp(
      map((any: unknown) => {
        console.log(`step: ${any}`);
        return any;
      }),
      filter((num: unknown) => typeof num === "number"),
      map((num: number) => num * 3),
      map((num: number) => num - 1),
      map((any: unknown) => {
        console.log(`print: ${any}`);
        return any;
      })
    ),
    items
  );
}
console.log(
  "basicTransducer: ",
  basicTransducer([-1, "--bad--", 0, 1, 2, -10] as number[])
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
// basicTransducer:  [ -4, -1, 2, 5, -31 ]
