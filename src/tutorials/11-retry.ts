import { Console, Effect, Schedule } from "effect"

export const programRetryFixed = (() => {
  let count = 0

  // Simulates an effect with possible failures
  const task = Effect.async<string, Error>((resume) => {
    if (count <= 2) {
      count++
      console.log("failure")
      resume(Effect.fail(new Error()))
    } else {
      console.log("success")
      resume(Effect.succeed("yay!"))
    }
  })

  // Define a repetition policy using a fixed delay between retries
  const policy = Schedule.fixed("100 millis")

  return Effect.retry(task, policy)
  /*
  Output:
  failure
  failure
  failure
  success
  yay!
  */
})()

export const programRetryTimes = (() => {
  let count = 0

  // Simulates an effect with possible failures
  const task = Effect.async<string, Error>((resume) => {
    if (count <= 2) {
      count++
      console.log("failure")
      resume(Effect.fail(new Error()))
    } else {
      console.log("success")
      resume(Effect.succeed("yay!"))
    }
  })

  // Retry the task up to 5 times
  return Effect.retry(task, { times: 5 })
  /*
    Output:
    failure
    failure
    failure
    success
    yay!
  */
})()

export const programRetryUntil = (() => {
  let count = 0

  // Define an effect that simulates varying error on each invocation
  const action = Effect.failSync(() => {
    console.log(`Action called ${++count} time(s)`)
    return `Error ${count}`
  })

  // Retry the action until a specific condition is met
  return Effect.retry(action, {
    until: (err) => err === "Error 3",
  })
  /*
    Effect.runPromiseExit(program).then(console.log)
    Output:
    Action called 1 time(s)
    Action called 2 time(s)
    Action called 3 time(s)
    {
      _id: 'Exit',
      _tag: 'Failure',
      cause: { _id: 'Cause', _tag: 'Fail', failure: 'Error 3' }
    }
  */
})()

export const programRetryOrElse = (() => {
  let count = 0

  // Simulates an effect with possible failures
  const task = Effect.async<string, Error>((resume) => {
    if (count <= 2) {
      count++
      console.log("failure")
      resume(Effect.fail(new Error()))
    } else {
      console.log("success")
      resume(Effect.succeed("yay!"))
    }
  })

  // Retry the task with a delay between retries and a maximum of 2 retries
  const policy = Schedule.addDelay(Schedule.recurs(2), () => "100 millis")

  // If all retries fail, run the fallback effect
  return Effect.retryOrElse(
    task,
    policy,
    // fallback
    () => Console.log("orElse").pipe(Effect.as("default value")),
  )
  /*
  Effect.runPromise(repeated).then(console.log)
  Output:
  failure
  failure
  failure
  orElse
  default value
  */
})()
