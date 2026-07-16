import * as cc from "cc";
import { AssetsHandler } from "../../Framework/AssetsManager/AssetsHandler";
import Singleton from "../../Framework/Utils/Singleton";
import { ActorConfig, IActorConfig } from "../Share/ActorConfig";
import { EActorType } from "../Share/Define";

// 角色动画Map <动作名，动画>
type ActorClipMap = Map<string, cc.AnimationClip>

export class ActorResManager extends Singleton<ActorResManager>() {
    public actorPrefabMap: Map<EActorType, cc.Prefab> = new Map()
    public actorClipMap: Map<EActorType, ActorClipMap> = new Map()

    public clear() {
        this.actorPrefabMap.clear()
        this.actorClipMap.clear()
    }

    public async prelaod(actorType: EActorType | EActorType[]): Promise<void> {
        const actorList = Array.isArray(actorType) ? actorType : [actorType]

        const actorResourceList = await Promise.all(
            actorList.map(async type => {
                const [prefab, clipMap] = await Promise.all([
                    this.preloadActorPrefab(type),
                    this.preloadActorAnimationClip(type),
                ])

                return { type, prefab, clipMap }
            })
        )

        actorResourceList.forEach(({ type, prefab, clipMap }) => {
            this.actorPrefabMap.set(type, prefab)
            this.actorClipMap.set(type, clipMap)
        })
    }

    /**加载角色预制 */
    public async preloadActorPrefab(actorType: EActorType): Promise<cc.Prefab> {
        return AssetsHandler.loadAssets(`BattleRes`, `Prefab/Actor`, cc.Prefab)
    }

    /** 加载指定角色的所有Clip */
    public async preloadActorAnimationClip(actorType: EActorType): Promise<Map<string, cc.AnimationClip>> {
        const config = ActorConfig[actorType] as IActorConfig;
        const animations = config.animations;
        const clipNameList = Object.keys(animations).map(actionName => animations[actionName])

        const animationClipMap: Map<string, cc.AnimationClip> = new Map()
        const animationClipList = await Promise.all(
            clipNameList.map(clipName => this.preloadOneAnimationClip(actorType, clipName))
        )

        animationClipList.forEach((clip, index) => {
            if (clip) {
                animationClipMap.set(clipNameList[index], clip)
            }
        })

        return animationClipMap
    }

    /** 加载指定的一个Clip */
    public async preloadOneAnimationClip(actorType: number, clipName: string): Promise<cc.AnimationClip> {
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
