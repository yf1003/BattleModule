import * as cc from "cc";
import { EActorDir, EActorType, IActor, IVec2 } from "../Share/Define";
import { ActorResManager } from "../Global/ActorResManager";
const { ccclass, property, menu } = cc._decorator;

@ccclass
export default class Unit extends cc.Component implements IActor {
    /** 数值属性 */
    public id: number = 0
    public pos: IVec2 = cc.v2()
    public dir: EActorDir = EActorDir.Left
    public type: EActorType = EActorType.HERO

    /** UI属性 */
    @property(cc.Animation)
    public animtionCom: cc.Animation = null

    private animationClipMap: Map<string, cc.AnimationClip> = null

    public async init(data: IActor): Promise<void> {
        const { id, pos, dir, type } = data;
        this.id = id;
        this.pos = pos;
        this.dir = dir;
        this.type = type;

        this.animationClipMap = await ActorResManager.ins.getActionAnimationClip(this.type);
    }
}
