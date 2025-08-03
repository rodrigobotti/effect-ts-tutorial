import { Data, Effect, Either, Option, pipe } from "effect"

// Simulated asynchronous task fetching a number from a database
const fetchNumberValue = Effect.tryPromise(() => Promise.resolve(42))

//           ┌─── Effect<number, UnknownException | NoSuchElementException, never> instead of Effect<Option<number>, UnknownException, never>
//           ▼
export const programOption = pipe(
  fetchNumberValue,
  Effect.andThen((x) => (x > 0 ? Option.some(x) : Option.none())),
)

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
class InvalidIntegerError extends Data.TaggedError("InvalidIntegerError")<{}> {}

// Function to parse an integer from a string that can fail
const parseInteger = (input: string): Either.Either<number, InvalidIntegerError> =>
  isNaN(parseInt(input))
    ? Either.left(new InvalidIntegerError())
    : Either.right(parseInt(input))

// Simulated asynchronous task fetching a string from database
const fetchStringValue = Effect.tryPromise(() => Promise.resolve("42"))

//           ┌─── Effect<number, InvalidIntegerError | UnknownException, never> instead of Effect<Either<number, InvalidIntegerError>, UnknownException, never>
//           ▼
export const programEither = pipe(
  fetchStringValue,
  Effect.andThen((str) => parseInteger(str)),
)
