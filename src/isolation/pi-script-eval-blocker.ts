export interface EvalBlockHandle {
  restore(): void;
}

interface MutableEvalScope {
  eval: ((source: string) => unknown) | undefined;
}

/**
 * Disables eval within a target scope to prevent arbitrary code execution.
 */
export function blockEvalInScope(
  scope: MutableEvalScope = globalThis as MutableEvalScope
): EvalBlockHandle {
  const originalEval = scope.eval;

  try {
    scope.eval = () => {
      throw new Error('eval() is disabled by Pi script execution policy.');
    };
  } catch {
    // If eval cannot be reassigned, caller still gets restore handle.
  }

  return {
    restore(): void {
      try {
        scope.eval = originalEval;
      } catch {
        // Ignore restore failure.
      }
    }
  };
}
