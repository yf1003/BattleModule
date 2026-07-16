import * as cc from "cc";
import { BIMap } from "../Utils/BIMap";

export class AssetsWorker {
  /** 远程图片资源加载列表 */
  private static _remoteImageList: BIMap<cc.SpriteFrame> = null
  private static get remoteImageList() {
    if (!this._remoteImageList) {
      this._remoteImageList = new BIMap()
    }
    return this._remoteImageList
  }

  /** 是否存在远程图片资源 */
  public static hasRemoteSpriteFrame(path: string | cc.SpriteFrame) {
    return this.remoteImageList.has(path)
  }

  /** 获取远程图片资源 */
  public static getRemoteSpriteFrame(path: string) {
    return this.remoteImageList.get(path)
  }

  /** 添加远程图片资源 */
  public static appendRemoteSpriteFrame(path: string, asset: cc.SpriteFrame) {
    if (!path || !asset) {
      return
    }

    if (!this.hasRemoteSpriteFrame(path)) {
      this.remoteImageList.set(path, asset)
    }
  }

  /** 资源释放唯一接口 */
  public static release(assetOrName: cc.Asset | string) {
    let asset: cc.Asset = assetOrName as cc.Asset
    if (typeof assetOrName === 'string') {
      asset = this.getRemoteSpriteFrame(assetOrName)
    }
    if (!asset) return

    if (this.hasRemoteSpriteFrame(asset as cc.SpriteFrame)) {
      this.releaseRemoteSpriteFrame(asset as cc.SpriteFrame)
    } else {
        asset.decRef()
      if (asset.refCount === 0) {
        console.log('释放资源', asset.name)
      }
    }
  }

  private static releaseRemoteSpriteFrame(spFrame: cc.SpriteFrame) {
    spFrame.decRef()
    if (spFrame.refCount === 0) {
      const url = this.remoteImageList.getKey(spFrame)
      console.log('释放资源（远程）', url)
      this.remoteImageList.delete(spFrame)
      let texture = spFrame.texture as cc.Texture2D;
      if (spFrame.packable) {
          texture = spFrame.original?._texture as cc.Texture2D;
      }
      if (texture && cc.isValid(texture, true)) {
          texture.image?.decRef();
          texture.destroy();
          texture.image = null;
      }
      spFrame.texture = null;
      spFrame.destroy();
    }
  }
}
