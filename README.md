# eden2query

Type-safe [Eden Treaty](https://elysiajs.com/eden/overview) to [React Query](https://tanstack.com/query) helpers. Two functions, zero runtime dependencies.

## Install

```bash
bun add eden2query @elysiajs/eden @tanstack/react-query
```

## Usage

```ts
import { treaty } from "@elysiajs/eden";
import { edenQueryOptions, edenMutationOptions } from "eden2query";
import type { App } from "./server"; // your Elysia app type

const client = treaty<App>("localhost:3000");

// GET → queryOptions (first arg is a thunk that calls the Eden GET function)
const resourceQuery = edenQueryOptions(
  () => client.api.resource.get({ query: { q: "hello" } }),
  { queryKey: ["resource"] },
);

// POST / PUT / DELETE → mutationOptions
const createResource = edenMutationOptions(client.api.resource.post);

// Parameterised routes — bind params first
const updateResource = edenMutationOptions(
  client.api.resource({ id: "some-id" }).put,
);
```

Then use them with React Query as usual:

```tsx
const { data } = useQuery(resourceQuery);
const mutation = useMutation(createResource);

mutation.mutate({ body: { name: "New item" }, query: { q: "hello" } }); // fully typed input
```

Works with `prefetchQuery`, `ensureQueryData`, `useSuspenseQuery`, etc:

```ts
const queryClient = new QueryClient();
await queryClient.prefetchQuery(resourceQuery);
```

You can also pass any standard React Query options as the second argument:

```ts
const resourceQuery = edenQueryOptions(
  () => client.api.resource.get({ query: { q: "hello" } }),
  { queryKey: ["resource"], refetchInterval: 1000 },
);

const createResource = edenMutationOptions(
  client.api.resource.post,
  { onSuccess: () => console.log("created!") },
);
```

## API

**`edenQueryOptions(fn, queryOptions)`** — wraps an Eden GET call into `queryOptions`. `fn` is a **thunk** (zero-argument function) that calls the Eden GET function, e.g. `() => client.api.resource.get({ query: { ... } })`. This lets you bind query parameters, headers, or any other Eden options at definition time. The second argument accepts all `queryOptions` fields except `queryFn`. Extracts `data` from the response and throws on `error`.

**`edenMutationOptions(fn, mutationOptions?)`** — wraps an Eden mutation function into `mutationOptions`. The optional second argument accepts all `mutationOptions` fields except `mutationFn` (e.g. `onSuccess`, `onSettled`, `onMutate`). The `mutate` call receives a single object with `body` and any other Eden options (like `query`) as the input.

**`InferQueryOptions<TFn>`** — extracts the full `UseQueryOptions` type for a given Eden GET thunk.

**`InferMutationOptions<TFn>`** — extracts the full `UseMutationOptions` type for a given Eden mutation function.

All helpers infer data, error, and input types end-to-end from your Elysia route definitions. No manual generics needed.

## License

MIT
