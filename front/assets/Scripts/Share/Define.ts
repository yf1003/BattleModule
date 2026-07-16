/** 全局游戏状态 */
export interface IGameSystemState {
    /** 当前战斗时间，单位为秒。 */
    now: number;
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
    /** 本次状态开始的绝对战斗时间。 */
    stateStartTime: number;
    /** Attack/Hurt 的绝对结束时间。 */
    stateEndTime: number;
    /** 每次重新进入状态时递增，用于重播相同状态动画。 */
    stateVersion: number;
}

export enum EActorType {
    HERO = 10001,
    FlyingEye = 10002,
    Goblin = 10003,
    Mushroom = 10004,
}

export interface IVec2 {
    x: number;
    y: number;
}

export enum EActorDir {
    Left = -1,
    Right = 1,
}

export enum EActorState {
    Dead = 'Dead',
    Hurt = 'Hurt',
    Attack = 'Attack',
    Move = 'Move',
    Idle = 'Idle',
}

export enum EInputType {
    ActorMove,
    ActorAttack,
    TimePast,
    ActorJoin,
    ActorLeave,
}

export interface IActorMove {
    type: EInputType.ActorMove;
    actorId: number;
    moveDirection: IVec2;
    /** 本次输入覆盖的移动时长，单位为秒。 */
    dt: number;
}

export interface IActorAttack {
    type: EInputType.ActorAttack;
    actorId: number;
}

export interface ITimePast {
    type: EInputType.TimePast;
    dt: number;
}

export interface IActorJoin {
    type: EInputType.ActorJoin;
    actor: IActor;
}

export interface IActorLeave {
    type: EInputType.ActorLeave;
    actorId: number;
}

export type IClientInput =
    | Omit<IActorMove, 'actorId'>
    | Omit<IActorAttack, 'actorId'>;

export type IGameSystemInput =
    | IActorMove
    | IActorAttack
    | ITimePast
    | IActorJoin
    | IActorLeave;
