import * as cc from "cc";
import { TextureGenerator } from './TextureGenerator'

const { ccclass, property, menu, executeInEditMode, requireComponent } = cc._decorator

const DEFAULT_RADIUS = 100
const DEFAULT_COLOR = new cc.Color(255, 255, 255, 255)

function cloneColor(color?: cc.Color) {
  const source = color || DEFAULT_COLOR
  return new cc.Color(source.r, source.g, source.b, source.a)
}

@ccclass('SpriteCircleRect')
@executeInEditMode()
@requireComponent(cc.Sprite)
@menu('Framework/HelperComponent/DynamicTexture/SpriteCircleRect')
export default class SpriteCircleRect extends cc.Component {
  @property() _radius: number = DEFAULT_RADIUS
  @property({ type: cc.CCFloat, tooltip: '编辑器预览不会立即生效' })
  public get radius() {
    return this._radius
  }
  public set radius(value: number) {
    this.setRadius(value, this.circleColor, true)
  }

  @property() _circleColor: cc.Color = cloneColor(DEFAULT_COLOR)
  @property({ type: cc.Color, tooltip: '编辑器预览不会立即生效' })
  public get circleColor() {
    return this._circleColor
  }
  public set circleColor(value: cc.Color) {
    this.setRadius(this.radius, value, true)
  }

  private inited: boolean = false
  private sprite: cc.Sprite = null
  private generatorSpriteFrame: cc.SpriteFrame = null

  onLoad() {
    this.sprite = this.node.getComponent(cc.Sprite) || this.node.addComponent(cc.Sprite)
    this.setRadius(this.radius, this.circleColor)
  }

  public setRadius(value: number, color: cc.Color, force: boolean = false) {
    if (this.inited && !force) {
      if (this.radius === value && this.circleColor.equals(color)) {
        return
      }
    }

    this.destroySpriteFrame()
    this._radius = value
    this._circleColor = cloneColor(color)
    this.generatorSpriteFrame = TextureGenerator.createCircleRect(this.radius, this.circleColor, this.node.getComponent(cc.UITransform).contentSize)
    this.sprite.spriteFrame = this.generatorSpriteFrame
    this.inited = true
  }

  private destroySpriteFrame() {
    if (this.generatorSpriteFrame) {
      const texture = this.generatorSpriteFrame.texture
      texture && texture.decRef()
      this.generatorSpriteFrame.decRef()
      this.generatorSpriteFrame = null
    }
  }

  onDestroy() {
    this.destroySpriteFrame()
  }
}
