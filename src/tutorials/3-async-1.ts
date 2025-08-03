import { Console, Data, Effect, pipe } from "effect"
import { readFile } from "node:fs"

const delay = (time: number) =>
  Effect.promise<void>(
    () => new Promise((resolve) => setTimeout(resolve, time)),
  )

class FetchError extends Data.TaggedError("FetchError")<{ original: unknown }> {}

const cutContent = (size: number) => (content: string) => content.slice(0, size) + " ..."

const HTTP = {
  get: (url: string) =>
    Effect.tryPromise({
      try: () => fetch(url).then((r) => r.text()).then(cutContent(50)),
      catch: (error) => new FetchError({ original: error }),
    }),
}

class FileSystemError extends Data.TaggedError("FileSystemError")<{ original: unknown }> {}

const FS = {
  readFile: (path: string) =>
    Effect.async<string, FileSystemError>((resume) => {
      readFile(path, { encoding: "utf8" }, (error, data) =>
        error
          ? resume(Effect.fail(new FileSystemError({ original: error })))
          : resume(Effect.succeed(cutContent(50)(data))))
    }),
}

export const prgramAsync = ({ path, url }: { url: string; path: string }) =>
  pipe(
    Effect.all([
      HTTP.get(url),
      FS.readFile(path),
    ]),
    Effect.tap(delay(1_000)),
    Effect.flatMap(([response, content]) =>
      Console.log({
        response,
        content,
      })
    ),
  )
