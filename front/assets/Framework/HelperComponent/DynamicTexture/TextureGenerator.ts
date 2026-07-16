import * as cc from "cc";
/**
 * 纹理生成器
 * 功能：动态生成纯色SpriteFrame：矩形/圆形/三角形
 */

export class TextureGenerator {
  private static _tempVec = new cc.Vec2()

  /**
   * 生成纯色 (1x1像素)
   * @param color 颜色
   */
  public static createRect(color: cc.Color = cc.Color.WHITE, width: number = 1, height?: number): cc.SpriteFrame {
    const { r, g, b, a } = color
    // 需要创建一个width * height大小的buffer来存储所有像素的颜色值
    const buffer = new Uint8Array(width * (height || width) * 4)
    // 填充所有像素为相同的颜色值
    for (let i = 0; i < buffer.length; i += 4) {
      buffer[i] = r
      buffer[i + 1] = g
      buffer[i + 2] = b
      buffer[i + 3] = a
    }
    return this.createSpriteFrame(width, height ? height : width, buffer)
  }

  /**
   * 生成纯色圆形
   * @param radius 半径
   * @param color 颜色
   * @param antialias 抗锯齿
   */
  public static createCircle(radius: number, color: cc.Color = cc.Color.WHITE, antialias: boolean = true): cc.SpriteFrame {
    if (radius <= 0) return null

    const { r, g, b, a } = color
    const diameter = radius * 2
    const texSize = diameter + (antialias ? 2 : 0)
    // 修正中心点计算,使用Math.floor确保中心点在整数位置
    const center = Math.floor(texSize / 2)
    const buffer = new Uint8Array(texSize * texSize * 4)

    let dist = 0
    for (let y = 0; y < texSize; y++) {
      for (let x = 0; x < texSize; x++) {
        dist = Math.sqrt((x + 0.5 - center) ** 2 + (y + 0.5 - center) ** 2)
        let alpha = 0

        if (dist <= radius) {
          alpha = a
        } else if (antialias && dist < radius + 1) {
          alpha = a * (1 - (dist - radius))
        }

        const idx = (y * texSize + x) * 4
        buffer.set([r, g, b, alpha], idx)
      }
    }

    const spriteFrame = this.createSpriteFrame(texSize, texSize, buffer)
    spriteFrame.insetTop = center
    spriteFrame.insetBottom = center
    spriteFrame.insetLeft = center
    spriteFrame.insetRight = center
    return spriteFrame
  }

