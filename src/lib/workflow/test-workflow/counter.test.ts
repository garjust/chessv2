import { expect, test } from 'vitest';
import { workflow } from '..';
import { update } from './counter';

test('workflow', () => {
  const { emit, states, updates } = workflow(update({ multiplier: 2 }), {
    count: 10,
  });
});
