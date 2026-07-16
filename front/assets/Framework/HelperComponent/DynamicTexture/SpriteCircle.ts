import * as cc from "cc";
import { TextureGenerator } from './TextureGenerator'

const { ccclass, property, menu, executeInEditMode, requireComponent } = cc._decorator

const DEFAULT_RADIUS = 100
const ANTIALIAS = true
const DEFAULT_COLOR = new cc.Color(255, 255, 255, 255)

function cloneColor(color?: cc.Color) {
  const source = color || DEFAULT_COLOR
  return new cc.Color(source.r, source.g, source.b, source.a)
}

@ccclass
@executeInEditMode()
@requireComponent(cc.Sprite)
@menu('Framework/HelperComponent/DynamicTexture/SpriteCircle')
export default class SpriteCircle extends cc.Component {
  @property() _radius: number = DEFAULT_RADIUS
  @property({ type: cc.CCFloat, tooltip: '编辑器预览不会立即生效' })
  public get radius() {
    return this._radius
  }
  public set radius(value: number) {
    this.setRadius(value, this.circleColor, this.antialias, true)
  }

  @property() _circleColor: cc.Color = cloneColor(DEFAULT_COLOR)
  @property({ type: cc.Color, tooltip: '编辑器预览不会立即生效' })
  public get circleColor() {
    return this._circleColor
  }
  public set circleColor(value: cc.Color) {
    this.setRadius(this.radius, value, this.antialias, true)
  }

  @property() _antialias: boolean = true
  @property({ type: cc.CCBoolean, tooltip: '抗锯齿' })
  public get antialias() {
    return this._antialias
  }
  public set antialias(value: boolean) {
    this.setRadius(this.radius, this.circleColor, value, true)
  }

  private inited: boolean = false
  private get sprite() {
    return this.node.getComponent(cc.Sprite) || this.node.addComponent(cc.Sprite)
  }
  private generatorSpriteFrame: cc.SpriteFrame = null

  onLoad() {
    this.setRadius(this.radius, this.circleColor, this.antialias)
  }

  public setRadius(value: number, color: cc.Color, antialias: boolean, force: boolean = false) {
    if (this.inited && !force) {
      if (this.radius === value && this.circleColor.equals(color) && this.antialias === antialias) {
        return
      }
    }

    this.destroySpriteFrame()
    this._radius = value
    this._circleColor = cloneColor(color)
    this._antialias = antialias
    this.generatorSpriteFrame = TextureGenerator.createCircle(this.radius, this.circleColor, antialias)
    this.sprite.spriteFrame = this.generatorSpriteFrame
    this.inited = true
  }

  // private resetNodeSize() {
  //   const size = ANTIALIAS ? this.radius * 2 + 2 : this.radius * 2
  //   this.node.width = size
  //   this.node.height = size
  // }

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
