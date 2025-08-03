import { Console, Effect, pipe } from "effect"
import type { DurationInput } from "effect/Duration"
import { program_1 } from "./tutorials/1-screwing-around.js"
import { programSync } from "./tutorials/2-sync.js"
import { prgramAsync } from "./tutorials/3-async-1.js"
import { prgramAsyncWithCleanup } from "./tutorials/3-async-2.js"
import { prgramAsyncWithInterruption } from "./tutorials/3-async-3.js"
import { programSuspend } from "./tutorials/4-suspend-1.js"
import { prgramSuspendRecursive } from "./tutorials/4-suspend-2.js"
import { programTracing } from "./tutorials/7-tracing-1.js"
import { programTracingOtel } from "./tutorials/7-tracing-2.js"

const SEPARATOR = "-".repeat(100)

const runProgram = <A, E, R>(
  name: string,
  program: Effect.Effect<A, E, R>,
  delay: DurationInput = "1 second",
) =>
  pipe(
    Console.log(`${SEPARATOR}\nRunning ${name}`),
    Effect.andThen(program),
    Effect.andThen((v) => Console.log(`\nProgram ${name} succeeded${v !== undefined ? ` with ${v} !` : "!"}`)),
    Effect.catchAll((e) => Console.log(`\nProgram ${name} failed with ${e}`)),
    Effect.tap(Effect.sleep(delay)),
  )

const program = Effect.all([ // run sequenially (`.all` without `{concurrency: number}` )
  runProgram("program 1", program_1),
  runProgram("program 2", programSync("a")),
  runProgram(
    "program 3.1",
    prgramAsync({
      url: "https://google.com",
      path: "./LICENSE",
    }),
  ),
  runProgram("Program 3.2", prgramAsyncWithCleanup),
  runProgram("Program 3.3", prgramAsyncWithInterruption),
  runProgram("Program 4.1", programSuspend),
  runProgram("Program 4.2", prgramSuspendRecursive(32)),
  runProgram("Program 7.1", programTracing(10)),
  runProgram("Program 7.2", programTracingOtel, 0),
], { discard: true })

Effect.runPromise(program)
