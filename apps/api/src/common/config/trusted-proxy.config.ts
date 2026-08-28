/**
 * Express must not trust forwarded headers unless the deployment declares the
 * exact number of network-isolated proxy hops in front of the API.
 */
export const resolveTrustProxySetting = (trustedHops: number): false | number =>
  trustedHops === 0 ? false : trustedHops
