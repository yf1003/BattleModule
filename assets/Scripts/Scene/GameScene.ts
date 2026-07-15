import * as cc from "cc";
import { ControlManager } from "../ControlInput/ControlManager";
const { ccclass, property, menu } = cc._decorator;

@ccclass
export default class GameScene extends cc.Component {
    async onLoad() {
        ControlManager.ins.initControll()
    }

    update(dt: number) {
        
    }

    private tick() {
        
    }
}