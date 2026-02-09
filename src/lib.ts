import type { Treaty } from "@elysiajs/eden";
import { mutationOptions, queryOptions, useQuery, type UseMutationOptions, type UseMutationResult, type UseQueryOptions } from "@tanstack/react-query";

type EdenMutationFn<
  TBody = any, 
  TOptions = any, 
  TResponse extends Record<number, unknown> = Record<number, unknown>
> = (
  (body: TBody, options: TOptions) => Promise<Treaty.TreatyResponse<TResponse>>
);

type EdenQueryFn<
  TResponse extends Record<number, unknown> = Record<number, unknown>
> = (
  () => Promise<Treaty.TreatyResponse<TResponse>>
);

type InferMutationVariables<TFn extends EdenMutationFn> = (
  unknown extends Parameters<TFn>[0]
    ? Parameters<TFn>[1]
    : Parameters<TFn>[1] & { body: Parameters<TFn>[0] }
);

export type InferMutationOptions<TFn extends EdenMutationFn> = (
  UseMutationOptions<
    Awaited<ReturnType<TFn>>["data"],
    Awaited<ReturnType<TFn>>["error"],
    InferMutationVariables<TFn>
  >
);

export type InferQueryOptions<
  TFn extends EdenQueryFn, 
> = (
  UseQueryOptions<
    Awaited<ReturnType<TFn>>["data"],
    Awaited<ReturnType<TFn>>["error"]
  >
);

export function edenMutationOptions<TFn extends EdenMutationFn>(
  fn: TFn,
  options?: Omit<InferMutationOptions<TFn>, "mutationFn">
): InferMutationOptions<TFn> {
  return mutationOptions({
    mutationFn: async (variables) => {
      const { body, ...rest } = variables;
      const response = await fn(body, rest);
      const { data, error } = response;
      if (error) throw error;
      return data;
    },
    ...options,
  });
}

export function edenQueryOptions<
  TFn extends EdenQueryFn,
>(
  fn: TFn,
  options: Omit<InferQueryOptions<TFn>, "queryFn">
): InferQueryOptions<TFn> {
  return queryOptions({
    queryFn: async () => {
      const response = await fn();
      const { data, error } = response;
      if (error) throw error;
      return data;
    },
    ...options,
  }) as InferQueryOptions<TFn>;
}