  /** 创建一个圆角为radius，颜色为color，大小为size的带圆角矩形 */
  public static createCircleRect(radius: number, color: cc.Color = cc.Color.WHITE, size: cc.Size): cc.SpriteFrame {
    if (radius <= 0 || size.width <= 0 || size.height <= 0) return null

    const { r, g, b, a } = color
    const width = Math.ceil(size.width)
    const height = Math.ceil(size.height)
    const buffer = new Uint8Array(width * height * 4)

    // 确保圆角半径不超过矩形尺寸的一半
    const maxRadius = Math.min(width, height) / 2
    const actualRadius = Math.min(radius, maxRadius)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let alpha = a

        // 检查是否在圆角区域内
        const isInCorner = this.isInCornerRegion(x, y, width, height, actualRadius)

        if (isInCorner) {
          // 计算到最近圆角中心的距离（使用像素中心点）
          const cornerDist = this.getCornerDistanceWithCenter(x, y, width, height, actualRadius)

          if (cornerDist > actualRadius + 1) {
            // 在圆角区域外，设为透明
            alpha = 0
          } else if (cornerDist > actualRadius) {
            alpha = a * (1 - (cornerDist - actualRadius))
          }
        }

        const idx = (y * width + x) * 4
        buffer.set([r, g, b, alpha], idx)
      }
    }

    return this.createSpriteFrame(width, height, buffer)
  }

  /**
   * 生成纯色三角形
   * @param width 底边宽度
   * @param height 高度
   * @param color 颜色
   * @param direction 朝向
   * @param antialias 抗锯齿
   */
  public static createTriangle(
    width: number,
    height: number,
    color: cc.Color = cc.Color.WHITE,
    direction: 'up' | 'down' | 'left' | 'right' = 'up',
    antialias: boolean = true,
  ): cc.SpriteFrame {
    const { r, g, b, a } = color
    const texWidth = width + (antialias ? 2 : 0)
    const texHeight = height + (antialias ? 2 : 0)
    const offset = antialias ? 1 : 0
    const buffer = new Uint8Array(texWidth * texHeight * 4)

    // 定义三角形顶点
    let p1: cc.Vec2, p2: cc.Vec2, p3: cc.Vec2
    const centerX = texWidth / 2
    const centerY = texHeight / 2

    switch (direction) {
      case 'up':
        p1 = new cc.Vec2(centerX, offset)
        p2 = new cc.Vec2(offset, texHeight - offset)
        p3 = new cc.Vec2(texWidth - offset, texHeight - offset)
        break
      case 'down':
        p1 = new cc.Vec2(centerX, texHeight - offset) // 底点
        p2 = new cc.Vec2(offset, offset) // 左上
        p3 = new cc.Vec2(texWidth - offset, offset) // 右上
        break
      case 'left':
        p1 = new cc.Vec2(offset, centerY) // 左顶点
        p2 = new cc.Vec2(texWidth - offset, offset) // 右上
        p3 = new cc.Vec2(texWidth - offset, texHeight - offset) // 右下
        break
      case 'right':
        p1 = new cc.Vec2(texWidth - offset, centerY) // 右顶点
        p2 = new cc.Vec2(offset, offset) // 左上
        p3 = new cc.Vec2(offset, texHeight - offset) // 左下
        break
    }

    // 填充三角形
    for (let y = 0; y < texHeight; y++) {
      for (let x = 0; x < texWidth; x++) {
        this._tempVec.x = x
        this._tempVec.y = y
        const alpha = this.calculateTriangleAlpha(this._tempVec, p1, p2, p3, antialias)

        const idx = (y * texWidth + x) * 4
        buffer.set([r, g, b, alpha], idx)
      }
    }

    return this.createSpriteFrame(texWidth, texHeight, buffer)
  }

  /**
   * 生成单周期虚线纹理（可配合Sprite的TILED类型重复使用）
   * @param color 虚线颜色
   * @param segmentLength 单段长度
   * @param segmentHeight 单段高度
   * @param gap 段与段之间的间隔
   */
  public static createDashedTexture(
    color: cc.Color = cc.Color.WHITE,
    segmentLength: number = 8,
    segmentHeight: number = 2,
    gap: number = 4,
  ): cc.SpriteFrame {
    if (segmentLength <= 0 || segmentHeight <= 0) return null

    const { r, g, b, a } = color
    const dashLength = Math.ceil(segmentLength)
    const dashHeight = Math.ceil(segmentHeight)
    const gapLength = Math.max(0, Math.ceil(gap))

    const width = dashLength + gapLength
    const height = dashHeight
    const buffer = new Uint8Array(width * height * 4)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4
        if (x < dashLength) {
          buffer.set([r, g, b, a], idx)
        } else {
          buffer.set([0, 0, 0, 0], idx)
        }
      }
    }

    return this.createSpriteFrame(width, height, buffer)
  }

  /**
   * 创建SpriteFrame
   * @param width 纹理宽度
   * @param height 纹理高度
   * @param buffer 像素数据
   */
  private static createSpriteFrame(width: number, height: number, buffer: Uint8Array): cc.SpriteFrame {
    const image = new cc.ImageAsset({
      width,
      height,
      _data: buffer,
      _compressed: false,
      format: cc.Texture2D.PixelFormat.RGBA8888,
    })

    const texture = new cc.Texture2D()
    texture.name = 'GeneratorTexture'
    texture.image = image

    const spriteFrame = new cc.SpriteFrame()
    spriteFrame.name = 'GeneratorSpriteFrame'
    spriteFrame.texture = texture
    spriteFrame.packable = false
    return spriteFrame
  }

  /**
   * 计算点在三角形内的透明度（支持抗锯齿）
   */

  private static calculateTriangleAlpha(point: cc.Vec2, p1: cc.Vec2, p2: cc.Vec2, p3: cc.Vec2, antialias: boolean): number {
    // 判断点是否在三角形内
    const isInside = this.pointInTriangle(point, p1, p2, p3)

    if (isInside) return 255 // 完全在三角形内

    if (!antialias) return 0 // 不启用抗锯齿则直接返回透明

    // 计算到三角形边缘的最小距离（用于抗锯齿）
    const minDist = Math.min(this.distanceToLine(point, p1, p2), this.distanceToLine(point, p2, p3), this.distanceToLine(point, p3, p1))

    // 边缘 1px 抗锯齿过渡
    if (minDist < 1) {
      return 255 * (1 - minDist)
    }

    return 0
  }

  /**
   * 判断点是否在三角形内（使用叉积法）
   */
  private static pointInTriangle(p: cc.Vec2, p1: cc.Vec2, p2: cc.Vec2, p3: cc.Vec2): boolean {
    const d1 = (p.x - p2.x) * (p1.y - p2.y) - (p1.x - p2.x) * (p.y - p2.y)
    const d2 = (p.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p.y - p3.y)
    const d3 = (p.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p.y - p1.y)

    const hasNeg = d1 < 0 || d2 < 0 || d3 < 0
    const hasPos = d1 > 0 || d2 > 0 || d3 > 0

    return !(hasNeg && hasPos)
  }

  /**
   * 计算点到线段的距离
   */
  private static distanceToLine(p: cc.Vec2, p1: cc.Vec2, p2: cc.Vec2): number {
    const lineX = p2.x - p1.x
    const lineY = p2.y - p1.y
    const lengthSqr = lineX * lineX + lineY * lineY
    if (lengthSqr === 0) {
      return Math.sqrt((p.x - p1.x) ** 2 + (p.y - p1.y) ** 2)
    }

    const pointX = p.x - p1.x
    const pointY = p.y - p1.y
    const t = Math.max(0, Math.min(1, (pointX * lineX + pointY * lineY) / lengthSqr))
    const projectionX = p1.x + lineX * t
    const projectionY = p1.y + lineY * t
    return Math.sqrt((p.x - projectionX) ** 2 + (p.y - projectionY) ** 2)
  }

  /**
   * 判断点是否在圆角区域内
   */
  private static isInCornerRegion(x: number, y: number, width: number, height: number, radius: number): boolean {
    return (
      (x < radius && y < radius) || // 左上角
      (x >= width - radius && y < radius) || // 右上角
      (x < radius && y >= height - radius) || // 左下角
      (x >= width - radius && y >= height - radius)
    ) // 右下角
  }

  /**
   * 计算点到最近圆角中心的距离
   */
  private static getCornerDistance(x: number, y: number, width: number, height: number, radius: number): number {
    let centerX = 0
    let centerY = 0

    // 左上角
    if (x < radius && y < radius) {
      centerX = radius
      centerY = radius
    }
    // 右上角
    else if (x >= width - radius && y < radius) {
      centerX = width - radius
      centerY = radius
    }
    // 左下角
    else if (x < radius && y >= height - radius) {
      centerX = radius
      centerY = height - radius
    }
    // 右下角
    else if (x >= width - radius && y >= height - radius) {
      centerX = width - radius
      centerY = height - radius
    }

    return Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
  }

  /**
   * 计算像素中心点到最近圆角中心的距离
   */
  private static getCornerDistanceWithCenter(x: number, y: number, width: number, height: number, radius: number): number {
    let cornerCenterX = 0
    let cornerCenterY = 0

    // 左上角
    if (x < radius && y < radius) {
      cornerCenterX = radius
      cornerCenterY = radius
    }
    // 右上角
    else if (x >= width - radius && y < radius) {
      cornerCenterX = width - radius
      cornerCenterY = radius
    }
    // 左下角
    else if (x < radius && y >= height - radius) {
      cornerCenterX = radius
      cornerCenterY = height - radius
    }
    // 右下角
    else if (x >= width - radius && y >= height - radius) {
      cornerCenterX = width - radius
      cornerCenterY = height - radius
    }

    // 使用与createCircle相同的像素中心点计算方式
    return Math.sqrt((x + 0.5 - cornerCenterX) ** 2 + (y + 0.5 - cornerCenterY) ** 2)
  }
}
