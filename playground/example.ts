import { treaty } from "@elysiajs/eden";
import Elysia, { t } from "elysia";
import { treatyMutationOptions, treatyQueryOptions, type InferTreatyMutationOptions } from "../src";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";

const Input = t.Object({
  name: t.String(),
});

const GetResponse = t.Object({
  message: t.String(),
});

const ErrorResponse = t.Object({
  oops: t.String(),
});

// building server
const app = new Elysia({ prefix: "/api" })
  .get(
    "/resource",
    ({ status, query }) => {
      return status(200, { message: `Hello World ${query.q}` });
    },
    {
      query: t.Object({ q: t.String() }),
      response: {
        200: GetResponse,
        400: ErrorResponse,
      },
    },
  )
  .post(
    "/resource",
    ({ status, body }) => {
      return status(200, { message: `Hello ${body.name}` });
    },
    {
      body: Input,
      query: t.Object({ q: t.String() }),
      response: {
        200: GetResponse,
        400: ErrorResponse,
      },
    },
  )
  .put(
    "/resource/:id",
    ({ status, params }) => {
      return status(200, { message: `Hello World ${params.id}` });
    },
    {
      body: t.Object({ name: t.String() }),
      response: {
        200: GetResponse,
        400: ErrorResponse,
      },
    },
  )
  .delete(
    "/resource/:id",
    ({ status, params }) => {
      return status(200, { message: `Hello World ${params.id}` });
    },
    {
      response: {
        200: GetResponse,
        400: ErrorResponse,
      },
    },
  );

// building client
const client = treaty<typeof app>("DUMMY");

// building options
const getOptions = treatyQueryOptions(
  () => client.api.resource.get({ query: { q: "hello" } }),
  {
    queryKey: ["resource"],
    refetchInterval: 1000,
  },
);

// Treaty uses (body, options); wrap in a single-arg function for treatyMutationOptions
const postOptions = treatyMutationOptions(
  (vars: { body: { name: string }; query: { q: string } }) => {
    return client.api.resource.post(vars.body, { query: vars.query });
  },
  {
    onSuccess: () => {
      console.log("Success");
    },
  },
);

const putOptions = treatyMutationOptions(
  client.api.resource({ id: "dummy" }).put,
  {
    onSettled: () => {
      console.log("Settled");
    },
  },
);

const deleteOptions = treatyMutationOptions(
  () => client.api.resource({ id: "dummy" }).delete(),
  {
    onMutate: () => {
      console.log("Mutate");
    },
  },
);

// Example: Prefetching
const queryClient = new QueryClient();
queryClient.prefetchQuery(getOptions);

// Example: Query
const getQuery = useQuery({
  ...getOptions,
  enabled: false,
});

// Example: Mutation
const postMutation = useMutation(postOptions);
postMutation.mutate({
  body: { name: "World" },
  query: { q: "hello" },
});
const putMutation = useMutation(putOptions);
putMutation.mutate({
  name: "World",
});
const deleteMutation = useMutation(deleteOptions);
deleteMutation.mutate();