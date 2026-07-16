import { MINIGAME } from 'cc/env';
import { BaseWsClient } from 'tsrpc-base-client';
import { WsClient as WsClientBrowser } from 'tsrpc-browser';
import { WsClient as WsClientMiniapp } from 'tsrpc-miniapp';
import { TsrpcServerUrl } from '../../env';
import Singleton from '../../Framework/Utils/Singleton';
import Unit from '../Actor/Unit';
import { EInputType, IClientInput, IGameSystemState } from '../Share/Define';
import { GameSystem } from '../Share/GameSystem';
import { deepClone } from '../Share/Utils';
import { MsgClientInput } from '../Share/protocols/client/MsgClientInput';
import { MsgFrame } from '../Share/protocols/server/MsgFrame';
import { serviceProto, ServiceType } from '../Share/protocols/serviceProto';

export class GameManager extends Singleton<GameManager>() {
    public gameSystem: GameSystem = null;
    public myPlayerId = 0;
    public actorMap: Map<number, Unit> = null;
    public client: BaseWsClient<ServiceType> = null;

    private lastServerState: IGameSystemState = null;
    private lastSn = 0;
    private pendingInputMessages: MsgClientInput[] = [];
    private active = false;
    private joining: Promise<boolean> | null = null;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    public async init(): Promise<void> {
        await this.clear();
        this.gameSystem = new GameSystem();
        this.lastServerState = deepClone(this.gameSystem.state as IGameSystemState);
        this.myPlayerId = 0;
        this.lastSn = 0;
        this.pendingInputMessages = [];
        this.actorMap = new Map();
        this.active = true;

        const ClientClass = MINIGAME ? WsClientMiniapp : WsClientBrowser;
        this.client = new ClientClass(serviceProto, {
            server: TsrpcServerUrl,
            json: true,
            heartbeat: {
                interval: 1000,
                timeout: 5000,
            },
        });
        this.client.listenMsg('server/Frame', message => {
            this.handleServerFrame(message);
        });
        this.client.flows.postDisconnectFlow.push(flow => {
            this.myPlayerId = 0;
            this.pendingInputMessages = [];
            if (this.active && !flow.isManual) {
                this.scheduleReconnect();
            }
            return flow;
        });
    }

    public async join(): Promise<boolean> {
        if (this.joining) {
            return this.joining;
        }
        this.joining = this.joinUntilSuccess();
        try {
            return await this.joining;
        } finally {
            this.joining = null;
        }
    }

    public sendClientInput(input: IClientInput): void {
        if (!this.client?.isConnected || this.myPlayerId <= 0) {
            return;
        }

        const message: MsgClientInput = {
            sn: ++this.lastSn,
            inputs: [input],
        };
        this.pendingInputMessages.push(message);
        void this.client.sendMsg('client/ClientInput', message);

        this.gameSystem.applyInput({
            ...input,
            actorId: this.myPlayerId,
        });
    }

    public localTimePast(dt: number): void {
        if (this.myPlayerId <= 0 || dt <= 0) {
            return;
        }
        this.gameSystem.applyInput({
            type: EInputType.TimePast,
            dt,
        });
    }

    /** 获取当前控制的角色 */
    public getUserActor() {
        return this.gameSystem?.state.actors.find(actor => actor.id === this.myPlayerId);
    }

    public async clear(): Promise<void> {
        this.active = false;
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.client) {
            await this.client.disconnect();
        }
        this.client = null;
        this.gameSystem = null;
        this.lastServerState = null;
        this.myPlayerId = 0;
        this.lastSn = 0;
        this.pendingInputMessages = [];
        this.actorMap = null;
    }

    private async joinUntilSuccess(): Promise<boolean> {
        while (this.active) {
            const client = this.client;
            if (!client) {
                return false;
            }

            if (!client.isConnected) {
                const connectResult = await client.connect();
                if (!connectResult.isSucc) {
                    await this.wait(2000);
                    continue;
                }
            }

            if (!this.active || this.client !== client) {
                return false;
            }

            const result = await client.callApi('Join', {});
            if (!result.isSucc) {
                await this.wait(2000);
                continue;
            }

            this.gameSystem.reset(result.res.gameState);
            this.lastServerState = deepClone(result.res.gameState);
            this.myPlayerId = result.res.actorId;
            this.lastSn = 0;
            this.pendingInputMessages = [];
            return true;
        }
        return false;
    }

    private handleServerFrame(frame: MsgFrame): void {
        if (!this.lastServerState || this.myPlayerId <= 0) {
            return;
        }

        this.gameSystem.reset(this.lastServerState);
        frame.inputs.forEach(input => this.gameSystem.applyInput(input));
        this.lastServerState = deepClone(this.gameSystem.state as IGameSystemState);

        const lastSn = frame.lastSn ?? 0;
        this.pendingInputMessages = this.pendingInputMessages.filter(
            message => message.sn > lastSn,
        );
        this.pendingInputMessages.forEach(message => {
            message.inputs.forEach(input => {
                this.gameSystem.applyInput({
                    ...input,
                    actorId: this.myPlayerId,
                });
            });
        });
    }

    private scheduleReconnect(): void {
        if (this.reconnectTimer) {
            return;
        }
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            void this.join();
        }, 2000);
    }

    private wait(milliseconds: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }
}
