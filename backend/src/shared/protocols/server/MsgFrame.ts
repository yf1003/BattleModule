import { IGameSystemInput } from '../../Define';

export interface IMsgFrame {
    inputs: IGameSystemInput[];
    /** 当前连接已经被服务端接纳的最后一条输入序号。 */
    lastSn?: number;
}

export type MsgFrame = IMsgFrame;
