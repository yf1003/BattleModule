import { IGameSystemState } from '../Define';

export interface IReqJoin {
}

export type ReqJoin = IReqJoin;

export interface IResJoin {
    actorId: number;
    gameState: IGameSystemState;
}

export type ResJoin = IResJoin;
