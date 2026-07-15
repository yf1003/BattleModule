import * as cc from "cc";
import SpriteCircle from './SpriteCircle'

const { ccclass, property, menu, executeInEditMode, requireComponent } = cc._decorator

@ccclass
@menu('Framework/HelperComponent/DynamicTexture/SpriteCircleKeeper')
@executeInEditMode()
@requireComponent(SpriteCircle)
export default class SpriteCircleKeeper extends cc.Component {
  onLoad() {
    this.node.on(cc.Node.EventType.SIZE_CHANGED, this.onSizeChanged, this)
  }

  private onSizeChanged() {
    const spriteCircle = this.node.getComponent(SpriteCircle)
    if (!spriteCircle) return

    const uiTran = this.node.getComponent(cc.UITransform)
    const newWidth = uiTran.width
    const newHeight = uiTran.height
    let newRadius = 0
    if (spriteCircle.antialias) {
      newRadius = Math.min(newWidth, newHeight) / 2 - 1
    } else {
      newRadius = Math.min(newWidth, newHeight) / 2
    }
    spriteCircle.radius = Math.max(newRadius, 0)
  }
}
