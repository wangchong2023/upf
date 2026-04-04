# --- Build Stage ---
FROM golang:1.21-bullseye AS builder

# Install build dependencies for C modules (VPP/DPDK)
RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    libvppinfra-dev \
    vpp-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy source code
COPY . .

# 1. Build Control Plane (Go)
RUN go build -o upf-cp ./src/cp-core/main.go

# 2. Build Data Plane Plugins (C)
# Assuming a standard make-based build for VPP plugins
RUN make -C src/dp-vpp-plugins

# --- Runtime Stage ---
FROM debian:bullseye-slim

RUN apt-get update && apt-get install -y \
    libvppinfra \
    vpp \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /root/

# Copy binaries from builder
COPY --from=builder /app/upf-cp .
# COPY --from=builder /app/src/dp-vpp-plugins/*.so /usr/lib/vpp_plugins/

# Entrypoint for UPF Control Plane
ENTRYPOINT ["./upf-cp"]
