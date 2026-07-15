import * as cc from "cc";
import { AssetsHandler } from "../../Framework/AssetsManager/AssetsHandler";
import Singleton from "../../Framework/Utils/Singleton";


export class EntityResManager extends Singleton<EntityResManager>() {

    public async loadEntityAnimationClip(entityId: number, clipName: string) {
        const bundle = await AssetsHandler.loadSubpackage(`${entityId}`)
        if (!bundle) {
            console.error('实体资源包不存在:'+entityId)
            return null
        }

        return new Promise((resolve, reject) => {
            bundle.load(`Animations/${clipName}`, cc.AnimationClip, (error, clip) => {
                if (error) {
                    console.error('加载错误:', error)
                }
                resolve(clip || null)
            })
        })
    }

}