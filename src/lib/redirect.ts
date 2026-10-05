// `next` parameters are only trusted when they are a same-site relative path
// (a single leading "/", no "//" or "/\") - otherwise they could be used for
// an open redirect.
export function isSafeRelativePath(value: string): boolean {
  return value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\");
}
