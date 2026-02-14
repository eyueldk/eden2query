# eden2query

Type-safe [Eden Treaty](https://elysiajs.com/eden/overview) to [React Query](https://tanstack.com/query) helpers. Two functions, zero runtime dependencies.

## Install

```bash
bun add eden2query @elysiajs/eden @tanstack/react-query
```

## Usage

**Queries (GET)** — pass a thunk that calls the Treaty GET:

```ts
const getOptions = treatyQueryOptions(
  () => client.api.resource.get({ query: { q: "hello" } }),
  { queryKey: ["resource"], refetchInterval: 1000 },
);
```

**Mutations with variables (POST, PUT, etc.)** — pass a function that receives the mutation input, or a bound Treaty method:

```ts
// Wrapper when Treaty uses (body, options)
const postOptions = treatyMutationOptions(
  (vars: { body: { name: string }; query: { q: string } }) =>
    client.api.resource.post(vars.body, { query: vars.query }),
  { onSuccess: () => console.log("Success") },
);

// Parameterised routes — bind params first
const putOptions = treatyMutationOptions(
  client.api.resource({ id: "dummy" }).put,
  { onSettled: () => console.log("Settled") },
);
```

**Mutations without variables (e.g. DELETE with fixed params)** — pass a no-argument function; `mutate()` is then called with no args:

```ts
const deleteOptions = treatyMutationOptions(
  () => client.api.resource({ id: "dummy" }).delete(),
  { onMutate: () => console.log("Mutate") },
);
```

Use with React Query as usual:

```tsx
const { data } = useQuery(getOptions);

const postMutation = useMutation(postOptions);
postMutation.mutate({ body: { name: "World" }, query: { q: "hello" } });

const putMutation = useMutation(putOptions);
putMutation.mutate({ name: "World" });

const deleteMutation = useMutation(deleteOptions);
deleteMutation.mutate(); // no arguments
```

Prefetch and other helpers work as usual:

```ts
const queryClient = new QueryClient();
queryClient.prefetchQuery(getOptions);
```

## API

**`treatyQueryOptions(fn, queryOptions)`** — wraps a Treaty GET call into `queryOptions`. `fn` is a **thunk** (zero-argument function) that calls the Treaty GET, e.g. `() => client.api.resource.get({ query: { ... } })`. The second argument accepts all `queryOptions` fields except `queryFn`. Extracts `data` from the response and throws on `error`.

**`treatyMutationOptions(fn, mutationOptions?)`** — wraps a Treaty mutation into `mutationOptions`. Two shapes:

- **No-arg:** `fn` is `() => Promise<...>`. Use when the mutation has no call-time input (e.g. DELETE with fixed path params). `mutate()` is called with no arguments.
- **With variables:** `fn` is `(vars) => Promise<...>`. Use for POST/PUT etc. `mutate(vars)` receives a single object (e.g. `{ body, query }` or the Treaty method’s first argument). You can pass the Treaty method directly when its signature matches (e.g. `client.api.resource({ id }).put`).

The optional second argument accepts all `mutationOptions` fields except `mutationFn` (e.g. `onSuccess`, `onSettled`, `onMutate`).

**`InferTreatyQueryOptions<T>`** — full `UseQueryOptions` type for a given Treaty query.

**`InferTreatyMutationOptions<TVariables, TResponse>`** — full `UseMutationOptions` type for a given Treaty mutation.

Data, error, and input types are inferred end-to-end from your Elysia route definitions.

## License

MIT
