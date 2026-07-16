import { ActorConfig } from "./ActorConfig";
import { EActorDir, EInputType, IGameSystemInput, IGameSystemState } from "./Define"
import { deepClone } from "./Utils";

/**
 * 前后端复用的状态计算模块
 */
export class GameSystem {
    // 当前状态
    private _state: IGameSystemState = {
        now: 0,
        actors: []
    }
    get state(): Readonly<IGameSystemState> {
        return this._state
    }
    set state(newState: IGameSystemState) {
        this._state = deepClone(newState);
    }

    // 应用输入，计算状态变更
    applyInput(input: IGameSystemInput) {
        if (input.type === EInputType.ActorMove) {
            let player = this._state.actors.find(v => v.id === input.actorId);
            if (!player) {
                return;
            }

            const moveSpeed = ActorConfig[player.type].moveSpeed;
            player.pos.x += input.moveDirection.x * moveSpeed * input.dt;
            player.pos.y += input.moveDirection.y * moveSpeed * input.dt;

            player.dir = input.moveDirection.x >= 0 ? EActorDir.Right : EActorDir.Left;
        }
        else if (input.type === EInputType.TimePast) {
            this._state.now += input.dt;
        }
    }
}