const runtime = globalThis as any;
const locationLike = runtime.location as {
    hostname?: string;
    protocol?: string;
} | undefined;

const protocol = locationLike?.protocol === 'https:' ? 'wss' : 'ws';
const host = locationLike?.hostname || '127.0.0.1';

/** 可在启动游戏前通过 globalThis.TSRPC_SERVER_URL 覆盖。 */
export const TsrpcServerUrl: string = runtime.TSRPC_SERVER_URL
    || `${protocol}://${host}:3000`;
