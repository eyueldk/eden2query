import type { Treaty } from "@elysiajs/eden";
import { mutationOptions, queryOptions, type UseMutationOptions } from "@tanstack/react-query";

type EdenFn<I = any, T extends Record<number, unknown> = Record<number, unknown>> = (input: I) => Promise<Treaty.TreatyResponse<T>>;

export function treatyMutationOptions<
  T extends EdenFn,
  P extends Parameters<T>,
  R extends Awaited<ReturnType<T>>
>(params: {
  fn: T,
} & Omit<
  Parameters<typeof mutationOptions<R["data"], R["error"], P[0]>>[0], 
  "mutationFn"
>) {
  return mutationOptions<R["data"], R["error"], P[0]>({
    mutationFn: async (variables) => {
      const response = await params.fn(variables);
      const { data, error } = response;
      if (error) {
        throw error;
      }
      return data;
    },
    ...params,
  });
}

export function treatyQueryOptions<
  T extends EdenFn,
  P extends Parameters<T>,
  R extends Awaited<ReturnType<T>>
>(params: {
  queryKey: string[];
  fn: T
} & Omit<
  Parameters<typeof queryOptions<R["data"], R["error"], P[0]>>[0], 
  "queryFn"
>) {
  return queryOptions<R["data"], R["error"], P[0]>({
    queryKey: params.queryKey,
    queryFn: async (variables) => {
      const { data, error } = await params.fn(variables);
      if (error) {
        throw error;
      }
      return data;
    }
  });
}
