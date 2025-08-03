import { Console, Effect } from "effect"

const bad = (() => {
  let i = 0
  return Effect.succeed(i++) // will always return 0
})().pipe(
  Effect.andThen(Console.log),
)

const good = (() => {
  let i = 1
  return Effect.suspend(() => Effect.succeed(i++))
})().pipe(
  Effect.andThen(Console.log),
)

export const programSuspend = Effect.all([
  bad, // 0
  bad, // 0
  bad, // 0
  good, // 1
  good, // 2
  good, // 3
], { discard: true })
