import * as cc from "cc";
import AssetsHub from './AssetsHub'
import { AssetsWorker } from './AssetsWorker'
import { PREVIEW } from "cc/env";

export class AssetsHandler {
  private static remoteBaseUrl = 'https://wxflag.afunapp.com/bombcat-assets-minigame/'

  /** 加载分包 */
  public static async loadSubpackage(bundleName: string): Promise<cc.AssetManager.Bundle> {
    if (bundleName === 'Main') {
      bundleName = 'MainAb'
    }
    const bundle = cc.assetManager.getBundle(bundleName)
    if (bundle) {
      return bundle
    }

    return new Promise((resolve, reject) => {
      cc.assetManager.loadBundle(bundleName, { maxRetryCount: 6 }, (err, bundle) => {
        if (err || !bundle) {
          this.report('加载分包失败', {
            error: err ? err.message || String(err) : '暂无错误消息',
            customMsg: bundleName,
          })
          reject(err)
        } else {
          resolve(bundle)
        }
      })
    })
  }

  /**
   * 加载分包中的资源，支持远程包（微任务）
   * @param bundleName 资源包名，可以填resources
   * @param path 资源相对分包的路径
   */
  public static async loadAssets<T extends cc.Asset>(bundleName: string, path: string, type: new () => T, bindCCObject?: cc.Node): Promise<T> {
    const bundle = cc.assetManager.getBundle(bundleName)
    if (bundle) {
      return await this._handlerBundle(bundle, path, type, bindCCObject)
    } else {
      return new Promise((resolve, reject) => {
        this.loadSubpackage(bundleName)
          .then((bundle) => {
            if (bundle) {
              this._handlerBundle(bundle, path, type, bindCCObject).then(resolve)
            } else {
              reject(new Error('加载分包失败'))
            }
          })
          .catch((err) => {
            reject(err)
          })
      })
    }
  }

  /** 处理分包加载（微任务） */
  private static async _handlerBundle<T extends cc.Asset>(
    bundle: cc.AssetManager.Bundle,
    path: string,
    type: new () => T,
    bindCCObject?: cc.Node,
  ): Promise<T> {
    const registerPath = `${bundle.name}|${path}`

    // 1. 检查绑定节点上是否已加载过该资源
    let assetHub: AssetsHub = null
    if (bindCCObject) {
      assetHub = bindCCObject.getComponent(AssetsHub) || bindCCObject.addComponent(AssetsHub)
      if (assetHub.hasAsset(registerPath)) {
        return assetHub.getAsset(registerPath) as T
      }
    }

    // 2. 检查bundle中是否已有该资源
    const existingAsset = bundle.get(path, type as any)
    if (existingAsset) {
      assetHub?.isValid && assetHub.appendAsset(registerPath, existingAsset)
      return existingAsset as T
    }

    // 3. 检查资源是否存在
    const info = bundle.getInfoWithPath(path)
    if (!info) {
      this.report('资源加载失败', {
        error: null,
        customMsg: `资源加载失败: ${registerPath} not found!`,
      })
      return null
    }

    // 4. 加载新资源
    return new Promise((resolve) => {
      //@ts-ignore
      bundle.load(path, type, (error: Error, asset: T) => {
        if (error) {
          this.report('资源加载失败', {
            error: error,
            customMsg: `资源加载失败: ${registerPath} load fail`,
          })
          resolve(null)
          return
        }
        assetHub?.isValid && assetHub.appendAsset(registerPath, asset)
        resolve(asset)
      })
    })
  }

