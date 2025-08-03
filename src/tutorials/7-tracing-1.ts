import { Effect } from "effect"

export const programTracing = Effect.fn("programTracing")(function*<N extends number>(n: N) {
  yield* Effect.annotateCurrentSpan("n", n) // Attach metadata to the span
  console.log(`got: ${n}`)
  yield* Effect.fail(new Error("Boom!")) // Simulate failure
})

/*
Effect.runFork(myfunc(100).pipe(Effect.catchAllCause(Effect.logError)))

Output:
got: 100
timestamp=... level=ERROR fiber=#0 cause="Error: Boom!
    at <anonymous> (/.../index.ts:6:22) <= Raise location
    at programTracing (/.../index.ts:3:23)  <= Definition location
    at programTracing (/.../index.ts:9:16)" <= Call location
*/
