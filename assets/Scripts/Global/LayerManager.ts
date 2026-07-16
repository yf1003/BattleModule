import * as cc from "cc";
import Singleton from "../../Framework/Utils/Singleton";

export default class LayerManager extends Singleton<LayerManager>() {
    /** 主Canvas */
    public canvas: cc.Node = null
    /** UI层 */
    public uiLayer: cc.Node = null
    /** unit层 */
    public unitLayer: cc.Node = null

    init() {
        const sceneRoot = cc.director.getScene()
        this.canvas = sceneRoot.getChildByName('Canvas')
        this.uiLayer = this.canvas.getChildByName('UILayer')
        this.unitLayer = this.canvas.getChildByName('UnitLayer')
    }
}