import { treaty } from "@elysiajs/eden";
import Elysia, { t } from "elysia";
import { treatyMutationOptions, treatyQueryOptions } from "../src";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";

const Input = t.Object({
  name: t.String()
});

const GetResponse = t.Object({
  message: t.String()
});

const ErrorResponse = t.Object({
  oops: t.String()
});

// building server
const app = new Elysia({ prefix: "/api" })
  .get("/resource", ({ status }) => {
    return status(200, { message: "Hello World" });
  }, {
    response: {
      200: GetResponse,
      400: ErrorResponse,
    }
  })
  .post("/resource", ({ status, body }) => {
    return status(200, { message: `Hello ${body.name}` });
  }, {
    body: Input,
    response: {
      200: GetResponse,
      400: ErrorResponse,
    }
  })
  .put("/resource/:id", ({ status, params }) => {
    return status(200, { message: `Hello World ${params.id}` });
  }, {
    response: {
      200: GetResponse,
      400: ErrorResponse,
    }
  })
  .delete("/resource/:id", ({ status, params }) => {
    return status(200, { message: `Hello World ${params.id}` });
  }, {
    response: {
      200: GetResponse,
      400: ErrorResponse,
    }
  });

// building client
const client = treaty<typeof app>("DUMMY");

// building options
const getOptions = treatyQueryOptions({
  queryKey: ["resource"],
  fn: client.api.resource.get,
  refetchInterval: 1000
});
const postOptions = treatyMutationOptions({
  fn: client.api.resource.post,
  onSuccess: () => {
    console.log("Success");
  }
});
const putOptions = treatyMutationOptions({
  fn: client.api.resource({ id: "dummy" }).put,
  onSettled: () => {
    console.log("Settled");
  }
});
const deleteOptions = treatyMutationOptions({
  fn: client.api.resource({ id: "dummy" }).delete,
  onMutate: () => {
    console.log("Mutate");
  }
});


// Example: Prefetching
const queryClient = new QueryClient();
queryClient.prefetchQuery(getOptions);

// Example: Query
const getQuery = useQuery(getOptions);

// Example: Mutation
const postMutation = useMutation(postOptions);
postMutation.mutate({ name: "World" });
const putMutation = useMutation(putOptions);
const deleteMutation = useMutation(deleteOptions);