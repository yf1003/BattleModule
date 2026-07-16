import * as cc from "cc";
import Singleton from "../../Framework/Utils/Singleton";
import Unit from "../Actor/Unit";
import { EActorType, IGameSystemInput } from "../Share/Define";
import { GameSystem } from "../Share/GameSystem";

export class GameManager extends Singleton<GameManager>() {
    /** 游戏统一逻辑计算系统 */
    public gameSystem: GameSystem = null
    /** 最后一帧的id */
    public lastFrameId: number = 0
    /** 当前操控的玩家id */
    public myPlayerId: number = 0
    /** 角色实例数组<id, Unit> */
    public actorMap: Map<number, Unit> = null
    /** 游戏状态 */

    init() {
        this.gameSystem = new GameSystem();
        this.lastFrameId = 0
        this.myPlayerId = 0
        this.actorMap = new Map()
    }

    sendClientInput(input: IGameSystemInput) {
        this.gameSystem.applyInput(input)
    }

    /** 获取当前控制的角色 */
    getUserActor() {
        return this.gameSystem.state.actors.find(v => v.id === this.myPlayerId)
    }

    clear() {
        this.gameSystem = null
        this.lastFrameId = 0
        this.myPlayerId = 0
        this.actorMap = null
    }
}