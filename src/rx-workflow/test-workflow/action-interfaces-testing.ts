import core, { Update } from '../core';

enum Type {
  Foo = 'FOO',
  Bar = 'BAR',
  Cat = 'CAT',
}

// type FooAction = {
//   type: Type.Foo;
//   val: number;
// };

type BarAction = {
  type: Type.Bar;
  val: string;
};

type CatAction = {
  type: Type.Cat;
  val: boolean;
};

const fooAction = (val: number): { type: Type.Foo; val: number } => ({
  type: Type.Foo,
  val,
});

type FooAction = ReturnType<typeof fooAction>;

const barAction = (val: string): BarAction => ({
  type: Type.Bar,
  val,
});

const catAction = (val: boolean): CatAction => ({
  type: Type.Cat,
  val,
});

type Action = FooAction | BarAction | CatAction;

// rest of workflow...

type State = { counter: number };

const update = (state: State, action: Action): Update<State, Action> => {
  switch (action.type) {
    case Type.Foo:
      return [{ ...state, counter: state.counter + action.val }, null];
    case Type.Bar:
      console.log('bar!', action.val, state.counter);
      return [state, null];
    case Type.Cat:
      console.log('is a cat?', action.val);
      return [state, null];
  }
};

const workflow = core<State, Action>(update, { counter: 0 }, 'test');

workflow.emit(fooAction(50));
workflow.emit(fooAction(60));
workflow.emit(catAction(true));
workflow.emit(barAction('tahdah'));
