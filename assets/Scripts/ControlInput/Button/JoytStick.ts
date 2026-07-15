import * as cc from "cc";
const { ccclass, property, menu } = cc._decorator;

export interface IJoystickOptions {
    onOperate: (normalizeDir: cc.Vec2) => void,
}

@ccclass
export default class JoytStick extends cc.Component {
    @property(cc.Node)
    private body: cc.Node;
    @property(cc.Node)
    private stick: cc.Node;

    private _options!: IJoystickOptions;
    public get options(): IJoystickOptions {
        return this._options;
    }
    public set options(v: IJoystickOptions) {
        this._options = v;
    }

    private defaultPosition: cc.Vec3;
    private radius: number = 0;

    onLoad() {
        this.defaultPosition = this.body.position.clone();
        this.radius = this.body.getComponent(cc.UITransform).width / 2;
        cc.input.on(cc.Input.EventType.TOUCH_START, this.onTouchStart, this);
        cc.input.on(cc.Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        cc.input.on(cc.Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onDestroy() {
        cc.input.off(cc.Input.EventType.TOUCH_START, this.onTouchStart, this);
        cc.input.off(cc.Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        cc.input.off(cc.Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    private onTouchStart(event: cc.EventTouch) {
        const touchPos = event.getUILocation();
        this.body.setWorldPosition(touchPos.x, touchPos.y, 0);
    }

    private onTouchMove(event: cc.EventTouch) {
        const touchPos = event.getUILocation();
        const stickPos = new cc.Vec3(touchPos.x - this.body.worldPosition.x, touchPos.y - this.body.worldPosition.y);
        if (stickPos.length() > this.radius) {
            stickPos.multiplyScalar(this.radius / stickPos.length());
        }

        this.stick.setPosition(stickPos);
        this.options?.onOperate(stickPos.normalize() as unknown as cc.Vec2)
    }
    private onTouchEnd() {
        this.body.setPosition(this.defaultPosition);
        this.stick.setPosition(0, 0, 0);
        this.options?.onOperate(cc.v2(0, 0))
    }
}