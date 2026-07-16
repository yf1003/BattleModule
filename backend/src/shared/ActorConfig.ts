import { EActorState, EActorType, IVec2 } from './Define';

export interface IBox {
    width: number;
    height: number;
}

export type IOffsetBox = IBox & IVec2

export interface IAnimationMap {
    [EActorState.Dead]: string;
    [EActorState.Hurt]: string;
    [EActorState.Attack]: string;
    [EActorState.Move]: string;
    [EActorState.Idle]: string;
}

export interface IActorConfig {
    moveSpeed: number;
    attackLockDuration: number;
    defaultHurtStunDuration: number;
    animations: IAnimationMap;
    animationComOffset: IVec2;
    hurtBox: IBox;
    attackBox: IOffsetBox;
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
        animationComOffset: { x: 24, y: 13 },
        hurtBox: { width: 50, height: 100 },
        attackBox: { x: 55, y: 18, width: 80, height: 83 }
    },
    [EActorType.FlyingEye]: {
        moveSpeed: 300,
        attackLockDuration: 0.4,
        defaultHurtStunDuration: 0.4,
        animations: {
            [EActorState.Dead]: 'Death',
            [EActorState.Hurt]: 'Take_Hit',
            [EActorState.Attack]: 'Attack1',
            [EActorState.Move]: 'Flight',
            [EActorState.Idle]: 'Flight',
        },
        animationComOffset: { x: -12, y: 11 },
        hurtBox: { width: 60, height: 60 },
        attackBox: { x: 55, y: 18, width: 80, height: 83 }
    },
    [EActorType.Goblin]: {
        moveSpeed: 300,
        attackLockDuration: 0.4,
        defaultHurtStunDuration: 0.4,
        animations: {
            [EActorState.Dead]: 'Death',
            [EActorState.Hurt]: 'Take_Hit',
            [EActorState.Attack]: 'Attack1',
            [EActorState.Move]: 'Run',
            [EActorState.Idle]: 'Idle',
        },
        animationComOffset: { x: -4, y: 31 },
        hurtBox: { width: 60, height: 100 },
        attackBox: { x: 55, y: 18, width: 80, height: 83 }
    },
    [EActorType.Mushroom]: {
        moveSpeed: 300,
        attackLockDuration: 0.4,
        defaultHurtStunDuration: 0.4,
        animations: {
            [EActorState.Dead]: 'Death',
            [EActorState.Hurt]: 'Take_Hit',
            [EActorState.Attack]: 'Attack1',
            [EActorState.Move]: 'Run',
            [EActorState.Idle]: 'Idle',
        },
        animationComOffset: { x: 0.5, y: 27 },
        hurtBox: { width: 50, height: 100 },
        attackBox: { x: 55, y: 18, width: 80, height: 83 }
    },
};
