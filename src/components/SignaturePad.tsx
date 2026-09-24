import { forwardRef, useImperativeHandle, useRef } from "react";
import { StyleSheet, View } from "react-native";
import SignatureView, { type SignatureViewRef } from "react-native-signature-canvas";
import { colors, radius } from "../theme";

export type SignaturePadHandle = {
  read: () => Promise<string | null>;
  clear: () => void;
};

type Props = {
  height?: number;
  onBegin?: () => void;
  onEnd?: () => void;
};

const WEB_STYLE = `
  .m-signature-pad { box-shadow: none; border: none; margin: 0; }
  .m-signature-pad--body { border: none; }
  .m-signature-pad--footer { display: none; margin: 0; }
  body, html { width: 100%; height: 100%; }
`;

const stripDataUrl = (dataUrl: string) => dataUrl.match(/^data:[^;]+;base64,(.*)$/)?.[1] ?? dataUrl;

export const SignaturePad = forwardRef<SignaturePadHandle, Props>(({ height = 180, onBegin, onEnd }, ref) => {
  const viewRef = useRef<SignatureViewRef>(null);
  const pending = useRef<((value: string | null) => void) | null>(null);

  const settle = (value: string | null) => {
    pending.current?.(value);
    pending.current = null;
  };

  useImperativeHandle(ref, () => ({
    read: () =>
      new Promise((resolve) => {
        pending.current = resolve;
        viewRef.current?.readSignature();
      }),
    clear: () => viewRef.current?.clearSignature(),
  }));

  return (
    <View style={[styles.frame, { height }]}>
      <SignatureView
        ref={viewRef}
        onOK={(sig) => settle(stripDataUrl(sig))}
        onEmpty={() => settle(null)}
        onBegin={onBegin}
        onEnd={onEnd}
        webStyle={WEB_STYLE}
        penColor="black"
        backgroundColor="rgb(255,255,255)"
        trimWhitespace
        imageType="image/png"
        autoClear={false}
      />
    </View>
  );
});

SignaturePad.displayName = "SignaturePad";

const styles = StyleSheet.create({
  frame: {
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: radius.sm,
    overflow: "hidden",
    backgroundColor: colors.white,
  },
});
