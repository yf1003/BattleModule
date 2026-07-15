import * as cc from "cc";
import JoytStick from "./JoytStick";
import { ControlManager } from "../ControlManager";
const { ccclass, property, menu } = cc._decorator;

@ccclass
export default class ButtonInput extends cc.Component {
    @property(JoytStick)
    public joyStick: JoytStick;
    @property(cc.Node)
    public btnAttack: cc.Node;

    onLoad() {
        this.joyStick.options = {
            onOperate: (input: cc.Vec2) =>{
                ControlManager.ins.inputDir.set(input.x, input.y)
            }
        }
    }

    private onTouchAttack() {
        ControlManager.ins?.onControlAttack?.()
    }
}