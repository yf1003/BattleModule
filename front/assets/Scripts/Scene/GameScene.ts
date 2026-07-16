import * as cc from "cc";
import { ControlManager } from "../ControlInput/ControlManager";
import { ActorResManager } from "../Global/ActorResManager";
import {
    EActorState,
    EActorType,
    EInputType,
    IClientInput,
} from "../Share/Define";
import BattleEvent from "../Events/BattleEvent";
import { EBattleEvents } from "../Events/BattleEventsEnum";
import { GameManager } from "../Global/GameManager";
import Unit from "../Actor/Unit";
import LayerManager from "../Global/LayerManager";
const { ccclass, property, menu } = cc._decorator;

@ccclass
export default class GameScene extends cc.Component {
    /** 未加载好数据之前不允许更新 */
    private shouldUpdate = false;

    async onLoad() {
        LayerManager.ins.init()
        await GameManager.ins.init()
        const [, joined] = await Promise.all([
            this.preload(),
            GameManager.ins.join(),
        ])
        if (!joined || !this.isValid) return
        this.registerEvents()
        this.shouldUpdate = true
    }

    onDestroy() {
        this.shouldUpdate = false
        BattleEvent.targetOff(this)
        ControlManager.ins.onControlAttack = null
        ActorResManager.ins.clear()
        void GameManager.ins.clear()
    }

    private registerEvents() {
        BattleEvent.on(EBattleEvents.ClientSync, this.handleClientSync, this)
        ControlManager.ins.onControlAttack = this.handleControlAttack
    }

    private async preload() {
        // 角色资源
        const actorTypeList: EActorType[] = []
        for (const key in EActorType) {
            const type = EActorType[key]
            if (typeof type !== 'number') continue
            actorTypeList.push(type)
        }
        await Promise.all([
            ActorResManager.ins.prelaod(actorTypeList),
            ControlManager.ins.initControll(),
        ])
    }

    private handleClientSync(input: IClientInput) {
        GameManager.ins.sendClientInput(input)
    }

    private handleControlAttack = () => {
        const actor = GameManager.ins.getUserActor()
        if (!actor || actor.state === EActorState.Dead) {
            return
        }

        BattleEvent.emit(EBattleEvents.ClientSync, {
            type: EInputType.ActorAttack,
        })
    }

    update(dt: number) {
        if (!this.shouldUpdate) return

        this.tick(dt)
        this.render()
    }

    private tick(dt: number) {
        this.tickUserActor(dt)
        GameManager.ins.localTimePast(dt)
    }

    /** tick当前玩家 */
    private tickUserActor(dt: number) {
        const actor = GameManager.ins.getUserActor()
        if (!actor || actor.state === EActorState.Dead) return

        const { x, y } = ControlManager.ins.inputDir;
        BattleEvent.emit(EBattleEvents.ClientSync, {
            type: EInputType.ActorMove,
            moveDirection: cc.v2(x, y),
            dt: dt,
        });
    }

    private render() {
        this.renderActor();
    }

    private renderActor() {
        const now = GameManager.ins.gameSystem.state.now
        for (const actor of GameManager.ins.gameSystem.state.actors) {
            let unit = GameManager.ins.actorMap.get(actor.id)
            if (!unit) {
                const actorPrefab = ActorResManager.ins.actorPrefabMap.get(actor.type)
                unit = cc.instantiate(actorPrefab).getComponent(Unit)
                unit.node.setParent(LayerManager.ins.unitLayer)
                GameManager.ins.actorMap.set(actor.id, unit)
                unit.init(actor, now)
            } else {
                unit.render(actor, now)
            }
        }

        for (const [actorId, unit] of GameManager.ins.actorMap) {
            const exists = GameManager.ins.gameSystem.state.actors.some(
                actor => actor.id === actorId,
            )
            if (!exists) {
                unit.node.destroy()
                GameManager.ins.actorMap.delete(actorId)
            }
        }
    }

}
