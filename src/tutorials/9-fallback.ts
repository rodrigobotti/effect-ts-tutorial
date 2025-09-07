import { Console, Effect, pipe } from "effect"

export function programOrElse() {
  const success = Effect.succeed("original effect: success")
  const failure = Effect.fail("original effect: failure")
  const fallback = Effect.succeed("fallback")

  return Effect.gen(function*() {
    // Try the success effect first, fallback is not used
    yield* pipe(
      Effect.orElse(success, () => fallback),
      Effect.andThen(Console.log),
    )
    // Output: "success"

    // Try the failure effect first, fallback is used
    yield* pipe(
      Effect.orElse(failure, () => fallback),
      Effect.andThen(Console.log),
    )
    // Output: "fallback"
  })
}

const validate = (age: number): Effect.Effect<number, string> => {
  if (age < 0) {
    return Effect.fail("NegativeAgeError")
  } else if (age < 18) {
    return Effect.fail("IllegalAgeError")
  } else {
    return Effect.succeed(age)
  }
}

export const programOrElseFail = pipe(
  Effect.orElseFail(
    validate(-1),
    () => "invalid age",
  ),
  Effect.catchAll((error) => Console.log("orElseFail:", error)),
)

export const programOrElseSucceed = pipe(
  Effect.orElseSucceed(validate(-1), () => 18),
  Effect.andThen(
    (value) => Console.log("orElseSucceed:", value),
  ),
)

export function programFirstSuccessOf() {
  type Config = {
    host: string
    port: number
    apiKey: string
  }

  // Create a configuration object with sample values
  const makeConfig = (name: string): Config => ({
    host: `${name}.example.com`,
    port: 8080,
    apiKey: "12345-abcde",
  })

  // Simulate retrieving configuration from a remote node
  const remoteConfig = (name: string): Effect.Effect<Config, Error> =>
    Effect.gen(function*() {
      // Simulate node3 being the only one with available config
      if (name === "node3") {
        yield* Console.log(`Config for ${name} found`)
        return makeConfig(name)
      } else {
        yield* Console.log(`Unavailable config for ${name}`)
        return yield* Effect.fail(new Error(`Config not found for ${name}`))
      }
    })

  // Define the master configuration and potential fallback nodes
  const masterConfig = remoteConfig("master")
  const nodeConfigs = ["node1", "node2", "node3", "node4"].map(remoteConfig)

  // Attempt to find a working configuration,
  // starting with the master and then falling back to other nodes
  const config = Effect.firstSuccessOf([masterConfig, ...nodeConfigs])

  return pipe(config, Effect.andThen((v) => JSON.stringify(v, null, 2)))
  /*
    Output:
    Unavailable config for master
    Unavailable config for node1
    Unavailable config for node2
    Config for node3 found
    { host: 'node3.example.com', port: 8080, apiKey: '12345-abcde' }
  */
}
