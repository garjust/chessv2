export const OptionDefinitions = {
  Hash: {
    name: 'Hash',
    type: 'spin',
    default: 128,
    min: 128,
    max: 1024,
  },
  OwnBook: {
    name: 'OwnBook',
    type: 'check',
    default: true,
  },
};

export type EngineOption =
  | { name: 'Hash'; value: typeof OptionDefinitions.Hash.default }
  | { name: 'OwnBook'; value: typeof OptionDefinitions.OwnBook.default };

export type EngineOptionName = EngineOption['name'];
