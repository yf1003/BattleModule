import * as cc from "cc";
import Singleton from "../../Framework/Utils/Singleton";
import { AssetsHandler } from "../../Framework/AssetsManager/AssetsHandler";
import KeyBoardInput from "./KeyBoard/KeyBoardInput";
import { PREVIEW } from "cc/env";


export class ControlManager extends Singleton<ControlManager>() {
    /** 移动方向 */
    public inputDir: cc.Vec2 = cc.v2(0, 0);
    /** 攻击 */
    public onControlAttack: () => void = null;

    public async initControll() {
        if (PREVIEW) {
            this.addKeyBoardControl()
        }
        await this.addButtonControl()
    }

    /** 添加按钮控制 */
    private async addButtonControl() {
        const prefab = await AssetsHandler.loadAssets('BattleRes', "Prefab/ButtonControlPanel", cc.Prefab)
        const panelNode = cc.instantiate(prefab)

        const canvas = cc.director.getScene().getChildByName('Canvas')
        canvas.addChild(panelNode)
        panelNode.setSiblingIndex(999)
    }

    /** 添加键盘控制 */
    private addKeyBoardControl() {
        const canvas = cc.director.getScene().getChildByName('Canvas')
        canvas.addComponent(KeyBoardInput)
    }
}