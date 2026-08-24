import type { SparePartsClient, SparePartsModule } from "./module";

export function createSpareParts(): SparePartsClient {
  const modules = new Map<string, SparePartsModule>();
  let active = false;
  return {
    register(module) {
      if (modules.has(module.id)) throw new Error(`Module ${module.id} is already registered`);
      modules.set(module.id, module);
      if (active) void Promise.resolve(module.activate()).catch(() => undefined);
      return () => { if (modules.delete(module.id) && active) void Promise.resolve(module.dispose()); };
    },
    async activate() {
      if (active) return;
      active = true;
      await Promise.allSettled([...modules.values()].map((module) => Promise.resolve().then(() => module.activate())));
    },
    async dispose() {
      if (!active) return;
      active = false;
      await Promise.allSettled([...modules.values()].map((module) => Promise.resolve().then(() => module.dispose())));
    },
  };
}
