import { ActorConfig } from './ActorConfig';
import { EActorState, IActor, IVec2 } from './Define';

/** 前后端共用的权威角色状态机。 */
export class ActorStateMachine {
    public static update(actor: IActor, now: number): void {
        if (actor.hp <= 0) {
            this.enterDead(actor, now);
            return;
        }

        if (
            this.isTimedState(actor.state)
            && actor.stateEndTime > 0
            && now >= actor.stateEndTime
        ) {
            this.transition(actor, EActorState.Idle, now, 0);
        }
    }

    public static move(actor: IActor, direction: IVec2, now: number): boolean {
        this.update(actor, now);
        if (this.isActionLocked(actor.state)) {
            return false;
        }

        const isMoving = direction.x !== 0 || direction.y !== 0;
        this.transition(actor, isMoving ? EActorState.Move : EActorState.Idle, now, 0);
        return isMoving;
    }

    public static attack(actor: IActor, now: number): boolean {
        this.update(actor, now);
        if (this.isActionLocked(actor.state)) {
            return false;
        }

        const duration = ActorConfig[actor.type].attackLockDuration;
        this.transition(actor, EActorState.Attack, now, now + duration, true);
        return true;
    }

    public static hurt(actor: IActor, now: number, hurtStunDuration?: number): void {
        if (actor.hp <= 0) {
            this.enterDead(actor, now);
            return;
        }

        const duration = hurtStunDuration
            ?? ActorConfig[actor.type].defaultHurtStunDuration;
        this.transition(actor, EActorState.Hurt, now, now + duration, true);
    }

    public static applyDamage(
        actor: IActor,
        damage: number,
        now: number,
        hurtStunDuration?: number,
    ): void {
        if (actor.state === EActorState.Dead || damage <= 0) {
            return;
        }

        actor.hp = Math.max(0, actor.hp - damage);
        this.hurt(actor, now, hurtStunDuration);
    }

    private static enterDead(actor: IActor, now: number): void {
        this.transition(actor, EActorState.Dead, now, 0);
    }

    private static transition(
        actor: IActor,
        nextState: EActorState,
        stateStartTime: number,
        stateEndTime: number,
        forceReplay: boolean = false,
    ): void {
        if (
            !forceReplay
            && actor.state === nextState
            && actor.stateEndTime === stateEndTime
        ) {
            return;
        }

        actor.state = nextState;
        actor.stateStartTime = stateStartTime;
        actor.stateEndTime = stateEndTime;
        actor.stateVersion = (actor.stateVersion || 0) + 1;
    }

    private static isTimedState(state: EActorState): boolean {
        return state === EActorState.Attack || state === EActorState.Hurt;
    }

    private static isActionLocked(state: EActorState): boolean {
        return state === EActorState.Dead
            || state === EActorState.Hurt
            || state === EActorState.Attack;
    }
}
