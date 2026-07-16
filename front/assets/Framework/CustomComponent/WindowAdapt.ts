import * as cc from "cc";

const { ccclass, property, menu, executionOrder } = cc._decorator;

@ccclass('WindowAdapt')
@menu('Framework/CustomComponent/WindowAdapt')
@executionOrder(-1)
export class WindowAdapt extends cc.Component {
    onLoad() {
        this.getComponent(cc.UITransform).setContentSize(cc.view.getVisibleSize())
    }
}

