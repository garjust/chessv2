import core, { Update } from '../core';

enum Type {
  Foo = 'FOO',
  Bar = 'BAR',
  Cat = 'CAT',
  ThisIsPrivate = 'THIS_IS_PRIVATE',
}

const fooAction = (val: number) =>
  ({
    type: Type.Foo,
    val,
  }) as const;

const barAction = (val: string) =>
  ({
    type: Type.Bar,
    val,
  }) as const;

const catAction = (val: boolean) =>
  ({
    type: Type.Cat,
    val,
  }) as const;

const thisIsPrivateAction = () =>
  ({
    type: Type.ThisIsPrivate,
  }) as const;

type Action =
  | ReturnType<typeof fooAction>
  | ReturnType<typeof barAction>
  | ReturnType<typeof catAction>
  | ReturnType<typeof thisIsPrivateAction>;

type Private =
  | (Action & { type: Type.ThisIsPrivate })
  | (Action & { type: Type.Cat });

// rest of workflow...

type State = { counter: number };

function handleFoo(
  state: State,
  action: Action & { type: Type.Foo },
): Update<State, Action> {
  return [{ ...state, counter: state.counter + action.val }, null];
}

function handleBar(
  state: State,
  action: Action & { type: Type.Bar },
): Update<State, Action> {
  console.log('bar!', action.val, state.counter);
  return [state, null];
}

function handleCat(
  state: State,
  action: Action & { type: Type.Cat },
): Update<State, Action> {
  console.log('is a cat?', action.val);
  return [state, thisIsPrivateAction];
}

function handleThisIsPrivate(
  state: State,
  _: Action & { type: Type.ThisIsPrivate },
): Update<State, Action> {
  console.log('thisisprivate');
  return [state, null];
}

const update = (state: State, action: Action): Update<State, Action> => {
  switch (action.type) {
    case Type.Foo:
      return handleFoo(state, action);
    case Type.Bar:
      return handleBar(state, action);
    case Type.Cat:
      return handleCat(state, action);
    case Type.ThisIsPrivate:
      return handleThisIsPrivate(state, action);
  }
};

const workflow = core<State, Action, Exclude<Action, Private>>(
  update,
  { counter: 0 },
  'test',
);

workflow.emit(fooAction(50));
workflow.emit(fooAction(60));
// workflow.emit(catAction(true));
workflow.emit(barAction('tahdah'));
// workflow.emit(thisIsPrivateAction()); // this should be a type error
