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
import { programSync } from "./tutorials/2-sync.js"
import { programAsync } from "./tutorials/3-async-1.js"
import { prgramAsyncWithCleanup } from "./tutorials/3-async-2.js"
import { prgramAsyncWithInterruption } from "./tutorials/3-async-3.js"
import { programSuspend } from "./tutorials/4-suspend-1.js"
import { prgramSuspendRecursive } from "./tutorials/4-suspend-2.js"
import { programEither, programOption } from "./tutorials/5-option-either.js"
import { programCollectEithers, programCollectionOptions, programCollectStruct } from "./tutorials/6-collecting.js"
import { programTracing } from "./tutorials/7-tracing-1.js"
import { programTracingOtel } from "./tutorials/7-tracing-2.js"
import { programCatchDefect, programExit } from "./tutorials/8-defects-2.js"
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
    Console.log(`${SEPARATOR}\nRunning ${name}`),
    Effect.andThen(program),
    Effect.andThen((v) => Console.log(`\nProgram ${name} succeeded${v !== undefined ? ` with ${v} !` : "!"}`)),
    Effect.catchAll((e) => Console.log(`\nProgram ${name} failed with ${e}`)),
    Effect.tap(Effect.sleep(delay)),
  )

const programs = {
  "1": [
    runProgram("program 1", program_1),
  ],
  "2": [
    runProgram("program 2", programSync("a")),
  ],
  "3": [
    runProgram(
      "program 3.1",
      programAsync({
        url: "https://google.com",
        path: "./LICENSE",
      }),
    ),
    runProgram("Program 3.2", prgramAsyncWithCleanup),
    runProgram("Program 3.3", prgramAsyncWithInterruption),
  ],
  "4": [
    runProgram("Program 4.1", programSuspend),
    runProgram("Program 4.2", prgramSuspendRecursive(32)),
  ],
  "5": [
    runProgram("Program 5", programOption),
    runProgram("Program 5", programEither),
  ],
  "6": [
    runProgram("Program 6", programCollectStruct),
    runProgram("Program 6", programCollectEithers),
    runProgram("Program 6", programCollectionOptions),
  ],
  "7": [
    runProgram("Program 7.1", programTracing(10)),
    runProgram("Program 7.2", programTracingOtel),
  ],
  "8": [
    runProgram("Program 8.2", programExit),
    runProgram("Program 8.2", programCatchDefect),
  ],
  "9": [
    runProgram("Program 9", programOrElse()),
    runProgram("Program 9", programOrElseFail),
    runProgram("Program 9", programOrElseSucceed),
    runProgram("Program 9", programFirstSuccessOf()),
  ],
  "10": [
    runProgram("Program 10", programMatch),
    runProgram("Program 10", programIgnore),
    runProgram("Program 10", programMatchEffect),
    runProgram("Program 10", programMatchCause),
    runProgram("Program 10", programMatchCauseEffect),
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
