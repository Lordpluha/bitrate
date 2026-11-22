# Local Kubernetes cluster (k3d)

The whole stack on a single-node [k3d](https://k3d.io) cluster, built from the production
Dockerfiles. Local only: production still runs `infra/docker-compose.prod.yaml`.

```sh
cp infra/k8s/.env.example infra/k8s/.env   # once; dev-only values
task k8s:cluster                           # create the cluster (port 80 on the host)
task k8s:build                             # build the app images and import them
task k8s:up                                # kubectl apply -k infra/k8s
```

| URL | Service |
|---|---|
| http://bitrate.localhost | web-player |
| http://api.bitrate.localhost | api |
| http://artists.bitrate.localhost | web-artists |
| http://admin.bitrate.localhost | admin + admin-api |
| http://mail.bitrate.localhost | Mailpit — every email the stack sends |

After a rebuild: `task k8s:build && task k8s:restart`. Remove everything: `task k8s:down`.

- The images run with `NODE_ENV=production`, so mail must be configured: it goes to Mailpit.
- Every container sets CPU/memory requests and limits; CPU is written as `"1"` rather than
  `1000m` because the API server normalises it, and `kubectl apply` would otherwise report a
  change on every run.
- Every pod runs as a non-root user with a read-only root filesystem, no privilege escalation,
  no capabilities and the `RuntimeDefault` seccomp profile; the paths a process writes to
  (`/tmp`, caches, sockets) are `emptyDir` volumes. A new workload needs the same, or Trivy's
  IaC scan in CI fails the pull request.
- `migrate` and `seaweedfs-init` are Jobs, whose pod template cannot change in place. If an
  apply fails on them: `kubectl -n bitrate delete job migrate seaweedfs-init`, then apply again.
- Backups (CronJobs to an S3 target, R2 in production): [backup/README.md](backup/README.md).
