import { Effect } from "effect"

export const programTimeout = (() => {
  const task = Effect.gen(function*() {
    console.log("Start processing...")
    yield* Effect.sleep("2 seconds") // Simulates a delay in processing
    console.log("Processing complete.")
    return "Result"
  })

  // Sets a 3-second timeout for the task
  return task.pipe(Effect.timeout("3 seconds"))

  // Output will show that the task completes successfully
  // as it falls within the timeout duration
  /*
    Effect.runPromiseExit(timedEffect).then(console.log)
    Output:
    Start processing...
    Processing complete.
    { _id: 'Exit', _tag: 'Success', value: 'Result' }
  */
})()

export const programTimoutExceeded = (() => {
  const task = Effect.gen(function*() {
    console.log("Start processing...")
    yield* Effect.sleep("2 seconds") // Simulates a delay in processing
    console.log("Processing complete.")
    return "Result"
  })

  // Output will show a TimeoutException as the task takes longer
  // than the specified timeout duration
  return task.pipe(Effect.timeout("1 second"))
  /*
    Effect.runPromiseExit(timedEffect).then(console.log)
    Output:
    Start processing...
    {
      _id: 'Exit',
      _tag: 'Failure',
      cause: {
        _id: 'Cause',
        _tag: 'Fail',
        failure: { _tag: 'TimeoutException' }
      }
    }
  */
})()

export const programTimeoutOption = (() => {
  const task = Effect.gen(function*() {
    console.log("Start processing...")
    yield* Effect.sleep("2 seconds") // Simulates a delay in processing
    console.log("Processing complete.")
    return "Result"
  })

  return Effect.all([
    task.pipe(Effect.timeoutOption("3 seconds")),
    task.pipe(Effect.timeoutOption("1 second")),
  ])
  /*
    Effect.runPromise(timedOutEffect).then(console.log)
    Output:
    Start processing...
    Processing complete.
    Start processing...
    [
      { _id: 'Option', _tag: 'Some', value: 'Result' },
      { _id: 'Option', _tag: 'None' }
    ]
  */
})()

export const programTimeoutInterruptible = (() => {
  // task is interruptible
  const task = Effect.gen(function*() {
    console.log("Start processing...")
    yield* Effect.sleep("2 seconds") // Simulates a delay in processing
    console.log("Processing complete.") // <-- will NOT log because it is interrupted before reaching it
    return "Result"
  })

  // Interruptible Operation:
  // If the operation can be interrupted,
  // it is terminated immediately once the timeout threshold is reached,
  // resulting in a TimeoutException.
  return task.pipe(Effect.timeout("1 second"))
  /*
    Effect.runPromiseExit(timedEffect).then(console.log)
    Output:
    Start processing...
    {
      _id: 'Exit',
      _tag: 'Failure',
      cause: {
        _id: 'Cause',
        _tag: 'Fail',
        failure: { _tag: 'TimeoutException' }
      }
    }
 */
})()

export const programTimeoutUninterruptible = (() => {
  const task = Effect.gen(function*() {
    console.log("Start processing...")
    yield* Effect.sleep("2 seconds") // Simulates a delay in processing
    console.log("Processing complete.") // <-- will log before failing with TimeoutException
    return "Result"
  })

  // Uninterruptible Operation:
  // If the operation is uninterruptible, it continues until completion
  // before the TimeoutException is assessed.
  return task.pipe(
    Effect.uninterruptible,
    Effect.timeout("1 second"),
  )
  // Outputs a TimeoutException after the task completes,
  // because the task is uninterruptible
  /*
    Effect.runPromiseExit(timedEffect).then(console.log)
    Output:
    Start processing...
    Processing complete.
    {
      _id: 'Exit',
      _tag: 'Failure',
      cause: {
        _id: 'Cause',
        _tag: 'Fail',
        failure: { _tag: 'TimeoutException' }
      }
    }
 */
})()
