import { Effect } from "effect";
import { describe, it, vi, expect } from "vitest";
import { withToast } from "@/lib/atoms/with-toast";

vi.mock("sonner", () => ({
  toast: {
    loading: vi.fn(() => "toast-id"),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("withToast", () => {
  it("shows loading toast and success on effect success", async () => {
    const { toast } = await import("sonner");
    const effect = Effect.succeed("result");

    const result = withToast()(effect);
    await Effect.runPromise(result);

    expect(toast.loading).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });

  it("shows loading toast and error on effect failure", async () => {
    const { toast } = await import("sonner");
    const effect = Effect.fail("error");

    const result = withToast()(effect);
    await Effect.runPromiseExit(result);

    expect(toast.loading).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });

  it("uses custom onWaiting message", async () => {
    const { toast } = await import("sonner");
    const effect = Effect.succeed("result");

    const result = withToast({ onWaiting: "Custom loading..." })(effect);
    await Effect.runPromise(result);

    expect(toast.loading).toHaveBeenCalledWith("Custom loading...");
  });

  it("uses custom onSuccess message", async () => {
    const { toast } = await import("sonner");
    const effect = Effect.succeed("result");

    const result = withToast({ onSuccess: "Custom success!" })(effect);
    await Effect.runPromise(result);

    expect(toast.success).toHaveBeenCalledWith("Custom success!", {
      id: "toast-id",
    });
  });

  it("uses custom onFailure message", async () => {
    const { toast } = await import("sonner");
    const effect = Effect.fail("error");

    const result = withToast({ onFailure: "Custom failure!" })(effect);
    await Effect.runPromiseExit(result);

    expect(toast.error).toHaveBeenCalledWith("Custom failure!", {
      id: "toast-id",
    });
  });

  it("resolves function-based messages with args", async () => {
    const { toast } = await import("sonner");
    const effect = Effect.succeed("result");

    const result = withToast({
      onWaiting: (name: string) => `Loading ${name}...`,
    })(effect, "test");
    await Effect.runPromise(result);

    expect(toast.loading).toHaveBeenCalledWith("Loading test...");
  });
});
