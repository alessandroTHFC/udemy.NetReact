import { InputBaseComponentProps } from "@mui/material";
import { forwardRef, Ref, useImperativeHandle, useRef } from "react";

interface Props extends InputBaseComponentProps {}

//* here we forward our ref from Material UI text input then creating a ref inside StripeInput component that we're calling element Ref.
export const StripeInput = forwardRef(function StripeInput(
  { component: Component, ...props }: Props,
  ref: Ref<unknown>
) {
  const elementRef = useRef<any>();

  useImperativeHandle(ref, () => ({
    focus: () => elementRef.current.focus,
  }));

  return (
    <Component
      onReady={(element: any) => (elementRef.current = element)}
      {...props}
    />
  );
});
