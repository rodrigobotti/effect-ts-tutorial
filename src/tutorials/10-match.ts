import { Console, Effect, pipe } from "effect"

export const programMatch = Effect.gen(function*() {
  const success: Effect.Effect<number, Error> = Effect.succeed(42)

  const program1 = Effect.match(success, {
    onFailure: (error) => `failure: ${error.message}`,
    onSuccess: (value) => `success: ${value}`,
  })

  // Run and log the result of the successful effect
  yield* pipe(
    program1,
    Effect.andThen(Console.log),
  )
  // Output: "success: 42"

  const failure: Effect.Effect<number, Error> = Effect.fail(
    Error("Uh oh!"),
  )

  const program2 = Effect.match(failure, {
    onFailure: (error) => `failure: ${error.message}`,
    onSuccess: (value) => `success: ${value}`,
  })

  // Run and log the result of the failed effect
  yield* pipe(
    program2,
    Effect.andThen(Console.log),
  )
  // Output: "failure: Uh oh!"
})

export const programIgnore = (() => {
  //      ┌─── Effect<number, string, never>
  //      ▼
  const task = Effect.fail("Uh oh!").pipe(Effect.as(5))

  //      ┌─── Effect<void, never, never>
  //      ▼
  const program = Effect.ignore(task)
  return program
})()

export const programMatchEffect = Effect.gen(function*() {
  const success: Effect.Effect<number, Error> = Effect.succeed(42)
  const failure: Effect.Effect<number, Error> = Effect.fail(
    new Error("Uh oh!"),
  )

  // unlike match, the matching functions can return effects
  const program1 = Effect.matchEffect(success, {
    onFailure: (error) =>
      Effect.succeed(`failure: ${error.message}`).pipe(
        Effect.tap(Effect.log),
      ),
    onSuccess: (value) => Effect.succeed(`success: ${value}`).pipe(Effect.tap(Effect.log)),
  })

  yield* program1
  /*
    Output:
    timestamp=... level=INFO fiber=#0 message="success: 42"
    success: 42
  */

  const program2 = Effect.matchEffect(failure, {
    onFailure: (error) =>
      Effect.succeed(`failure: ${error.message}`).pipe(
        Effect.tap(Effect.log),
      ),
    onSuccess: (value) => Effect.succeed(`success: ${value}`).pipe(Effect.tap(Effect.log)),
  })

  yield* program2
  /*
    Output:
    timestamp=... level=INFO fiber=#1 message="failure: Uh oh!"
    failure: Uh oh!
  */
})

export const programMatchCause = (() => {
  const task: Effect.Effect<number, Error> = Effect.die("Uh oh!")

  const program = Effect.matchCause(task, {
    onFailure: (cause) => {
      switch (cause._tag) {
        case "Fail":
          // Handle standard failure
          return `Fail: ${cause.error.message}`
        case "Die":
          // Handle defects (unexpected errors)
          return `Die: ${cause.defect}`
        case "Interrupt":
          // Handle interruption
          return `${cause.fiberId} interrupted!`
      }
      // Fallback for other causes
      return "failed due to other causes"
    },
    onSuccess: (value) =>
      // task completes successfully
      `succeeded with ${value} value`,
  })

  return program
  // Output: "Die: Uh oh!"
})()

export const programMatchCauseEffect = (() => {
  const task: Effect.Effect<number, Error> = Effect.die("Uh oh!")

  // unlike matchCause, the matching functions can return effects
  const program = Effect.matchCauseEffect(task, {
    onFailure: (cause) => {
      switch (cause._tag) {
        case "Fail":
          // Handle standard failure with a logged message
          return Console.log(`Fail: ${cause.error.message}`)
        case "Die":
          // Handle defects (unexpected errors) by logging the defect
          return Console.log(`Die: ${cause.defect}`)
        case "Interrupt":
          // Handle interruption and log the fiberId that was interrupted
          return Console.log(`${cause.fiberId} interrupted!`)
      }
      // Fallback for other causes
      return Console.log("failed due to other causes")
    },
    onSuccess: (value) =>
      // Log success if the task completes successfully
      Console.log(`succeeded with ${value} value`),
  })

  return program
  // Output: "Die: Uh oh!"
})()
