import { NodeSdk } from "@effect/opentelemetry"
import { BatchSpanProcessor, ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base"
import { Effect } from "effect"

const myfunc = Effect.fn("myspan")(function*<N extends number>(n: N) {
  yield* Effect.annotateCurrentSpan("n", n)
  console.log(`got: ${n}`)
  yield* Effect.fail(new Error("Boom!"))
})

const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: "example" },
  // Export span data to the console
  spanProcessor: new BatchSpanProcessor(new ConsoleSpanExporter()),
}))

export const programTracingOtel = myfunc(100).pipe(Effect.provide(NodeSdkLive))

/*
Effect.runFork(program)

Output:
got: 100
{
  resource: {
    attributes: {
      'service.name': 'example',
      'telemetry.sdk.language': 'nodejs',
      'telemetry.sdk.name': '@effect/opentelemetry',
      'telemetry.sdk.version': '1.30.1'
    }
  },
  instrumentationScope: { name: 'example', version: undefined, schemaUrl: undefined },
  traceId: '22801570119e57a6e2aacda3dec9665b',
  parentId: undefined,
  traceState: undefined,
  name: 'myspan',
  id: '7af530c1e01bc0cb',
  kind: 0,
  timestamp: 1741182277518402.2,
  duration: 4300.416,
  attributes: {
    n: 100,
    'code.stacktrace': 'at <anonymous> (/.../index.ts:8:23)\n' +
      'at <anonymous> (/.../index.ts:14:17)'
  },
  status: { code: 2, message: 'Boom!' },
  events: [
    {
      name: 'exception',
      attributes: {
        'exception.type': 'Error',
        'exception.message': 'Boom!',
        'exception.stacktrace': 'Error: Boom!\n' +
          '    at <anonymous> (/.../index.ts:11:22)\n' +
          '    at myspan (/.../index.ts:8:23)\n' +
          '    at myspan (/.../index.ts:14:17)'
      },
      time: [ 1741182277, 522702583 ],
      droppedAttributesCount: 0
    }
  ],
  links: []
}
*/
