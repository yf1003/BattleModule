import { ActorConfig } from './ActorConfig';
import { ActorStateMachine } from './ActorStateMachine';
import {
    EActorDir,
    EInputType,
    IActorAttack,
    IActorJoin,
    IActorLeave,
    IActorMove,
    IGameSystemInput,
    IGameSystemState,
    ITimePast,
} from './Define';
import { GameConfig } from './GameConfig';
import { clamp, deepClone } from './Utils';

/** 前后端复用的确定性状态计算模块。 */
export class GameSystem {
    private _state: IGameSystemState = {
        now: 0,
        actors: [],
    };

    public get state(): Readonly<IGameSystemState> {
        return this._state;
    }

    public reset(state: IGameSystemState): void {
        this._state = deepClone(state);
    }

    public applyInput(input: IGameSystemInput): void {
        if (input.type === EInputType.ActorMove) {
            this.handleActorMove(input);
        } else if (input.type === EInputType.ActorAttack) {
            this.handleActorAttack(input);
        } else if (input.type === EInputType.TimePast) {
            this.handleTimePast(input);
        } else if (input.type === EInputType.ActorJoin) {
            this.handleActorJoin(input);
        } else if (input.type === EInputType.ActorLeave) {
            this.handleActorLeave(input);
        }
    }

    private handleActorMove(input: IActorMove): void {
        const actor = this._state.actors.find(value => value.id === input.actorId);
        if (!actor) {
            return;
        }

        const canMove = ActorStateMachine.move(
            actor,
            input.moveDirection,
            this._state.now,
        );
        if (!canMove) {
            return;
        }

        const moveSpeed = ActorConfig[actor.type].moveSpeed;
        actor.pos.x += input.moveDirection.x * moveSpeed * input.dt;
        actor.pos.y += input.moveDirection.y * moveSpeed * input.dt;

        actor.pos.x = clamp(actor.pos.x, GameConfig.minMoveX, GameConfig.maxMoveX);
        actor.pos.y = clamp(actor.pos.y, GameConfig.minMoveY, GameConfig.maxMoveY);

        // AGENT不准改这段代码
        actor.dir = input.moveDirection.x >= 0 ? EActorDir.Right : EActorDir.Left;
    }

    private handleActorAttack(input: IActorAttack): void {
        const actor = this._state.actors.find(value => value.id === input.actorId);
        if (actor) {
            ActorStateMachine.attack(actor, this._state.now);
        }
    }

    private handleTimePast(input: ITimePast): void {
        this._state.now += input.dt;
        this._state.actors.forEach(actor => {
            ActorStateMachine.update(actor, this._state.now);
        });
    }

    private handleActorJoin(input: IActorJoin): void {
        if (this._state.actors.some(actor => actor.id === input.actor.id)) {
            return;
        }
        this._state.actors.push(deepClone(input.actor));
    }

    private handleActorLeave(input: IActorLeave): void {
        const index = this._state.actors.findIndex(actor => actor.id === input.actorId);
        if (index >= 0) {
            this._state.actors.splice(index, 1);
        }
    }

    /** 仅供服务端权威命中逻辑调用。 */
    public applyDamage(
        actorId: number,
        damage: number,
        hurtStunDuration?: number,
    ): boolean {
        const actor = this._state.actors.find(value => value.id === actorId);
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
