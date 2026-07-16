import * as cc from "cc";
import { EActorDir, EActorType, IActor, IVec2 } from "../Share/Define";
import { ActorResManager } from "../Global/ActorResManager";
const { ccclass, property, menu } = cc._decorator;

@ccclass
export default class Unit extends cc.Component implements IActor {
    /** 数值属性 */
    public id: number = 0
    public hp: number = 0
    public pos: IVec2 = cc.v2()
    public dir: EActorDir = EActorDir.Left
    public type: EActorType = EActorType.HERO

    /** UI属性 */
    @property(cc.Animation)
    public animtionCom: cc.Animation = null

    private animationClipMap: Map<string, cc.AnimationClip> = null
    private targetPos: cc.Vec3 = null
    private tw: cc.Tween<unknown>;
    public isDead: boolean = false


    public init(data: IActor) {
        const { id, hp, pos, dir, type } = data;
        this.id = id;
        this.pos = pos;
        this.dir = dir;
        this.type = type;
        this.hp = hp;

        this.animationClipMap = ActorResManager.ins.actorClipMap.get(this.type)
    }

    render(data: IActor) {
        this.renderPosition(data);
        this.renderDirection(data);
    }

    renderPosition(data: IActor) {
        const newPos = new cc.Vec3(data.pos.x, data.pos.y);
        if (!this.targetPos) {
            this.node.active = true;
            this.node.setPosition(newPos);
            this.targetPos = new cc.Vec3(newPos);
        } else if (!this.targetPos.equals(newPos)) {
            this.tw?.stop();
            this.node.setPosition(this.targetPos);
            this.targetPos.set(newPos);
            // TODO 修改为跑步状态
            this.tw = cc.tween(this.node)
                .to(0.1, {
                    position: this.targetPos,
                })
                .call(() => {
                    // TODO 修改为Idle状态
                })
                .start();
        }
    }

    renderDirection(data: IActor) {
        this.node.setScale(data.dir, 1)
    }
}
