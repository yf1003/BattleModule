import * as path from 'path';
import { WsConnection, WsServer } from 'tsrpc';
import { roomInstance } from './models/RoomInstance';
import { serviceProto, ServiceType } from './shared/protocols/serviceProto';

export const server = new WsServer(serviceProto, {
    port: Number(process.env.PORT) || 3000,
    json: true,
    heartbeatWaitTime: 10000,
    logMsg: false,
});

server.flows.postDisconnectFlow.push(flow => {
    roomInstance.leave(flow.conn as WsConnection<ServiceType>);
    return flow;
});

export async function startServer(): Promise<void> {
    await server.autoImplementApi(path.resolve(__dirname, 'api'));
    roomInstance.start();
    await server.start();
}

export async function stopServer(): Promise<void> {
    roomInstance.stop();
    await server.stop();
}

if (require.main === module) {
    void startServer();
}
