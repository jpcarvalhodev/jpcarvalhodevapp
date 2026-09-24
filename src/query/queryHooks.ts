import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { toast } from "../utils/toast";
import i18n from "../i18n";

export type StoreQueryOptions<
  TQueryFnData,
  TError = unknown,
  TData = TQueryFnData,
> = Omit<
  UseQueryOptions<TQueryFnData, TError, TData, QueryKey>,
  "queryKey" | "queryFn"
> & {
  queryKey: QueryKey;
  queryFn: () => Promise<TQueryFnData>;
};

export const useStoreQuery = <
  TQueryFnData,
  TError = unknown,
  TData = TQueryFnData,
>(
  options: StoreQueryOptions<TQueryFnData, TError, TData>,
) =>
  useQuery({
    ...options,
  });

export const toRowsData = <T = unknown>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;
  if (Array.isArray(record.data)) return record.data as T[];
  if (Array.isArray(record.rows)) return record.rows as T[];
  if (Array.isArray(record.items)) return record.items as T[];
  if (Array.isArray(record.dados)) return record.dados as T[];

  const message = record.message;
  if (message && typeof message === "object" && !Array.isArray(message)) {
    const messageRecord = message as Record<string, unknown>;
    if (Array.isArray(messageRecord.data)) return messageRecord.data as T[];
    if (Array.isArray(messageRecord.rows)) return messageRecord.rows as T[];
    if (Array.isArray(messageRecord.items)) return messageRecord.items as T[];
    if (Array.isArray(messageRecord.dados)) return messageRecord.dados as T[];
  }

  return [];
};

type InvalidateKeysResolver<TData, TVariables> =
  | QueryKey[]
  | ((data: TData, variables: TVariables) => QueryKey[]);

type SuccessMessageResolver<TData, TVariables> =
  | ((data: TData, variables: TVariables) => string | undefined)
  | undefined;

export type StoreMutationOptions<
  TData,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
> = Omit<
  UseMutationOptions<TData, TError, TVariables, TContext>,
  "mutationFn" | "onSuccess"
> & {
  mutationFn: (variables: TVariables) => Promise<TData>;
  invalidateKeys?: InvalidateKeysResolver<TData, TVariables>;
  showSuccessToast?: boolean;
  successMessageKey?: string;
  getSuccessMessage?: SuccessMessageResolver<TData, TVariables>;
  onSuccess?: UseMutationOptions<
    TData,
    TError,
    TVariables,
    TContext
  >["onSuccess"];
};

type UseStoreMutationInput<TData, TError, TVariables, TContext> =
  StoreMutationOptions<TData, TError, TVariables, TContext> & {
    defaultInvalidateKeys?: QueryKey[];
  };

export const useStoreMutation = <
  TData,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>({
  mutationFn,
  invalidateKeys,
  defaultInvalidateKeys,
  showSuccessToast = false,
  successMessageKey,
  getSuccessMessage,
  onSuccess,
  ...options
}: UseStoreMutationInput<TData, TError, TVariables, TContext>) => {
  const queryClient = useQueryClient();

  const resolveDefaultSuccessMessage = (data: unknown): string | undefined => {
    if (!data) return undefined;
    if (typeof data === "string") return data;
    if (typeof data !== "object") return undefined;

    const candidate = data as Record<string, unknown>;
    const messageKeys = ["message", "value", "mensagem"] as const;

    for (const key of messageKeys) {
      const value = candidate[key];
      if (typeof value === "string" && value.trim().length > 0) {
        return value;
      }
    }

    return undefined;
  };

  const resolveI18nSuccessMessage = (): string | undefined => {
    const key = successMessageKey ?? "contexts:operation_success";
    const translated = i18n.t(key);
    if (
      typeof translated === "string" &&
      translated.trim().length > 0 &&
      translated !== key
    ) {
      return translated;
    }
    return undefined;
  };

  return useMutation<TData, TError, TVariables, TContext>({
    ...options,
    mutationFn,
    onSuccess: async (data, variables, context, meta) => {
      const keysToInvalidate =
        typeof invalidateKeys === "function"
          ? invalidateKeys(data, variables)
          : (invalidateKeys ?? defaultInvalidateKeys ?? []);

      if (keysToInvalidate.length > 0) {
        await Promise.all(
          keysToInvalidate.map((queryKey) =>
            queryClient.invalidateQueries({ queryKey }),
          ),
        );
      }

      if (showSuccessToast) {
        const explicitI18nMessage = successMessageKey
          ? resolveI18nSuccessMessage()
          : undefined;
        const successMessage =
          getSuccessMessage?.(data, variables) ??
          resolveDefaultSuccessMessage(data) ??
          explicitI18nMessage ??
          resolveI18nSuccessMessage();

        if (successMessage) {
          toast.success(successMessage, {
            toastId: `success-${successMessage}`,
          });
        }
      }

      if (onSuccess) {
        await onSuccess(data, variables, context, meta);
      }
    },
  });
};
