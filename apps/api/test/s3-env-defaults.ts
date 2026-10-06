/**
 * Points specs that boot the config schema at the development SeaweedFS (`task infra:up`, or the
 * CI service on loopback), with the dev-only application identity from the API's example
 * environment file. The S3 variables are required to boot; a value already present (CI, the
 * shell) wins.
 */
process.env.S3_ENDPOINT ??= 'http://localhost:8333'
process.env.S3_BUCKET ??= 'bitrate-audio'
process.env.S3_ACCESS_KEY ??= 'bitrateDevAccessKey'
process.env.S3_SECRET_KEY ??= 'bitrateDevSecretKeyChangeMe0001'
process.env.S3_FORCE_PATH_STYLE ??= 'true'
