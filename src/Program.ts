import { Console, Effect, pipe } from "effect"
import type { DurationInput } from "effect/Duration"
import { program_1 } from "./tutorials/1-screwing-around.js"
import {
  programIgnore,
  programMatch,
  programMatchCause,
  programMatchCauseEffect,
  programMatchEffect,
} from "./tutorials/10-match.js"
import {
  programRetryFixed as programRetryFixedDelay,
  programRetryOrElse,
  programRetryTimes,
  programRetryUntil,
} from "./tutorials/11-retry.js"
import { programSync } from "./tutorials/2-sync.js"
import { programAsync } from "./tutorials/3-async-1.js"
import { prgramAsyncWithCleanup } from "./tutorials/3-async-2.js"
import { prgramAsyncWithInterruption } from "./tutorials/3-async-3.js"
import { programSuspend } from "./tutorials/4-suspend-1.js"
import { prgramSuspendRecursive as programSuspendRecursive } from "./tutorials/4-suspend-2.js"
import { programEither, programOption } from "./tutorials/5-option-either.js"
import { programCollectEithers, programCollectionOptions, programCollectStruct } from "./tutorials/6-collecting.js"
import { programTracing } from "./tutorials/7-tracing-1.js"
import { programTracingOtel } from "./tutorials/7-tracing-2.js"
import { programCatchDefect, programCatchSomeDefect, programExit } from "./tutorials/8-defects-2.js"
import {
  programFirstSuccessOf,
  programOrElse,
  programOrElseFail,
  programOrElseSucceed,
} from "./tutorials/9-fallback.js"

const SEPARATOR = "-".repeat(100)

const runProgram = <A, E>(
  name: string,
  program: Effect.Effect<A, E, never>,
  delay: DurationInput = "500 milli",
): Effect.Effect<void, never, never> =>
  pipe(
    Console.log(`${SEPARATOR}\nRunning Program ${name}`),
    Effect.andThen(program),
    Effect.andThen((v) => Console.log(`\nProgram ${name} succeeded${v !== undefined ? ` with ${v} !` : "!"}`)),
    Effect.catchAll((e) => Console.log(`\nProgram ${name} failed with ${e}`)),
    Effect.tap(Effect.sleep(delay)),
  )

const programs = {
  "1": [
    runProgram("screwing around", program_1),
  ],
  "2": [
    runProgram("sync", programSync("a")),
  ],
  "3": [
    runProgram(
      "async",
      programAsync({
        url: "https://google.com",
        path: "./LICENSE",
      }),
    ),
    runProgram("async with clean up", prgramAsyncWithCleanup),
    runProgram("async with interruption", prgramAsyncWithInterruption),
  ],
  "4": [
    runProgram("suspend", programSuspend),
    runProgram("suspend with recursion", programSuspendRecursive(32)),
  ],
  "5": [
    runProgram("effect->option", programOption),
    runProgram("effect->either", programEither),
  ],
  "6": [
    runProgram("collect as a struct", programCollectStruct),
    runProgram("collect as list of eithers", programCollectEithers),
    runProgram("collect with list of options", programCollectionOptions),
  ],
  "7": [
    runProgram("tracing", programTracing(10)),
    runProgram("tracing with open telemetry", programTracingOtel),
  ],
  "8": [
    runProgram("handling Effect.exit", programExit),
    runProgram("catching all defects", programCatchDefect),
    runProgram("catching some defects", programCatchSomeDefect),
  ],
  "9": [
    runProgram("Effect.orElse", programOrElse()),
    runProgram("Effect.orElseFail", programOrElseFail),
    runProgram("Effect.orElseSucceed", programOrElseSucceed),
    runProgram("fallback until first success", programFirstSuccessOf()),
  ],
  "10": [
    runProgram("matching effects", programMatch),
    runProgram("ignoring effect results", programIgnore),
    runProgram("matching effects with effects", programMatchEffect),
    runProgram("matching cause", programMatchCause),
    runProgram("matching cause with effects", programMatchCauseEffect),
  ],
  "11": [
    runProgram("retry with fixed schedule until success", programRetryFixedDelay),
    runProgram("retry immediatly a fixed number of times", programRetryTimes),
    runProgram("retry until condition is met", programRetryUntil),
    runProgram("retry with fallback", programRetryOrElse),
  ],
} as const

const [, , programIndex] = process.argv

const programsToRun = () => {
  if (!programIndex || programIndex === "all") {
    return Object.values(
      programs,
    ).flat()
  }
  const keys = Object.keys(programs)
  if (!keys.includes(programIndex)) {
    console.error(`argument must be one of ${keys.join(" | ")}`)
    return []
  }

  return programs[programIndex as keyof typeof programs]
}

// run sequenially (`.all` without `{concurrency: number}` )
const program = Effect.all(
  programsToRun(),
  { discard: true },
)

Effect.runPromise(program)
