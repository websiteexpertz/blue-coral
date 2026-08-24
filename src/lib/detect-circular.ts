function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function findCircularPaths(obj: unknown): string[] {
  const paths: string[] = [];
  const seen = new WeakMap<object, string>();

  function walk(value: unknown, path: string) {
    if (!value || typeof value !== 'object') {
      return;
    }

    if (value instanceof Map || value instanceof Set || value instanceof Date || value instanceof RegExp) {
      return;
    }

    const asObj = value as object;
    if (seen.has(asObj)) {
      paths.push(`${path} -> ${seen.get(asObj)}`);
      return;
    }
    seen.set(asObj, path);

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        try {
          walk(value[i], `${path}[${i}]`);
        } catch {
          // ignore
        }
      }
      return;
    }

    if (!isPlainObject(value)) {
      return;
    }

    for (const key of Object.keys(asObj)) {
      try {
        // @ts-ignore index
        walk((asObj as any)[key], `${path}.${key}`);
      } catch {
        // ignore
      }
    }
  }

  try {
    walk(obj, 'root');
  } catch {
    // best-effort only
  }

  return paths;
}
