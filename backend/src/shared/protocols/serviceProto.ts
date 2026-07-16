import { ServiceProto } from 'tsrpc-proto';
import { MsgClientInput } from './client/MsgClientInput';
import { ReqJoin, ResJoin } from './PtlJoin';
import { MsgFrame } from './server/MsgFrame';

export interface ServiceType {
    api: {
        "Join": {
            req: ReqJoin,
            res: ResJoin
        }
    },
    msg: {
        "client/ClientInput": MsgClientInput,
        "server/Frame": MsgFrame
    }
}

export const serviceProto: ServiceProto<ServiceType> = {
    "version": 1,
    "services": [
        {
            "id": 0,
            "name": "client/ClientInput",
            "type": "msg"
        },
        {
            "id": 1,
            "name": "Join",
            "type": "api"
        },
        {
            "id": 2,
            "name": "server/Frame",
            "type": "msg"
        }
    ],
    "types": {
        "client/MsgClientInput/MsgClientInput": {
            "type": "Reference",
            "target": "client/MsgClientInput/IMsgClientInput"
        },
        "client/MsgClientInput/IMsgClientInput": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "sn",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "inputs",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../Define/IClientInput"
                        }
                    }
                }
            ]
        },
        "../Define/IClientInput": {
            "type": "Union",
            "members": [
                {
                    "id": 0,
                    "type": {
                        "target": {
                            "type": "Reference",
                            "target": "../Define/IActorMove"
                        },
                        "keys": [
                            "actorId"
                        ],
                        "type": "Omit"
                    }
                },
                {
                    "id": 1,
                    "type": {
                        "target": {
                            "type": "Reference",
                            "target": "../Define/IActorAttack"
                        },
                        "keys": [
                            "actorId"
                        ],
                        "type": "Omit"
                    }
                }
            ]
        },
        "../Define/IActorMove": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "type",
                    "type": {
                        "type": "Literal",
                        "literal": 0
                    }
                },
                {
                    "id": 1,
                    "name": "actorId",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 2,
                    "name": "moveDirection",
                    "type": {
                        "type": "Reference",
                        "target": "../Define/IVec2"
                    }
                },
                {
                    "id": 3,
                    "name": "dt",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "../Define/EInputType": {
            "type": "Enum",
            "members": [
                {
                    "id": 0,
                    "value": 0
                },
                {
                    "id": 1,
                    "value": 1
                },
                {
                    "id": 2,
                    "value": 2
                },
                {
                    "id": 3,
                    "value": 3
                },
                {
                    "id": 4,
                    "value": 4
                }
            ]
        },
        "../Define/IVec2": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "x",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "y",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "../Define/IActorAttack": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "type",
                    "type": {
                        "type": "Literal",
                        "literal": 1
                    }
                },
                {
                    "id": 1,
                    "name": "actorId",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "PtlJoin/ReqJoin": {
            "type": "Reference",
            "target": "PtlJoin/IReqJoin"
        },
        "PtlJoin/IReqJoin": {
            "type": "Interface"
        },
        "PtlJoin/ResJoin": {
            "type": "Reference",
            "target": "PtlJoin/IResJoin"
        },
        "PtlJoin/IResJoin": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "actorId",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "gameState",
                    "type": {
                        "type": "Reference",
                        "target": "../Define/IGameSystemState"
                    }
                }
            ]
        },
        "../Define/IGameSystemState": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "now",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "actors",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../Define/IActor"
                        }
                    }
                }
            ]
        },
        "../Define/IActor": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "id",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "hp",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 2,
                    "name": "type",
                    "type": {
                        "type": "Reference",
                        "target": "../Define/EActorType"
                    }
                },
                {
                    "id": 3,
                    "name": "pos",
                    "type": {
                        "type": "Reference",
                        "target": "../Define/IVec2"
                    }
                },
                {
                    "id": 4,
                    "name": "dir",
                    "type": {
                        "type": "Reference",
                        "target": "../Define/EActorDir"
                    }
                },
                {
                    "id": 5,
                    "name": "state",
                    "type": {
                        "type": "Reference",
                        "target": "../Define/EActorState"
                    }
                },
                {
                    "id": 6,
                    "name": "stateStartTime",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 7,
                    "name": "stateEndTime",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 8,
                    "name": "stateVersion",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "../Define/EActorType": {
            "type": "Enum",
            "members": [
                {
                    "id": 0,
                    "value": 10001
                },
                {
                    "id": 1,
                    "value": 10002
                },
                {
                    "id": 2,
                    "value": 10003
                },
                {
                    "id": 3,
                    "value": 10004
                }
            ]
        },
        "../Define/EActorDir": {
            "type": "Enum",
            "members": [
                {
                    "id": 0,
                    "value": -1
                },
                {
                    "id": 1,
                    "value": 1
                }
            ]
        },
        "../Define/EActorState": {
            "type": "Enum",
            "members": [
                {
                    "id": 0,
                    "value": "Dead"
                },
                {
                    "id": 1,
                    "value": "Hurt"
                },
                {
                    "id": 2,
                    "value": "Attack"
                },
                {
                    "id": 3,
                    "value": "Move"
                },
                {
                    "id": 4,
                    "value": "Idle"
                }
            ]
        },
        "server/MsgFrame/MsgFrame": {
            "type": "Reference",
            "target": "server/MsgFrame/IMsgFrame"
        },
        "server/MsgFrame/IMsgFrame": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "inputs",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../Define/IGameSystemInput"
                        }
                    }
                },
                {
                    "id": 1,
                    "name": "lastSn",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                }
            ]
        },
        "../Define/IGameSystemInput": {
            "type": "Union",
            "members": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../Define/IActorMove"
                    }
                },
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "../Define/IActorAttack"
                    }
                },
                {
                    "id": 2,
                    "type": {
                        "type": "Reference",
                        "target": "../Define/ITimePast"
                    }
                },
                {
                    "id": 3,
                    "type": {
                        "type": "Reference",
                        "target": "../Define/IActorJoin"
                    }
                },
                {
                    "id": 4,
                    "type": {
                        "type": "Reference",
                        "target": "../Define/IActorLeave"
                    }
                }
            ]
        },
        "../Define/ITimePast": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "type",
                    "type": {
                        "type": "Literal",
                        "literal": 2
                    }
                },
                {
                    "id": 1,
                    "name": "dt",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "../Define/IActorJoin": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "type",
                    "type": {
                        "type": "Literal",
                        "literal": 3
                    }
                },
                {
                    "id": 1,
                    "name": "actor",
                    "type": {
                        "type": "Reference",
                        "target": "../Define/IActor"
                    }
                }
            ]
        },
        "../Define/IActorLeave": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "type",
                    "type": {
                        "type": "Literal",
                        "literal": 4
                    }
                },
                {
                    "id": 1,
                    "name": "actorId",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        }
    }
};