import * as cc from "cc";
import Singleton from './Singleton'
import { AssetsHandler } from "../AssetsManager/AssetsHandler";

export interface IPoolParams {
    key: string
    prefab?: cc.Prefab
    bundleName?: string
    path?: string
    poolHandlerComp?: (new () => cc.Component) | string
    bindCCObject?: cc.Node
}

export class PoolMgr extends Singleton<PoolMgr>() {
    private poolMap: Map<string, cc.NodePool> = new Map()
    private prefabMap: Map<string, cc.Prefab> = new Map()

    public async createNodePool({ key, bundleName = '', path = '', prefab, poolHandlerComp, bindCCObject }: IPoolParams) {
        if (this.hasNodePool(key)) {
            return
        }

        if (prefab) {
            this.newNodePool(key, prefab, poolHandlerComp)
        } else {
            const prefab = await AssetsHandler.loadAssets(bundleName, path, cc.Prefab, bindCCObject)
            if (prefab) {
                this.newNodePool(key, prefab, poolHandlerComp)
            }
        }
    }

    /** 实例化对象池 */
    private newNodePool(key: string, prefab: cc.Prefab, poolHandlerComp?: (new () => cc.Component) | string) {
        // @ts-ignore
        const pool = new cc.NodePool(poolHandlerComp)
        this.poolMap.set(key, pool)
        this.prefabMap.set(key, prefab)
    }

    /**
     * 清除对应节点池，同时调用预制资源的decRef
     * @param key
     */
    public clearNodePool(key: string) {
        const pool = this.poolMap.get(key)
        if (pool) {
            pool.clear()
        }

        this.poolMap.delete(key)
        this.prefabMap.delete(key)
    }

    /** 是否存在对应节点池 */
    public hasNodePool(key: string) {
        return this.poolMap.get(key) && this.prefabMap.get(key)
    }

    /**
     * 获取对象池内节点
     */
    public getNode(key: string): cc.Node {
        const pool = this.poolMap.get(key)
        if (!pool) {
            console.log(`对应节点对象池不存在${key}`)
            return
        }

        let node: cc.Node
        if (pool.size()) {
            node = pool.get()
        } else {
            const prefab = this.prefabMap.get(key)
            if (!prefab) {
                console.log(`对应节点对象池不存在${key}`)
                return
            }
            node = cc.instantiate(prefab)

            if (pool.poolHandlerComp) {
                //@ts-ignore
                const handler = node.getComponent(pool.poolHandlerComp)
                if (handler?.reuse) {
                    //@ts-ignore
                    handler.reuse()
                }
            }
        }
        return node
    }

    /**
     * 回收对象池节点
     * @param key 对象池key
     * @param node 要回收的节点或节点数组
     */
    public recycleNode(key: string, node: cc.Node | cc.Node[]): void {
        if (!node) return

        const nodeList = Array.isArray(node) ? node : [node]

        for (let i = nodeList.length - 1; i >= 0; i--) {
            const node = nodeList[i]

            const pool = this.poolMap.get(key)
            if (pool && node?.isValid) {
                pool.put(node)
            } else {
                node.removeFromParent()
                node.destroy()
            }
        }
    }

    public clear() {
        this.prefabMap.clear()
        this.poolMap.clear()
    }
}
