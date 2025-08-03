import { Effect } from "effect"

const divideDie = (a: number, b: number) =>
  b === 0
    ? Effect.die(new Error("Cannot divide by zero"))
    : Effect.succeed(a / b)

//      ┌─── Effect<number, never, never>
//      ▼
export const programDie = divideDie(1, 0)

/*
Effect.runPromise(programDie).catch(console.error)

Output:
(FiberFailure) Error: Cannot divide by zero
  ...stack trace...
*/

const divideDieMessage = (a: number, b: number) =>
  b === 0
    ? Effect.dieMessage("Cannot divide by zero")
    : Effect.succeed(a / b)

//      ┌─── Effect<number, never, never>
//      ▼
export const programDieMessage = divideDieMessage(1, 0)

/*
Effect.runPromise(programDieMessage).catch(console.error)

Output:
(FiberFailure) RuntimeException: Cannot divide by zero
  ...stack trace...
*/

const divide = (a: number, b: number) =>
  b === 0
    ? Effect.fail(new Error("Cannot divide by zero"))
    : Effect.succeed(a / b)

//      ┌─── Effect<number, never, never>
//      ▼
export const programOrDie = Effect.orDie(divide(1, 0))

/*
Effect.runPromise(programOrDie).catch(console.error)

Output:
(FiberFailure) Error: Cannot divide by zero
  ...stack trace...
*/

//      ┌─── Effect<number, never, never>
//      ▼
export const programOrDieWith = Effect.orDieWith(
  divide(1, 0),
  (error) => new Error(`defect: ${error.message}`),
)

/*
Effect.runPromise(programOrDieWith).catch(console.error)

Output:
(FiberFailure) Error: defect: Cannot divide by zero
  ...stack trace...
*/
