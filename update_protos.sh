#!/usr/bin/env bash
cd packages/proto/src/proto/ 
git pull origin main 
cd ../.. 
pnpm i 
pnpm compile 
pnpm format 
pnpm lint 
cd ../.. 
pnpm add link:packages/proto 
pnpm add link:packages/proto 
pnpm i 
pnpm compile 
pnpm format 
pnpm lint
