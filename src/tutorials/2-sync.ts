import { Data, Effect, pipe } from "effect"

class JsonParseError extends Data.TaggedError("JsonParseError")<{ original: unknown }> {}

const log = (...message: Array<unknown>) => Effect.sync(() => console.log(...message))

const parse = <T>(input: string) =>
  Effect.try({
    try: () => JSON.parse(input) as T,
    catch: (error) => new JsonParseError({ original: error }),
  })

export const programSync = <T>(json: string) =>
  pipe(
    parse<T>(json),
    Effect.tap(log),
    Effect.catchTags({
      JsonParseError: (e) => log("caught JsonParseError with", e.original),
    }),
  )
