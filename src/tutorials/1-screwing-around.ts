import { Console, Data, pipe } from "effect"
import * as Effect from "effect/Effect"

class MyError extends Data.TaggedError("MyError")<{ message: string }> {}

export const program_1 = pipe(
  Effect.gen(function*() {
    const random = yield* Effect.random
    const v = yield* random.nextBoolean
    if (!v) {
      yield* Effect.fail(new MyError({ message: `v is ${v}` }))
    }
    return 10
  }),
  Effect.catchTags({
    MyError: (e) =>
      Effect.gen(function*() {
        yield* Console.error(e.message)
        return 20
      }),
  }),
  Effect.andThen((v) => Console.log(`Program finished with ${v}`)),
)
