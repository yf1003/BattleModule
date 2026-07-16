import * as cc from "cc";
import { ControlManager } from "../ControlInput/ControlManager";
import { ActorResManager } from "../Global/ActorResManager";
import { EActorDir, EActorType, EInputType, IGameSystemInput } from "../Share/Define";
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
        GameManager.ins.init()
        await this.preload()
        this.registerEvents()
        this.shouldUpdate = true

        this.addFakeData()
    }

    onDestroy() {
        BattleEvent.targetOff(this)
        ActorResManager.ins.clear()
    }

    private addFakeData() {
        GameManager.ins.gameSystem.state.actors.push({
            id: 1,
            type: EActorType.HERO,
            hp: 100,
            pos: cc.v2(0, 0),
            dir: EActorDir.Right
        })
        GameManager.ins.myPlayerId = 1
    }

    private registerEvents() {
        BattleEvent.on(EBattleEvents.ClientSync, this.handleClientSync, this)
    }

    private async preload() {
        // 角色资源
        const actorTypeList = []
        for (const key in EActorType) {
            const type = EActorType[key]
            if (typeof type !== 'number') continue
            actorTypeList.push(type)
        }
        ActorResManager.ins.prelaod(actorTypeList)
        // 控制器
        await ControlManager.ins.initControll()
    }

    private handleClientSync(input: IGameSystemInput) {
        GameManager.ins.sendClientInput(input)
    }

    update(dt: number) {
        if (!this.shouldUpdate) return

        this.tick(dt)
        this.render()
    }

    private tick(dt: number) {
        this.tickUserActor(dt)
        this.tickLocalTime(dt)
    }

    /** tick当前玩家 */
    private tickUserActor(dt: number) {
        const actor = GameManager.ins.getUserActor()
        if (!actor || actor.isDead) return

        if (ControlManager.ins.inputDir.length()) {
            const { x, y } = ControlManager.ins.inputDir;
            BattleEvent.emit(EBattleEvents.ClientSync, {
                type: EInputType.ActorMove,
                actorId: actor.id,
                moveDirection: cc.v2(x, y),
                dt: dt,
            });
        }
    }

    /** 本地时间流逝：目前不是联机，直接本地 */
    private tickLocalTime(dt: number) {
        GameManager.ins.sendClientInput({
            type: EInputType.TimePast,
            dt: dt,
        })
    }

    private render() {
        this.renderActor();
    }

    private renderActor() {
        for (const actor of GameManager.ins.gameSystem.state.actors) {
            let unit = GameManager.ins.actorMap.get(actor.id)
            if (!unit) {
                const actorPrefab = ActorResManager.ins.actorPrefabMap.get(actor.type)
                const unit = cc.instantiate(actorPrefab).getComponent(Unit)
                unit.node.setParent(LayerManager.ins.unitLayer)
                GameManager.ins.actorMap.set(actor.id, unit)
                unit.init(actor)
            } else {
                unit.render(actor)
            }
        }
    }


}