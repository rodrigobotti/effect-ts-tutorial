import { Effect } from "effect"

const _blowsUp = (n: number): Effect.Effect<number> =>
  n < 2
    ? Effect.succeed(1)
    : Effect.zipWith(_blowsUp(n - 1), _blowsUp(n - 2), (a, b) => a + b)

// console.log(Effect.runSync(_blowsUp(32)))
// crash: JavaScript heap out of memory

const allGood = (n: number): Effect.Effect<number> =>
  n < 2
    ? Effect.succeed(1)
    : Effect.zipWith(
      Effect.suspend(() => allGood(n - 1)),
      Effect.suspend(() => allGood(n - 2)),
      (a, b) => a + b,
    )

export const prgramSuspendRecursive = allGood
