import { Console, Effect } from "effect"

const structOfEffects = {
  a: Effect.succeed(42).pipe(Effect.tap(Console.log)),
  b: Effect.succeed("Hello").pipe(Effect.tap(Console.log)),
}

//           ┌─── Effect<{ a: number; b: string; }, never, never>
//           ▼
export const programCollectStruct = Effect.all(structOfEffects)

/*
Effect.runPromise(program_6_struct).then(console.log)

Output:
42
Hello
{ a: 42, b: 'Hello' }
*/

export const programCollectEithers = Effect.all([
  Effect.succeed("Task1").pipe(Effect.tap(Console.log)),
  Effect.fail("Task2: Oh no!").pipe(Effect.tap(Console.log)),
  Effect.succeed("Task3").pipe(Effect.tap(Console.log)),
], { mode: "either" }) // <- instead of short circuiring, collects as Either<...>[] due to failures (similar to Promise.allSettled)

/*
Effect.runPromiseExit(program_6_either).then(console.log)

Output:
Task1
Task3
{
  _id: 'Exit',
  _tag: 'Success',
  value: [
    { _id: 'Either', _tag: 'Right', right: 'Task1' },
    { _id: 'Either', _tag: 'Left', left: 'Task2: Oh no!' },
    { _id: 'Either', _tag: 'Right', right: 'Task3' }
  ]
}
*/

export const programCollectionOptions = Effect.all([
  Effect.succeed("Task1").pipe(Effect.tap(Console.log)),
  Effect.fail("Task2: Oh no!").pipe(Effect.tap(Console.log)),
  Effect.succeed("Task3").pipe(Effect.tap(Console.log)),
], { mode: "validate" }) // <- instead of short circuiring, Option<...>[] due to failures (similar to Promise.allSettled)

/*
Effect.runPromiseExit(program_6_option).then((result) => console.log("%o", result))

Output:
Task1
Task3
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: {
    _id: 'Cause',
    _tag: 'Fail',
    failure: [
      { _id: 'Option', _tag: 'None' },
      { _id: 'Option', _tag: 'Some', value: 'Task2: Oh no!' },
      { _id: 'Option', _tag: 'None' }
    ]
  }
}
*/
