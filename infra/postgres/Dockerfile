# PostgreSQL with the pgvector extension, used by every environment (dev, preprod, CI, prod).
#
# Built on the same postgres:16-alpine base the databases already run on, not on the upstream
# pgvector/pgvector image: that one is Debian (glibc), and attaching an existing alpine (musl)
# data directory to a glibc server changes text collation under the existing btree indexes
# (email, username, slug), which silently corrupts lookups until a full REINDEX. Staying on
# musl keeps every existing volume valid. See ADR-0071.
FROM postgres:16-alpine

ARG PGVECTOR_VERSION=0.8.7
ARG PGVECTOR_SHA256=cac0b10c360f05b2d521200105ba3697e773d4cd3731f5a915a7e37ebe0bea85

# OPTFLAGS="" drops pgvector's default -march=native, so an image built on a CI runner also
# runs on a host with an older CPU. with_llvm=no skips the JIT bitcode, which would otherwise
# need the exact clang/llvm version the base image's server was compiled with.
RUN set -eux; \
    apk add --no-cache --virtual .pgvector-build build-base; \
    wget -q -O /tmp/pgvector.tar.gz \
      "https://github.com/pgvector/pgvector/archive/refs/tags/v${PGVECTOR_VERSION}.tar.gz"; \
    echo "${PGVECTOR_SHA256}  /tmp/pgvector.tar.gz" | sha256sum -c -; \
    mkdir /tmp/pgvector; \
    tar -xzf /tmp/pgvector.tar.gz -C /tmp/pgvector --strip-components=1; \
    make -C /tmp/pgvector OPTFLAGS="" with_llvm=no; \
    make -C /tmp/pgvector OPTFLAGS="" with_llvm=no install; \
    rm -rf /tmp/pgvector /tmp/pgvector.tar.gz; \
    apk del --no-network .pgvector-build
