export function logError(context: string, error: unknown): void {
  const message =
    error instanceof Error ? error.message : String(error);
  const stack =
    error instanceof Error ? error.stack : undefined;

  console.error(
    JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      context,
      message,
      ...(stack && { stack }),
    })
  );
}
