import { Cause, Console, Effect, Exit, Option } from "effect"

/*
// We get an Exit.Success because we caught all defects
Effect.runPromiseExit(programCatchDefect).then(console.log)

Output:
RuntimeException defect caught: Boom!
{
  _id: "Exit",
  _tag: "Success",
  value: undefined
}
*/

// Simulating a runtime error
const task = Effect.dieMessage("Boom!")

export const programExit = Effect.gen(function*() {
  const exit = yield* Effect.exit(task) // Effect<A, E, R> -> Effect<Exit<A, E>, never, R>
  if (Exit.isFailure(exit)) {
    const cause = exit.cause
    if (
      Cause.isDieType(cause) &&
      Cause.isRuntimeException(cause.defect)
    ) {
      yield* Console.log(
        `RuntimeException defect caught: ${cause.defect.message}`,
      )
    } else {
      yield* Console.log("Unknown failure caught.")
    }
  }
})

/*
// We get an Exit.Success because we caught all failures
Effect.runPromiseExit(programExit).then(console.log)

Output:
RuntimeException defect caught: Boom!
{
  _id: "Exit",
  _tag: "Success",
  value: undefined
}
*/

export const programCatchDefect = Effect.catchAllDefect(task, (defect) => {
  if (Cause.isRuntimeException(defect)) {
    return Console.log(
      `RuntimeException defect caught: ${defect.message}`,
    )
  }
  return Console.log("Unknown defect caught.")
})

export const programCatchSomeDefect = Effect.catchSomeDefect(task, (defect) => {
  if (Cause.isIllegalArgumentException(defect)) {
    return Option.some(
      Console.log(
        `Caught an IllegalArgumentException defect: ${defect.message}`,
      ),
    )
  }
  return Option.none()
})

/*
// Since we are only catching IllegalArgumentException
// we will get an Exit.Failure because we simulated a runtime error.
Effect.runPromiseExit(programCatchSomeDefect).then(console.log)

Output:
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: {
    _id: 'Cause',
    _tag: 'Die',
    defect: { _tag: 'RuntimeException' }
  }
}
*/
