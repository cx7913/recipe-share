#!/bin/sh
set -e

echo "🔄 Generating Prisma Client..."
pnpm --filter @recipe-share/api db:generate

echo "🔄 Running database migrations..."
pnpm --filter @recipe-share/api db:migrate:prod

echo "🌱 Seeding database..."
pnpm --filter @recipe-share/api db:seed || echo "Seed may have already run or failed non-critically"

echo "🚀 Starting development server..."
exec pnpm --filter @recipe-share/api dev
