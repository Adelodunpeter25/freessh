import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";

import { useThemeStore } from "@/stores";
import type { SessionProfile } from "@/types";

import { parseTerminalWebViewMessage } from "./bridge";
import { buildTerminalHtml } from "./html";
import { resolveTerminalPalette } from "./theme";
import type { TerminalThemeOverride } from "./types";

interface TerminalProps {
  style?: any;
  onInput?: (data: string) => void;
  onReady?: (cols: number, rows: number) => void;
  onResize?: (cols: number, rows: number) => void;
  theme?: TerminalThemeOverride;
  profile?: SessionProfile;
  showLoading?: boolean;
  connectionName?: string;
  nativeKeyboardEnabled?: boolean;
}

export type TerminalHandle = {
  write: (data: string) => void;
  clear: () => void;
  fit: () => void;
  focus: () => void;
  blur: () => void;
};

const TerminalComponent = forwardRef<TerminalHandle, TerminalProps>(
  (
    {
      style,
      onInput,
      onReady,
      onResize,
      theme,
      profile,
      showLoading,
      connectionName,
      nativeKeyboardEnabled = true,
    },
    ref,
  ) => {
    const webViewRef = useRef<WebView>(null);
    const isReadyRef = useRef(false);
    const pendingWritesRef = useRef<string[]>([]);
    const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isMountedRef = useRef(true);

    const [isConnected, setIsConnected] = useState(false);

    const isDark = useThemeStore((state) => state.theme === "dark");
    const resolvedTheme = useMemo(
      () => resolveTerminalPalette(isDark, profile, theme),
      [isDark, profile, theme],
    );
    const htmlContent = useMemo(
      () => buildTerminalHtml(resolvedTheme),
      [resolvedTheme],
    );

    useEffect(() => {
      isMountedRef.current = true;
      return () => {
        isMountedRef.current = false;
        if (flushTimerRef.current) {
          clearTimeout(flushTimerRef.current);
          flushTimerRef.current = null;
        }
      };
    }, []);

    useEffect(() => {
      if (!isMountedRef.current) return;
      webViewRef.current?.injectJavaScript(
        `
          window.setTerminalInputEnabled && window.setTerminalInputEnabled(${nativeKeyboardEnabled});
          ${nativeKeyboardEnabled ? "" : "window.blurTerminal && window.blurTerminal();"}
          true;
        `,
      );
    }, [nativeKeyboardEnabled]);

    const flushPendingWrites = useCallback(() => {
      if (!webViewRef.current || pendingWritesRef.current.length === 0 || !isMountedRef.current) return;
      const payload = pendingWritesRef.current.join("");
      pendingWritesRef.current = [];
      webViewRef.current.injectJavaScript(
        `window.writeToTerminal(${JSON.stringify(payload)}); true;`,
      );
    }, []);

    const scheduleFlush = useCallback(() => {
      if (flushTimerRef.current || !isMountedRef.current) return;
      flushTimerRef.current = setTimeout(() => {
        flushTimerRef.current = null;
        flushPendingWrites();
      }, 16);
    }, [flushPendingWrites]);

    const handleWebViewMessage = useCallback((event: any) => {
      if (!isMountedRef.current) return;
      const message = parseTerminalWebViewMessage(event.nativeEvent.data);
      if (!message) return;

      switch (message.type) {
        case "terminalReady":
          isReadyRef.current = true;
          setIsConnected(true);
          onReady?.(message.data.cols, message.data.rows);
          flushPendingWrites();
          webViewRef.current?.injectJavaScript(
            `
              window.setTerminalInputEnabled && window.setTerminalInputEnabled(${nativeKeyboardEnabled});
              ${nativeKeyboardEnabled ? "window.focusTerminal && window.focusTerminal();" : "window.blurTerminal && window.blurTerminal();"}
              window.resetScroll && window.resetScroll();
              true;
            `,
          );
          break;

        case "debug":
          break;

        case "input":
          onInput?.(message.data);
          break;

        case "resize":
          onResize?.(message.data.cols, message.data.rows);
          break;
      }
    }, [onInput, onReady, onResize, flushPendingWrites]);

    useEffect(() => {
      isReadyRef.current = false;
      setIsConnected(false);
    }, [htmlContent]);

    useImperativeHandle(ref, () => ({
      write: (data: string) => {
        if (!isMountedRef.current) return;
        pendingWritesRef.current.push(data);
        if (!isReadyRef.current) return;
        scheduleFlush();
      },
      clear: () => {
        if (!isMountedRef.current) return;
        pendingWritesRef.current = [];
        webViewRef.current?.injectJavaScript("window.clearTerminal(); true;");
      },
      fit: () => {
        if (!isMountedRef.current) return;
        webViewRef.current?.injectJavaScript("window.fitTerminal(); true;");
      },
      focus: () => {
        if (!isMountedRef.current) return;
        if (!nativeKeyboardEnabled) return;
        webViewRef.current?.injectJavaScript("window.focusTerminal(); true;");
      },
      blur: () => {
        if (!isMountedRef.current) return;
        webViewRef.current?.injectJavaScript("window.blurTerminal(); true;");
      },
    }));

    return (
      <View style={[{ flex: 1, position: 'relative' }, style]}>
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html: htmlContent }}
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            backgroundColor: resolvedTheme.background,
            opacity: isConnected || !showLoading ? 1 : 0,
          }}
          javaScriptEnabled
          scrollEnabled={false}
          overScrollMode="never"
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          // Prevent auto-showing the soft keyboard when a hardware keyboard is used.
          keyboardDisplayRequiresUserAction
          onMessage={handleWebViewMessage}
          onError={(e) => {}}
          onHttpError={(e) => {}}
          onLoad={() => {}}
          onLoadEnd={() => {}}
        />

        {showLoading && !isConnected && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: resolvedTheme.background,
            }}
          >
            <ActivityIndicator size="large" color={resolvedTheme.green} />
            <Text
              style={{
                color: resolvedTheme.foreground,
                fontSize: 16,
                marginTop: 16,
                textAlign: "center",
              }}
            >
              Connecting{connectionName ? ` to ${connectionName}` : "..."}
            </Text>
          </View>
        )}
      </View>
    );
  },
);

TerminalComponent.displayName = "Terminal";

export { TerminalComponent as Terminal };
export default TerminalComponent;
