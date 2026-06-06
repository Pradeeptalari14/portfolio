#!/bin/bash

# ==============================================================================
# Cloud-Native SRE Configurations Backup Script
# Copyright (c) 2026 Talari Pradeep. All rights reserved.
# ==============================================================================

set -euo pipefail

# Configurations
BACKUP_DIR="/var/backups/portfolio"
SRC_DIR="/usr/share/nginx/html" # default source to capture static assets
CONF_DIR="/etc/nginx"           # default configuration to capture
RETENTION_DAYS=7

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/portfolio_backup_${TIMESTAMP}.tar.gz"

log_info() {
    echo -e "[$(date +'%Y-%m-%dT%H:%M:%S%z')] [INFO] $*"
}

log_error() {
    echo -e "[$(date +'%Y-%m-%dT%H:%M:%S%z')] [ERROR] $*" >&2
}

# Ensure destination directory exists
if [ ! -d "${BACKUP_DIR}" ]; then
    log_info "Creating backup destination folder: ${BACKUP_DIR}"
    mkdir -p "${BACKUP_DIR}"
fi

# Run Backup Task
log_info "Initiating system configuration and assets assets backup sweep..."

if tar -czf "${BACKUP_FILE}" -C "${CONF_DIR}" . -C "${SRC_DIR}" . 2>/dev/null; then
    log_info "Backup successfully created: ${BACKUP_FILE}"
    chmod 600 "${BACKUP_FILE}"
else
    log_error "Compression task failed during file tarball package creation."
    exit 1
fi

# Retention Cleanup (purgers files older than RETENTION_DAYS)
log_info "Executing local backup retention checks (purgers older than ${RETENTION_DAYS} days)..."
find "${BACKUP_DIR}" -name "portfolio_backup_*.tar.gz" -type f -mtime +"${RETENTION_DAYS}" -exec rm -f {} \;
log_info "Retention cleanup sweep successfully complete."
