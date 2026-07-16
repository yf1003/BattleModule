import { ApiCallWs } from 'tsrpc';
import { roomInstance } from '../models/RoomInstance';
import { ReqJoin, ResJoin } from '../shared/protocols/PtlJoin';

export async function ApiJoin(call: ApiCallWs<ReqJoin, ResJoin>): Promise<void> {
    const actorId = roomInstance.join(call.conn);
    call.succ({
        actorId,
        gameState: roomInstance.gameSystem.state,
    });
}
