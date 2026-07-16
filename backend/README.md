# BattleModule TSRPC Backend

## Local development

```bash
npm install
npm run dev
```

The WebSocket server listens on port `3000` by default. Set `PORT` to override it.
After the backend starts, open `front/` with Cocos Creator and run Web Preview.

The client derives the WebSocket host from the current page. For a deployed server
or a mini-game device, edit `front/assets/env.ts` or set
`globalThis.TSRPC_SERVER_URL` before game modules load.

## Shared code and protocols

`src/shared` is the single source of truth for deterministic battle logic and TSRPC
protocols. Run these after changing protocol files:

```bash
npm run proto
npm run sync
```

`sync` copies shared files into `front/assets/Scripts/Share`. The copy mode is
required by Cocos Creator 3.8.x so relative imports stay inside AssetDB's project
root. Edit the backend copies only; `npm run dev` and `npm run build` synchronize
them automatically.

## Verification

```bash
npm run typecheck
npm test
npm run build
```
