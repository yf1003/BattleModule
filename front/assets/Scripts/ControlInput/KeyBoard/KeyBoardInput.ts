import * as cc from "cc";
import { ControlManager } from "../ControlManager";
const { ccclass } = cc._decorator;

@ccclass
export default class KeyBoardInput extends cc.Component {
    private readonly pressedKeys = new Set<cc.KeyCode>();

    onEnable() {
        cc.input.on(cc.Input.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.input.on(cc.Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onDisable() {
        cc.input.off(cc.Input.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.input.off(cc.Input.EventType.KEY_UP, this.onKeyUp, this);
        this.pressedKeys.clear();
        this.updateInputDir();
    }

    private onKeyDown(event: cc.EventKeyboard) {
        const isFirstPress = !this.pressedKeys.has(event.keyCode);
        this.pressedKeys.add(event.keyCode);

        if (this.isMoveKey(event.keyCode)) {
            this.updateInputDir();
        }

        if (event.keyCode === cc.KeyCode.KEY_J && isFirstPress) {
            ControlManager.ins?.onControlAttack?.();
        }
    }

    private onKeyUp(event: cc.EventKeyboard) {
        this.pressedKeys.delete(event.keyCode);

        if (this.isMoveKey(event.keyCode)) {
            this.updateInputDir();
        }
    }

    private isMoveKey(keyCode: cc.KeyCode): boolean {
        return keyCode === cc.KeyCode.KEY_W
            || keyCode === cc.KeyCode.KEY_A
            || keyCode === cc.KeyCode.KEY_S
            || keyCode === cc.KeyCode.KEY_D;
    }

    private updateInputDir() {
        let x = Number(this.pressedKeys.has(cc.KeyCode.KEY_D))
            - Number(this.pressedKeys.has(cc.KeyCode.KEY_A));
        let y = Number(this.pressedKeys.has(cc.KeyCode.KEY_W))
            - Number(this.pressedKeys.has(cc.KeyCode.KEY_S));

        if (x !== 0 && y !== 0) {
            x *= Math.SQRT1_2;
            y *= Math.SQRT1_2;
        }

        ControlManager.ins.inputDir.set(x, y);
    }
}
