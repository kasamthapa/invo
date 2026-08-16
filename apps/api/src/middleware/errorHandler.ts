import { Request, Response, NextFunction } from 'express'

/**
 * Catches requests to routes that don't exist and returns a consistent
 * JSON shape instead of Express's default HTML 404 page — the frontend's
 * apiFetch() always expects JSON.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` })
}

/**
 * Last-resort error handler. Catches anything that wasn't handled by a
 * controller's own try/catch — malformed JSON bodies from express.json(),
 * synchronous throws in middleware, etc. — and always responds with JSON
 * instead of letting Express fall back to an HTML error page.
 */
export function globalErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (res.headersSent) return

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: 'Malformed JSON body' })
    return
  }

  console.error(`[unhandled] ${req.method} ${req.path}`, err)
  res.status(500).json({ error: 'Internal server error' })
}
