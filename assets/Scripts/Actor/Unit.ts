import * as cc from "cc";
import { EActorDir, EActorState, EActorType, IActor, IVec2 } from "../Share/Define";
import { ActorResManager } from "../Global/ActorResManager";
import { UnitAnimationStateMachine } from "./UnitAnimationStateMachine";
const { ccclass, property, menu } = cc._decorator;

@ccclass
export default class Unit extends cc.Component implements IActor {
    /** 数值属性 */
    public id: number = 0
    public hp: number = 0
    public pos: IVec2 = cc.v2()
    public dir: EActorDir = EActorDir.Left
    public type: EActorType = EActorType.HERO
    public state: EActorState = EActorState.Idle
    public stateStartTime: number = 0
    public stateEndTime: number = 0
    public stateVersion: number = 0

    /** UI属性 */
    @property(cc.Animation)
    public animtionCom: cc.Animation = null

    private readonly animationStateMachine = new UnitAnimationStateMachine()
    private targetPos: cc.Vec3 = null
    private tw: cc.Tween<unknown>;

    public get isDead(): boolean {
        return this.state === EActorState.Dead;
    }

    public init(data: IActor, now: number) {
        const { id, type } = data;
        this.id = id;
        this.type = type;

        const animationClipMap = ActorResManager.ins.actorClipMap.get(this.type)
        this.animationStateMachine.init(this.animtionCom, this.type, animationClipMap)
        this.render(data, now)
    }

    render(data: IActor, now: number) {
        this.renderPosition(data);
        this.renderDirection(data);
        this.animationStateMachine.render(data, now);
        this.syncActorData(data);
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
            this.tw = cc.tween(this.node)
                .to(0.1, {
                    position: this.targetPos,
                })
                .start();
        }
    }

    renderDirection(data: IActor) {
        this.node.setScale(data.dir, 1)
    }

    protected onDestroy(): void {
        this.tw?.stop();
        this.animationStateMachine.destroy();
    }

    private syncActorData(data: IActor): void {
        this.hp = data.hp;
        this.pos.x = data.pos.x;
        this.pos.y = data.pos.y;
        this.dir = data.dir;
        this.state = data.state;
        this.stateStartTime = data.stateStartTime;
        this.stateEndTime = data.stateEndTime;
        this.stateVersion = data.stateVersion;
    }
}
