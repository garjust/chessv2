/**
 * "Fake" symbol that only exists in the type system for branding types.
 */
declare const brandSymbol: unique symbol;

/**
 * Brand a type T to make it distinct from other T's.
 *
 * For example: a literal type (number, string, etc) can be branded so that
 * only literal types that have also been branded are valid.
 *
 * type brandedNumber = Brand<number, 'some_unique_string'>
 *
 * https://github.com/microsoft/TypeScript/issues/202
 */
type Brand<T, B> = T & { [brandSymbol]: B };

type Nullable<T> = T | undefined | null;
