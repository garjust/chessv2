import { contextFactory } from '../../rx-workflow/react/context';
import { Action, createState, State } from './workflow';

export const { WorkflowContext, useWorkflow } = contextFactory<State, Action>(
  createState(),
);
