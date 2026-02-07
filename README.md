# eden2query

Type-safe [Eden Treaty](https://elysiajs.com/eden/overview) to [React Query](https://tanstack.com/query) helpers. Two functions, zero runtime dependencies.

## Install

```bash
bun add eden2query @elysiajs/eden @tanstack/react-query
```

## Usage

```ts
import { treaty } from "@elysiajs/eden";
import { treatyQueryOptions, treatyMutationOptions } from "eden2query";
import type { App } from "./server"; // your Elysia app type

const client = treaty<App>("localhost:3000");

// GET → queryOptions
const resourceQuery = treatyQueryOptions({
  queryKey: ["resource"],
  fn: client.api.resource.get,
});

// POST / PUT / DELETE → mutationOptions
const createResource = treatyMutationOptions({
  fn: client.api.resource.post,
});

// Parameterised routes — bind params first
const updateResource = treatyMutationOptions({
  fn: client.api.resource({ id: "some-id" }).put,
});
```

Then use them with React Query as usual:

```tsx
const { data } = useQuery(resourceQuery);
const mutation = useMutation(createResource);

mutation.mutate({ name: "New item" }); // fully typed input
```

Works with `prefetchQuery`, `ensureQueryData`, `useSuspenseQuery`, etc.

You can also pass any standard React Query options alongside `fn`:

```ts
const resourceQuery = treatyQueryOptions({
  queryKey: ["resource"],
  fn: client.api.resource.get,
  refetchInterval: 1000,
});

const createResource = treatyMutationOptions({
  fn: client.api.resource.post,
  onSuccess: () => console.log("created!"),
});
```

## API

**`treatyQueryOptions({ queryKey, fn, ...queryOptions })`** — wraps an Eden GET function into `queryOptions`. Accepts all `queryOptions` fields except `queryFn`. Extracts `data` from the response and throws on `error`.

**`treatyMutationOptions({ fn, ...mutationOptions })`** — wraps an Eden mutation function into `mutationOptions`. Accepts all `mutationOptions` fields except `mutationFn` (e.g. `onSuccess`, `onSettled`, `onMutate`). The `mutate` call accepts the same input the Eden function expects.

Both infer data, error, and input types end-to-end from your Elysia route definitions. No manual generics needed.

## License

MIT
