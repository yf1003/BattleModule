import { EActorType } from "./Define";

export interface IBox {
    width: number;
    height: number;
}

export interface IAnimationMap {
    [actionName: string]: string
    moveAnim: string
    idleAnim: string
    hurtAnim: string
    attackAnim: string
}

export interface IActorConfig {
    moveSpeed: number
    animations: IAnimationMap
    colliderBox: IBox
}

export const ActorConfig: Record<EActorType, IActorConfig> = {
    [EActorType.HERO]: {
        moveSpeed: 100,
        animations: {
            moveAnim: 'Run',
            idleAnim: 'Idle',
            hurtAnim: 'Hurt',
            attackAnim: 'Attack',
        },
        colliderBox: { width: 50, height: 100 }
    }
}
