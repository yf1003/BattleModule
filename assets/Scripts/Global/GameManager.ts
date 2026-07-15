import Singleton from "../../Framework/Utils/Singleton";
import { IGameSystemInput } from "../Share/Define";
import { GameSystem } from "../Share/GameSystem";

export class GameManager extends Singleton<GameManager>() {
    /** 游戏统一逻辑计算系统 */
    private gameSystem: GameSystem = null

    init() {
        this.gameSystem = new GameSystem();
    }

    sendClientInput(input: IGameSystemInput) {
        this.gameSystem.applyInput(input)
    }

    clear() {
        this.gameSystem = null
    }
}