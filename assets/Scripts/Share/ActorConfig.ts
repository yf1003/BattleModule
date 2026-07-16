import { EActorState, EActorType } from "./Define";

export interface IBox {
    width: number;
    height: number;
}

export interface IAnimationMap {
    [EActorState.Dead]: string
    [EActorState.Hurt]: string
    [EActorState.Attack]: string
    [EActorState.Move]: string
    [EActorState.Idle]: string
}

export interface IActorConfig {
    moveSpeed: number
    /** 攻击期间不可再次攻击或移动的时间。 */
    attackLockDuration: number
    /** 未提供攻击方受击僵直数据时使用的默认值。 */
    defaultHurtStunDuration: number
    animations: IAnimationMap
    colliderBox: IBox
}

export const ActorConfig: Record<EActorType, IActorConfig> = {
    [EActorType.HERO]: {
        moveSpeed: 300,
        attackLockDuration: 0.4,
        defaultHurtStunDuration: 0.4,
        animations: {
            [EActorState.Dead]: 'Death',
            [EActorState.Hurt]: 'Hurt',
            [EActorState.Attack]: 'Attack',
            [EActorState.Move]: 'Run',
            [EActorState.Idle]: 'Idle',
        },
        colliderBox: { width: 50, height: 100 }
    }
}
