export function generateOtp() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // NOTE: The opt will expire here after 10min.
  const expiresAt = Date.now() + 10 * 60 * 1000;

  return { otp, expiresAt };
}

export function storeOtp() {
  // TODO: Function to store generated otp on cache.
  return;
}
