// Strip credentials from error text before it is stored, logged or emailed.
// Browserless puts the access token in the websocket URL, and that URL is
// often part of the connection error.

/** One line, with websocket URLs and secret query values removed. */
export function redactSecrets(value) {
  return String(value ?? '')
    .replace(/wss?:\/\/\S+/gi, 'wss://[redacted]')
    .replace(/((?:token|api[_-]?key|key|secret|password)=)[^&\s]+/gi, '$1***')
    .replace(/\b(Bearer\s+)\S+/gi, '$1***')
    .split('\n')[0]
    .slice(0, 300);
}
