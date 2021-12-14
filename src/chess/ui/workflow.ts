import { contextFactory } from '../../lib/workflow-react/context';
import { Action, Context, createState, State } from '../engine';

export const { WorkflowContext, useWorkflow } = contextFactory<
  State,
  Action,
  Context
>(createState());
