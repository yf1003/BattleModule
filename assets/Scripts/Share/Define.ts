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

/*****************************************************输入类型*************************************************************** */

/** 输入类型 */
export enum EInputType {
    ActorMove,
    TimePast,
}

/** 移动 */
export interface IActorMove {
    type: EInputType.ActorMove,
    actorId: number,
    moveDirection: IVec2,
    dt: number,
}

// 时间流逝
export interface ITimePast {
    type: EInputType.TimePast,
    dt: number
}

export type IGameSystemInput = IActorMove | ITimePast