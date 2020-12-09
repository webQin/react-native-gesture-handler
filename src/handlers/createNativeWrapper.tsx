import React, { useImperativeHandle, useRef } from 'react';

import NativeViewGestureHandler, {
  NativeViewGestureHandlerProperties,
  nativeViewProperties,
} from './NativeViewGestureHandler';

/*
 * This array should consist of:
 *   - All keys in propTypes from NativeGestureHandler
 *     (and all keys in GestureHandlerPropTypes)
 *   - 'onGestureHandlerEvent'
 *   - 'onGestureHandlerStateChange'
 */
const NATIVE_WRAPPER_PROPS_FILTER = [
  ...nativeViewProperties,
  'onGestureHandlerEvent',
  'onGestureHandlerStateChange',
] as const;

export default function createNativeWrapper<
  P extends NativeViewGestureHandlerProperties
>(
  Component: React.ComponentType<P>,
  config: Readonly<Record<string, unknown>> = {}
) {
  const ComponentWrapper = React.forwardRef<React.ComponentType<P>, P>(
    (props, ref) => {
      // filter out props that should be passed to gesture handler wrapper
      const gestureHandlerProps = Object.keys(props).reduce(
        (res, key) => {
          // TS being overly protective with it's types, see https://github.com/microsoft/TypeScript/issues/26255#issuecomment-458013731 fpr more info
          const allowedKeys: readonly string[] = NATIVE_WRAPPER_PROPS_FILTER;
          if (allowedKeys.includes(key)) {
            // @ts-ignore FIXME(TS)
            res[key] = props[key];
          }
          return res;
        },
        { ...config } // watch out not to modify config
      );
      const _ref = useRef<React.ComponentType<P>>();
      const _gestureHandlerRef = useRef<React.ComponentType<P>>();
      useImperativeHandle(
        ref,
        // @ts-ignore TODO(TS) decide how nulls work in this context
        () => {
          const node = _gestureHandlerRef.current;
          // add handlerTag for relations config
          if (_ref.current && node) {
            // @ts-ignore FIXME(TS) think about createHandler return type
            _ref.current._handlerTag = node._handlerTag;
            return _ref.current;
          }
          return null;
        },
        [_ref, _gestureHandlerRef]
      );
      return <NativeViewGestureHandler {...gestureHandlerProps} />;
    }
  );

  ComponentWrapper.displayName = Component.displayName || 'ComponentWrapper';

  return ComponentWrapper;
}