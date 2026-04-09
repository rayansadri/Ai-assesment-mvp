#!/bin/bash
export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export NODE_PATH="/opt/homebrew/lib/node_modules"
exec /opt/homebrew/Cellar/node/25.2.1/bin/node node_modules/.bin/next dev
