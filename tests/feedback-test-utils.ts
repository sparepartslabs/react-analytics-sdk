import { vi } from "vitest";

export function imageFile(name = "screen.png", type = "image/png", size = 128): File {
  return new File([new Uint8Array(size)], name, { type });
}

export function installObjectUrlSpies() {
  const create = vi.fn((file: Blob) => `blob:test-${file.size}-${Math.random()}`);
  const revoke = vi.fn();
  Object.defineProperty(URL, "createObjectURL", { configurable: true, value: create });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revoke });
  return { create, revoke };
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}
