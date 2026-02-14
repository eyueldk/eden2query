import type { Treaty } from "@elysiajs/eden";
import {
  mutationOptions,
  queryOptions,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

type TreatyResponse = Record<number, unknown>;

export type TreatyFunctionWithoutParams<
  TResponse extends TreatyResponse = TreatyResponse,
> = () => Promise<Treaty.TreatyResponse<TResponse>>;

export type TreatyFunctionWithParams<
  TParams,
  TResponse extends TreatyResponse,
> = (params: TParams) => Promise<Treaty.TreatyResponse<TResponse>>;

export type TreatyData<TResponse extends TreatyResponse> =
  Treaty.TreatyResponse<TResponse>["data"];

export type TreatyError<TResponse extends TreatyResponse> =
  Treaty.TreatyResponse<TResponse>["error"];

export type TreatyMutationOptions<
  TVariables,
  TResponse extends TreatyResponse,
> = UseMutationOptions<
  TreatyData<TResponse>,
  TreatyError<TResponse>,
  TVariables
>;

export type TreatyQueryOptions<TResponse extends Record<number, unknown>> =
  UseQueryOptions<TreatyData<TResponse>, TreatyError<TResponse>>;

export type InferTreatyResponse<
  T extends TreatyFunctionWithParams<any, any> | TreatyFunctionWithoutParams<any>
> = (
  Awaited<ReturnType<T>> extends Treaty.TreatyResponse<infer TResponse> 
  ? TResponse : never
);

export type InferTreatyVariables<
  T extends TreatyFunctionWithParams<any, any> | TreatyFunctionWithoutParams<any>
> = (
  Parameters<T>[0] extends void ? void : Parameters<T>[0]
);

export type InferTreatyMutationOptions<
  T extends TreatyFunctionWithParams<any, any> | TreatyFunctionWithoutParams<any>
> = (
  Awaited<ReturnType<T>> extends Treaty.TreatyResponse<infer TResponse> 
  ? TreatyMutationOptions<InferTreatyVariables<T>, TResponse> : never
);

export type InferTreatyQueryOptions<
  T extends TreatyFunctionWithoutParams<any>
> = (
  Awaited<ReturnType<T>> extends Treaty.TreatyResponse<infer TResponse> 
  ? TreatyQueryOptions<TResponse> : never
);

export function treatyMutationOptions<TResponse extends TreatyResponse>(
  fn: TreatyFunctionWithoutParams<TResponse>,
  options?: Omit<TreatyMutationOptions<void, TResponse>, "mutationFn">,
): TreatyMutationOptions<void, TResponse>;
export function treatyMutationOptions<
  TVariables,
  TResponse extends TreatyResponse,
>(
  fn: TreatyFunctionWithParams<TVariables, TResponse>,
  options?: Omit<TreatyMutationOptions<TVariables, TResponse>, "mutationFn">,
): TreatyMutationOptions<TVariables, TResponse>;
export function treatyMutationOptions<
  TVariables,
  TResponse extends TreatyResponse,
>(
  fn:
    | TreatyFunctionWithoutParams<TResponse>
    | TreatyFunctionWithParams<TVariables, TResponse>,
  options?: Omit<TreatyMutationOptions<TVariables, TResponse>, "mutationFn">,
): TreatyMutationOptions<TVariables, TResponse> {
  type TData = TreatyData<TResponse>;
  type TError = TreatyError<TResponse>;
  return mutationOptions<TData, TError, TVariables>({
    ...options,
    mutationFn: async (variables) => {
      const response = await (
        fn.length === 0 ? (fn as () => Promise<Treaty.TreatyResponse<TResponse>>)() : (fn as TreatyFunctionWithParams<TVariables, TResponse>)(variables)
      );
      const { data, error } = response;
      if (error) throw error;
      return data;
    },
  });
}

export function treatyQueryOptions<
  TResponse extends TreatyResponse = TreatyResponse,
>(
  fn: TreatyFunctionWithoutParams<TResponse>,
  options: Omit<TreatyQueryOptions<TResponse>, "queryFn">,
): TreatyQueryOptions<TResponse> {
  type TData = TreatyData<TResponse>;
  type TError = TreatyError<TResponse>;
  return queryOptions<TData, TError>({
    ...options,
    queryFn: async () => {
      const response = await fn();
      const { data, error } = response;
      if (error) throw error;
      return data;
    },
  });
}