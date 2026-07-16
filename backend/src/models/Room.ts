import { WsConnection } from 'tsrpc';
import {
    EActorDir,
    EActorState,
    EActorType,
    EInputType,
    IActor,
    IActorAttack,
    IActorMove,
    IClientInput,
    IGameSystemInput,
} from '../shared/Define';
import { GameConfig } from '../shared/GameConfig';
import { GameSystem } from '../shared/GameSystem';
import { ServiceType } from '../shared/protocols/serviceProto';

/** 单全局房间：收集客户端输入并以固定频率广播权威帧。 */
export class Room {
    public readonly gameSystem = new GameSystem();

    private readonly connections: WsConnection<ServiceType>[] = [];
    private readonly pendingInputs: IGameSystemInput[] = [];
    private readonly actorLastSn = new Map<number, number>();
    private nextActorId = 1;
    private lastSyncTime = 0;
    private syncTimer: ReturnType<typeof setInterval> | undefined;

    public start(): void {
        if (this.syncTimer) {
            return;
        }
        this.lastSyncTime = Date.now() / 1000;
        this.syncTimer = setInterval(
            () => this.sync(),
            1000 / GameConfig.syncRate,
        );
    }

    public stop(): void {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = undefined;
        }
    }

    public join(connection: WsConnection<ServiceType>): number {
        if (connection.actorId) {
            return connection.actorId;
        }

        const actorId = this.nextActorId++;
        const actor = this.createActor(actorId);
        connection.actorId = actorId;
        this.connections.push(connection);

        const joinInput: IGameSystemInput = {
            type: EInputType.ActorJoin,
            actor,
        };
        this.gameSystem.applyInput(joinInput);
        this.pendingInputs.push(joinInput);

        connection.listenMsg('client/ClientInput', call => {
            this.receiveClientInput(actorId, call.msg.sn, call.msg.inputs);
        });

        return actorId;
    }

    public leave(connection: WsConnection<ServiceType>): void {
        const actorId = connection.actorId;
        if (!actorId) {
            return;
        }

        const connectionIndex = this.connections.indexOf(connection);
        if (connectionIndex >= 0) {
            this.connections.splice(connectionIndex, 1);
        }
        this.actorLastSn.delete(actorId);
        connection.actorId = undefined;

        const leaveInput: IGameSystemInput = {
            type: EInputType.ActorLeave,
            actorId,
        };
        this.gameSystem.applyInput(leaveInput);
        this.pendingInputs.push(leaveInput);
    }

    public sync(): void {
        const now = Date.now() / 1000;
        const elapsed = Math.max(0, now - (this.lastSyncTime || now));
        this.lastSyncTime = now;

        const inputs = this.pendingInputs.splice(0, this.pendingInputs.length);
        inputs.push({
            type: EInputType.TimePast,
            dt: elapsed,
        });
        inputs.forEach(input => this.gameSystem.applyInput(input));

        this.connections.forEach(connection => {
            void connection.sendMsg('server/Frame', {
                inputs,
                lastSn: connection.actorId
                    ? this.actorLastSn.get(connection.actorId)
                    : undefined,
            });
        });
    }

    private receiveClientInput(
        actorId: number,
        sn: number,
        inputs: IClientInput[],
    ): void {
        const lastSn = this.actorLastSn.get(actorId) ?? 0;
        if (!Number.isSafeInteger(sn) || sn <= lastSn) {
            return;
        }

        const sanitizedInputs = inputs
            .slice(0, 8)
            .map(input => this.sanitizeClientInput(actorId, input))
            .filter((input): input is IActorMove | IActorAttack => Boolean(input));

        this.actorLastSn.set(actorId, sn);
        this.pendingInputs.push(...sanitizedInputs);
    }

    private sanitizeClientInput(
        actorId: number,
        input: IClientInput,
    ): IActorMove | IActorAttack | undefined {
        if (input.type === EInputType.ActorAttack) {
            return {
                type: EInputType.ActorAttack,
                actorId,
            };
        }

        const { x, y } = input.moveDirection;
        if (
            !Number.isFinite(x)
            || !Number.isFinite(y)
            || !Number.isFinite(input.dt)
            || input.dt <= 0
        ) {
            return undefined;
        }

        const length = Math.sqrt(x * x + y * y);
        const scale = length > 1 ? 1 / length : 1;
        return {
            type: EInputType.ActorMove,
            actorId,
            moveDirection: {
                x: x * scale,
                y: y * scale,
            },
            dt: Math.min(input.dt, 0.1),
        };
    }

    private createActor(actorId: number): IActor {
        const column = (actorId - 1) % 5;
        const row = Math.floor((actorId - 1) / 5) % 3;
        return {
            id: actorId,
            type: EActorType.HERO,
            hp: GameConfig.initialHp,
            pos: {
                x: (column - 2) * 120,
                y: (row - 1) * 120,
            },
            dir: EActorDir.Right,
            state: EActorState.Idle,
            stateStartTime: this.gameSystem.state.now,
            stateEndTime: 0,
            stateVersion: 0,
        };
    }
}

declare module 'tsrpc' {
    export interface WsConnection {
        actorId?: number;
    }
}
