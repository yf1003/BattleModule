import { ActorConfig } from "./ActorConfig";
import { EActorDir, EInputType, IActorAttack, IActorMove, IGameSystemInput, IGameSystemState, ITimePast } from "./Define"
import { ActorStateMachine } from "./ActorStateMachine";
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
    public applyInput(input: IGameSystemInput) {
        if (input.type === EInputType.ActorMove) {
            this.handleActorMove(input);
        }
        else if (input.type === EInputType.ActorAttack) {
            this.handleActorAttack(input);
        }
        else if (input.type === EInputType.TimePast) {
            this.handleTimePast(input);
        }
    }


    private handleActorMove(input: IActorMove) {
        const player = this._state.actors.find(v => v.id === input.actorId);
        if (!player) {
            return;
        }

        const canMove = ActorStateMachine.move(
            player,
            input.moveDirection,
            this._state.now,
        );
        if (!canMove) {
            return;
        }

        const moveSpeed = ActorConfig[player.type].moveSpeed;
        player.pos.x += input.moveDirection.x * moveSpeed * input.dt;
        player.pos.y += input.moveDirection.y * moveSpeed * input.dt;
        player.dir = input.moveDirection.x >= 0 ? EActorDir.Right : EActorDir.Left;
    }

    private handleActorAttack(input: IActorAttack) {
        const player = this._state.actors.find(v => v.id === input.actorId);
        if (!player) {
            return;
        }

        ActorStateMachine.attack(player, this._state.now);
    }

    private handleTimePast(input: ITimePast) {
        this._state.now += input.dt;
        this._state.actors.forEach(actor => {
            ActorStateMachine.update(actor, this._state.now);
        });
    }

    /** 由服务端命中判定或权威战斗逻辑调用，客户端输入不应直接调用。 */
    private applyDamage(
        actorId: number,
        damage: number,
        hurtStunDuration?: number,
    ): boolean {
        const actor = this._state.actors.find(v => v.id === actorId);
        if (!actor) {
            return false;
        }

        const previousHp = actor.hp;
        ActorStateMachine.applyDamage(
            actor,
            damage,
            this._state.now,
            hurtStunDuration,
        );
        return actor.hp !== previousHp;
    }
}