  /** 加载远程图片
   * 如果没传bindCCObject，则每次调用一定会返回一个新的无引用的对象
   */
  public static async loadRemoteSpriteFrame(path: string, bindCCObject?: cc.Node): Promise<cc.SpriteFrame> {
    // 1. 检查绑定节点上是否已加载过该资源
    let assetHub: AssetsHub = null
    if (bindCCObject) {
      assetHub = bindCCObject.getComponent(AssetsHub) || bindCCObject.addComponent(AssetsHub)
      if (assetHub.hasAsset(path)) {
        return assetHub.getAsset(path) as cc.SpriteFrame
      }
    }

    // 2. 检查是否已加载过该资源
    // 为什么加assetHub?.isValid 为了兼容部分场景没有加AssetsHub组件又要加载远程图片的情况，防止它挂载的图片突然被释放
    if (AssetsWorker.hasRemoteSpriteFrame(path) && assetHub?.isValid) {
      const spr = AssetsWorker.getRemoteSpriteFrame(path)
      assetHub?.isValid && assetHub.appendAsset(path, spr)
      return spr
    }

    let isLoaded = false
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.src = path
      image.onload = (e) => {
        // if (isLoaded) return
        isLoaded = true
        const sf = cc.SpriteFrame.createWithImage(image)
        sf.name = path
        if (assetHub?.isValid) {
          AssetsWorker.appendRemoteSpriteFrame(path, sf)
          assetHub?.isValid && assetHub.appendAsset(path, sf)
        }
        resolve(sf)
      }
      image.onerror = (e) => {
        if (isLoaded) return
        isLoaded = true
        this.report('远程图片加载失败', {
          error: e,
          customMsg: `远程图片加载失败: ${path} load fail`,
        })
        reject(e)
      }
    })
  }

  /** 加载远程spine */
  public static async loadRemoteSpine(skelUrl: string, atlasUrl: string, imageUrl: string, bindCCObject?: cc.Node): Promise<cc.sp.SkeletonData> {
    return new Promise((resolve, reject) => {
      const tasks = [
        this.loadRemoteAsset<cc.JsonAsset>(skelUrl, bindCCObject),
        this.loadRemoteAsset<cc.TextAsset>(atlasUrl, bindCCObject),
        this.loadRemoteAsset<cc.Texture2D>(imageUrl, bindCCObject),
      ]

      Promise.all(tasks).then((assets: [cc.JsonAsset, cc.TextAsset, cc.Texture2D]) => {
        if (!assets || !assets.length) reject('loadRemoteSpine fail, assets is null')

        const skeletonData = new cc.sp.SkeletonData()
        skeletonData.skeletonJson = assets[0].json as cc.sp.spine.SkeletonJson
        skeletonData.atlasText = assets[1].text
        skeletonData.textures = [assets[2]]

        skeletonData['_uuid'] = skelUrl

        const match = skeletonData.atlasText.match(/(.*).png/)
        if (match) {
          const textureName = match[0]
          //@ts-ignore
          skeletonData.textureNames = [textureName]
        }

        resolve(skeletonData)
      })
    })
  }

  /** 加载远程资源（通用） */
  public static async loadRemoteAsset<T extends cc.Asset>(path: string, bindCCObject?: cc.Node): Promise<T> {
    const isFullUrl = path.startsWith('http') || path.startsWith('file://')
    const registerPath = isFullUrl ? path : `${this.remoteBaseUrl}${path}`

    // 1. 检查绑定节点上是否已加载过该资源
    let assetHub: AssetsHub = null
    if (bindCCObject) {
      assetHub = bindCCObject.getComponent(AssetsHub) || bindCCObject.addComponent(AssetsHub)
      if (assetHub.hasAsset(registerPath)) {
        return assetHub.getAsset(registerPath) as T
      }
    }

    return new Promise((resolve, reject) => {
      cc.assetManager.loadRemote(registerPath, {}, (err, asset) => {
        if (err) {
          console.error('加载远程资源失败：', err)
          resolve(null)
        } else {
          assetHub?.isValid && assetHub.appendAsset(registerPath, asset)
          resolve(asset as T)
        }
      })
    })
  }

  private static report(msg: string, data: any) {
    PREVIEW && console.log(`[${msg}]---`, data)
    // AliLogger.log(LogScope.ERROR, {
    //   msg,
    //   data: {
    //     ...data,
    //     deviceId: ThinkingDataUtil.getDistinctId(),
    //   },
    // })
  }
}
