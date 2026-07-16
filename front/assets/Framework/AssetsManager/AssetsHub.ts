/**
 * 资源中心：管理资源加载和资源释放
 */

import * as cc from "cc";
import { AssetsWorker } from './AssetsWorker'
import { BIMap } from '../Utils/BIMap'

const { ccclass, property, menu } = cc._decorator

@ccclass
@menu('Framework/AssetsLoader/AssetsHub')
export default class AssetsHub extends cc.Component {
  /** 资源列表 */
  private _assetsList: BIMap<cc.Asset> = null
  public get assetsList() {
    if (!this._assetsList) {
      this._assetsList = new BIMap()
    }
    return this._assetsList
  }

  public hasAsset(asset: cc.Asset | string): boolean {
    if (!this._assetsList) return false

    return this._assetsList.has(asset)
  }

  public getAsset(path: string): cc.Asset {
    if (!this._assetsList) return null

    return this._assetsList.get(path)
  }

  public appendAsset(path: string, asset: cc.Asset) {
    if (!path) return
    if (!asset) return
    if (!this.isValid) return

    asset.addRef()
    this.assetsList.set(path, asset)
  }

  public releaseAll() {
    if (!this._assetsList) return

    this._assetsList.forEach((asset, path) => {
      if (asset instanceof cc.Asset) {
        AssetsWorker.release(asset)
      }
    })
    this._assetsList.clear()
  }

  onDestroy() {
    this.releaseAll()
  }
}
