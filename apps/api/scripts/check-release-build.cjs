const assert = require('node:assert/strict')
const path = require('node:path')
require('reflect-metadata')

// Load compiled CommonJS in plain Node: ts-jest would hide invalid runtime imports.
// No AppModule, env-file loading, provider instantiation or database connection.
const buildRoot = path.resolve(process.argv[2] ?? path.join(__dirname, '../dist/src'))
const { ReleasesController } = require(
  path.join(buildRoot, 'modules/releases/releases.controller.js'),
)
const { ReleasesService } = require(path.join(buildRoot, 'modules/releases/releases.service.js'))
const { ReleaseEntity } = require(
  path.join(buildRoot, 'modules/releases/entities/release.entity.js'),
)
const { ArtistMusicController } = require(
  path.join(buildRoot, 'modules/releases/artist-music.controller.js'),
)
const { ArtistMusicService } = require(
  path.join(buildRoot, 'modules/releases/artist-music.service.js'),
)

assert.equal(typeof ReleasesController, 'function')
assert.deepEqual(Reflect.getMetadata('design:paramtypes', ReleasesController), [ReleasesService])
assert.deepEqual(Reflect.getMetadata('design:paramtypes', ArtistMusicController), [
  ArtistMusicService,
])
const createResponses = Reflect.getMetadata(
  'swagger/apiResponse',
  ReleasesController.prototype.createDraft,
)
assert.equal(createResponses[201].type, ReleaseEntity)
for (const method of ['findOne', 'updateDraft']) {
  const responses = Reflect.getMetadata('swagger/apiResponse', ReleasesController.prototype[method])
  assert.equal(responses[200].type, ReleaseEntity)
  assert.ok(responses[404])
}
assert.ok(Reflect.getMetadata('swagger/apiResponse', ReleasesController.prototype.updateDraft)[409])
const { ReleaseWorkspaceEntity } = require(
  path.join(buildRoot, 'modules/releases/entities/release-workspace.entity.js'),
)
const workspaceResponses = Reflect.getMetadata(
  'swagger/apiResponse',
  ReleasesController.prototype.workspace,
)
assert.equal(workspaceResponses[200].type, ReleaseWorkspaceEntity)
assert.ok(workspaceResponses[404])
const { ReleaseContributorAddedEntity } = require(
  path.join(buildRoot, 'modules/releases/entities/release-contributor-added.entity.js'),
)
const contributorResponses = Reflect.getMetadata(
  'swagger/apiResponse',
  ReleasesController.prototype.addContributor,
)
assert.equal(contributorResponses[201].type, ReleaseContributorAddedEntity)
assert.ok(contributorResponses[404])
assert.ok(contributorResponses[409])
const { ReleaseContributorEntity } = require(
  path.join(buildRoot, 'modules/releases/entities/release-contributor.entity.js'),
)
for (const method of ['contributor', 'updateContributor']) {
  const responses = Reflect.getMetadata('swagger/apiResponse', ReleasesController.prototype[method])
  assert.equal(responses[200].type, ReleaseContributorEntity)
  assert.ok(responses[404])
}
assert.ok(
  Reflect.getMetadata('swagger/apiResponse', ReleasesController.prototype.updateContributor)[409],
)
const listResponses = Reflect.getMetadata(
  'swagger/apiResponse',
  ReleasesController.prototype.findAll,
)
assert.equal(
  listResponses[200].schema.properties.data.items.$ref,
  '#/components/schemas/ReleaseEntity',
)
console.log('PASS: compiled release controller loads in Node with usable DI and Swagger metadata.')
