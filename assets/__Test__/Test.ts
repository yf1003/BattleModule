import * as cc from "cc";
const {ccclass, property, menu} = cc._decorator;

@ccclass
export default class Test extends cc.Component {
    @property(cc.Node)
    private role: cc.Node


    protected update(dt: number): void {
        const pos = this.role.position.clone()
        pos.x += 6
        this.role.setPosition(pos)
    }
}