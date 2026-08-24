import { describe, expect, it, vi } from "vitest";
import { createSpareParts } from "../src";
describe("modular client", () => {
  it("does nothing until a module is explicitly registered", async () => { const client=createSpareParts(); await client.activate(); expect(document.body.childElementCount).toBe(0); });
  it("isolates module failures and disposes healthy modules", async () => { const dispose=vi.fn(),client=createSpareParts(); client.register({id:"broken",activate(){throw new Error("nope")},dispose(){}});client.register({id:"healthy",activate(){},dispose});await client.activate();await client.dispose();expect(dispose).toHaveBeenCalledOnce(); });
});
