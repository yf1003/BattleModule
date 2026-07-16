import { IClientInput } from '../../Define';

export interface IMsgClientInput {
    sn: number;
    inputs: IClientInput[];
}

export type MsgClientInput = IMsgClientInput;
