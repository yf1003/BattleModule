import * as cc from "cc";
import Singleton from "../../Framework/Utils/Singleton";


export class ControlManager extends Singleton<ControlManager>() {
    /** 移动方向 */
    public inputDir: cc.Vec2 = cc.v2(0, 0);
    /** 攻击 */
    public onControlAttack: () => void = null;
}