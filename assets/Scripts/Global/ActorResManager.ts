import * as cc from "cc";
import { AssetsHandler } from "../../Framework/AssetsManager/AssetsHandler";
import Singleton from "../../Framework/Utils/Singleton";
import { ActorConfig, IActorConfig } from "../Share/ActorConfig";


export class ActorResManager extends Singleton<ActorResManager>() {

    public async getActionAnimationClip(actorType: number): Promise<Map<string, cc.AnimationClip>> {
        const config = ActorConfig[actorType] as IActorConfig;
        const animations = config.animations;
        const clipNameList = Object.keys(animations).map(actionName => animations[actionName])

        const animationClipMap: Map<string, cc.AnimationClip> = new Map()
        const animationClipList = await Promise.all(
            clipNameList.map(clipName => this.loadOneAnimationClip(actorType, clipName))
        )

        animationClipList.forEach((clip, index) => {
            if (clip) {
                animationClipMap.set(clipNameList[index], clip)
            }
        })

        return animationClipMap
    }

    public async loadOneAnimationClip(actorType: number, clipName: string): Promise<cc.AnimationClip> {
        const bundle = await AssetsHandler.loadSubpackage(`${actorType}`)
        if (!bundle) {
            console.error('实体资源包不存在:' + actorType)
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
