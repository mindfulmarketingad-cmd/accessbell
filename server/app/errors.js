/** An error whose message is safe to show to the user. */
export class AppError extends Error {
  constructor(status, message, code) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.expose = true;
  }
}

export const badRequest = (msg, code) => new AppError(400, msg, code);
export const unauthorized = (msg = 'Please sign in to continue.') => new AppError(401, msg, 'unauthorized');
export const forbidden = (msg = 'You do not have permission to do that.') => new AppError(403, msg, 'forbidden');
export const notFound = (msg = 'Not found.') => new AppError(404, msg, 'not_found');
export const paymentRequired = (msg = 'Start your free trial to use this feature.') => new AppError(402, msg, 'subscription_required');
