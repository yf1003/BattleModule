/** 全局游戏状态 */
export interface IGameSystemState {
    /** 当前的时间 */
    now: number;
    /** 角色 */
    actors: IActor[];
}

/** 角色 */
export interface IActor {
    id: number;
    hp: number;
    type: EActorType;
    pos: IVec2;
    dir: EActorDir;
    /** 服务端权威的角色状态。 */
    state: EActorState;
    /** 本次状态开始的绝对战斗时间，用于远端客户端校准动画进度。 */
    stateStartTime: number;
    /** Attack/Hurt 的绝对结束时间，使用 IGameSystemState.now 的时间轴。 */
    stateEndTime: number;
    /** 每次重新进入状态时递增，用于让客户端重播相同状态动画。 */
    stateVersion: number;
}

/** 角色类型 */
export enum EActorType {
    HERO = 10001
}

export interface IVec2 {
    x: number;
    y: number
}

export enum EActorDir {
    Left = -1,
    Right = 1
}

/** 角色战斗状态，同时也是客户端动画的语义状态。 */
export enum EActorState {
    Dead = 'Dead',
    Hurt = 'Hurt',
    Attack = 'Attack',
    Move = 'Move',
    Idle = 'Idle',
}

/*****************************************************输入类型*************************************************************** */

/** 输入类型 */
export enum EInputType {
    ActorMove,
    ActorAttack,
    TimePast,
}

/** 移动 */
export interface IActorMove {
    type: EInputType.ActorMove,
    actorId: number,
    moveDirection: IVec2,
    dt: number,
}

/** 攻击 */
export interface IActorAttack {
    type: EInputType.ActorAttack,
    actorId: number,
}

// 时间流逝
export interface ITimePast {
    type: EInputType.TimePast,
    dt: number
}

export type IGameSystemInput = IActorMove | IActorAttack | ITimePast
