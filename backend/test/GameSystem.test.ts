import { strict as assert } from 'assert';
import {
    EActorDir,
    EActorState,
    EActorType,
    EInputType,
    IActor,
} from '../src/shared/Define';
import { GameSystem } from '../src/shared/GameSystem';

function createActor(id: number): IActor {
    return {
        id,
        hp: 100,
        type: EActorType.HERO,
        pos: { x: 0, y: 0 },
        dir: EActorDir.Right,
        state: EActorState.Idle,
        stateStartTime: 0,
        stateEndTime: 0,
        stateVersion: 0,
    };
}

describe('GameSystem', () => {
    it('applies join, movement and leave inputs deterministically', () => {
        const gameSystem = new GameSystem();
        gameSystem.applyInput({
            type: EInputType.ActorJoin,
            actor: createActor(1),
        });
        gameSystem.applyInput({
            type: EInputType.ActorMove,
            actorId: 1,
            moveDirection: { x: 1, y: 0 },
            dt: 0.1,
        });

        assert.equal(gameSystem.state.actors[0].pos.x, 30);
        assert.equal(gameSystem.state.actors[0].state, EActorState.Move);

        gameSystem.applyInput({
            type: EInputType.ActorLeave,
            actorId: 1,
        });
        assert.equal(gameSystem.state.actors.length, 0);
    });

    it('locks movement during attack and unlocks after time advances', () => {
        const gameSystem = new GameSystem();
        gameSystem.applyInput({
            type: EInputType.ActorJoin,
            actor: createActor(1),
        });
        gameSystem.applyInput({
            type: EInputType.ActorAttack,
            actorId: 1,
        });
        gameSystem.applyInput({
            type: EInputType.ActorMove,
            actorId: 1,
            moveDirection: { x: 1, y: 0 },
            dt: 0.1,
        });

        assert.equal(gameSystem.state.actors[0].pos.x, 0);
        assert.equal(gameSystem.state.actors[0].state, EActorState.Attack);

        gameSystem.applyInput({
            type: EInputType.TimePast,
            dt: 0.4,
        });
        assert.equal(gameSystem.state.actors[0].state, EActorState.Idle);
    });

    it('deep-clones snapshots when resetting state', () => {
        const source = new GameSystem();
        source.applyInput({
            type: EInputType.ActorJoin,
            actor: createActor(1),
        });

        const copy = new GameSystem();
        copy.reset(source.state as any);
        copy.state.actors[0].pos.x = 99;

        assert.equal(source.state.actors[0].pos.x, 0);
    });
});
