import { Cause, Effect, type Option } from "effect";
import { toast } from "sonner";

type ToastOptions<A, E, Args extends ReadonlyArray<unknown>> = {
  readonly onWaiting?: string | ((...args: Args) => string);
  readonly onSuccess?: string | ((a: A, ...args: Args) => string);
  readonly onFailure?:
    | string
    | ((error: Option.Option<E>, ...args: Args) => string);
};

const defaults = {
  onWaiting: "Working...",
  onSuccess: "Done",
  onFailure: "Something went wrong",
} as const;

export const withToast =
  <A, E, Args extends ReadonlyArray<unknown> = readonly []>(
    options: ToastOptions<A, E, Args> = {},
  ) =>
  <R>(self: Effect.Effect<A, E, R>, ...args: Args): Effect.Effect<A, E, R> => {
    const onWaiting = options.onWaiting ?? defaults.onWaiting;
    const onSuccess = options.onSuccess ?? defaults.onSuccess;
    const onFailure = options.onFailure ?? defaults.onFailure;

    const toastId = toast.loading(
      typeof onWaiting === "string" ? onWaiting : onWaiting(...args),
    );

    return self.pipe(
      Effect.tap((a) =>
        Effect.sync(() => {
          toast.success(
            typeof onSuccess === "string" ? onSuccess : onSuccess(a, ...args),
            { id: toastId },
          );
        }),
      ),
      Effect.tapCause((cause) =>
        Effect.sync(() => {
          toast.error(
            typeof onFailure === "string"
              ? onFailure
              : onFailure(Cause.findErrorOption(cause), ...args),
            { id: toastId },
          );
        }),
      ),
    );
  };
