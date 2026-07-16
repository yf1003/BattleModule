import * as cc from "cc";
import { ActorConfig, IAnimationMap } from "../Share/ActorConfig";
import { EActorState, EActorType, IActor } from "../Share/Define";

/**
 * Unit 的纯表现层动画状态机。
 * 它只消费权威 IActor 状态，不参与战斗状态切换和僵直计时。
 */
export class UnitAnimationStateMachine {
    private animation: cc.Animation = null;
    private animationMap: IAnimationMap = null;
    private currentState: EActorState = null;
    private currentStateVersion: number = -1;

    public init(
        animation: cc.Animation,
        actorType: EActorType,
        clipMap: Map<string, cc.AnimationClip>,
    ): void {
        this.destroy();
        this.animation = animation;
        this.animationMap = ActorConfig[actorType].animations;
        this.animation.playOnLoad = false;

        Object.keys(this.animationMap).forEach(key => {
            const state = key as EActorState;
            const clipName = this.animationMap[state];
            const clip = clipMap.get(clipName);
            if (!clip) {
                console.error(`角色动画资源不存在: ${actorType}/${clipName}`);
                return;
            }

            const animationState = this.animation.addClip(clip, clipName);
            animationState.wrapMode = this.isLoopState(state)
                ? cc.AnimationClip.WrapMode.Loop
                : cc.AnimationClip.WrapMode.Normal;
        });
    }

    public render(actor: IActor, now: number): void {
        if (!this.animation?.isValid) return
        if (!this.animationMap) return
        if (
            actor.state === this.currentState &&
            actor.stateVersion === this.currentStateVersion
        ) return

        const clipName = this.animationMap[actor.state];
        const animationState = this.animation.getState(clipName);
        if (!animationState) {
            console.error(`角色动画状态不存在: ${actor.type}/${actor.state}`);
            return;
        }

        this.animation.play(clipName);
        this.syncAnimationTime(animationState, actor, now);
        this.currentState = actor.state;
        this.currentStateVersion = actor.stateVersion;
    }

    public destroy(): void {
        this.animation?.isValid && this.animation.stop();
        this.animation = null;
        this.animationMap = null;
        this.currentState = null;
        this.currentStateVersion = -1;
    }

    private syncAnimationTime(
        animationState: cc.AnimationState,
        actor: IActor,
        now: number,
    ): void {
        if (animationState.duration <= 0) {
            return;
        }

        const elapsed = Math.max(0, now - actor.stateStartTime);
        animationState.time = this.isLoopState(actor.state)
            ? elapsed % animationState.duration
            : Math.min(elapsed, animationState.duration);
    }

    private isLoopState(state: EActorState): boolean {
        return state === EActorState.Idle || state === EActorState.Move;
    }
}
