import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import type { ViewStyle } from "react-native";
import { WebView } from "react-native-webview";

export type TerminalHandle = {
  write: (data: string) => void;
  clear: () => void;
  fit: () => void;
  focus: () => void;
};

type TerminalProps = {
  style?: ViewStyle;
  onInput?: (data: string) => void;
  onReady?: (cols: number, rows: number) => void;
  onResize?: (cols: number, rows: number) => void;
  theme?: {
    background: string;
    foreground: string;
    cursor?: string;
    selection?: string;
  };
};

type TerminalMessage =
  | { type: "input"; data: string }
  | { type: "terminalReady"; cols: number; rows: number }
  | { type: "resize"; cols: number; rows: number };

const buildHtml = (theme: Required<NonNullable<TerminalProps["theme"]>>) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <script src="https://unpkg.com/xterm@5.3.0/lib/xterm.js"></script>
    <script src="https://unpkg.com/xterm-addon-fit@0.8.0/lib/xterm-addon-fit.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/xterm@5.3.0/css/xterm.css" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100vw;
        height: 100vh;
        background: ${theme.background};
        overflow: hidden;
      }

      #terminal {
        width: 100vw;
        height: 100vh;
        min-height: 100vh;
        padding: 6px 6px 20px 6px;
        margin: 0;
        box-sizing: border-box;
        background: ${theme.background};
      }

      .xterm {
        width: 100% !important;
        height: 100% !important;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
      }

      .xterm-viewport {
        width: 100% !important;
        height: 100% !important;
      }

      .xterm .xterm-viewport::-webkit-scrollbar {
        width: 8px;
        background: transparent;
      }

      .xterm .xterm-viewport::-webkit-scrollbar-thumb {
        background: rgba(180,180,180,0.55);
        border-radius: 4px;
      }
    </style>
  </head>
  <body>
    <div id="terminal"></div>
    <script>
      const terminal = new Terminal({
        cursorBlink: true,
        scrollback: 10000,
        fontSize: 14,
        lineHeight: 1.2,
        fontFamily: 'SF Mono, Menlo, Monaco, Consolas, "Courier New", monospace',
        theme: {
          background: '${theme.background}',
          foreground: '${theme.foreground}',
          cursor: '${theme.cursor}',
          selection: '${theme.selection}',
          black: '#000000',
          red: '#ff5555',
          green: '#50fa7b',
          yellow: '#f1fa8c',
          blue: '#bd93f9',
          magenta: '#ff79c6',
          cyan: '#8be9fd',
          white: '#bfbfbf',
          brightBlack: '#4d4d4d',
          brightRed: '#ff6e67',
          brightGreen: '#5af78e',
          brightYellow: '#f4f99d',
          brightBlue: '#caa9fa',
          brightMagenta: '#ff92d0',
          brightCyan: '#9aedfe',
          brightWhite: '#e6e6e6'
        },
        allowTransparency: true,
        convertEol: true,
      });

      const fitAddon = new FitAddon.FitAddon();
      terminal.loadAddon(fitAddon);
      terminal.open(document.getElementById('terminal'));

      function post(type, data) {
        if (!window.ReactNativeWebView) return;
        window.ReactNativeWebView.postMessage(JSON.stringify({ type, ...data }));
      }

      function notifyResize(type) {
        try {
          fitAddon.fit();
          post(type || 'resize', { cols: terminal.cols, rows: terminal.rows });
        } catch (e) {}
      }

      let resizeTimer = null;
      function debouncedResize(type) {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          resizeTimer = null;
          notifyResize(type || 'resize');
        }, 80);
      }

      terminal.onData((data) => {
        post('input', { data });
      });

      window.writeToTerminal = function(data) {
        try { terminal.write(data); } catch (e) {}
      };

      window.clearTerminal = function() {
        try {
          terminal.clear();
          terminal.reset();
        } catch (e) {}
      };

      window.fitTerminal = function() {
        debouncedResize('resize');
      };

      window.focusTerminal = function() {
        try { terminal.focus(); } catch (e) {}
      };

      window.updateTheme = function(nextTheme) {
        try {
          terminal.options.theme = nextTheme;
          document.body.style.background = nextTheme.background;
          const root = document.getElementById('terminal');
          if (root) root.style.background = nextTheme.background;
        } catch (e) {}
      };

      terminal.clear();
      terminal.reset();

      setTimeout(() => {
        notifyResize('terminalReady');
      }, 150);

      window.addEventListener('resize', () => debouncedResize('resize'));
      window.addEventListener('orientationchange', () => {
        setTimeout(() => debouncedResize('resize'), 100);
      });
    </script>
  </body>
</html>
`;

export const Terminal = forwardRef<TerminalHandle, TerminalProps>(
  ({ style, onInput, onReady, onResize, theme }, ref) => {
    const webViewRef = useRef<WebView>(null);
    const isReadyRef = useRef(false);
    const pendingWritesRef = useRef<string[]>([]);

    const resolvedTheme = useMemo(
      () => ({
        background: theme?.background ?? "#0b0b0b",
        foreground: theme?.foreground ?? "#e5e7eb",
        cursor: theme?.cursor ?? theme?.foreground ?? "#e5e7eb",
        selection: theme?.selection ?? "rgba(255,255,255,0.2)",
      }),
      [theme],
    );

    const html = useMemo(() => buildHtml(resolvedTheme), []);

    const flushPendingWrites = useCallback(() => {
      if (!webViewRef.current || pendingWritesRef.current.length === 0) return;
      const payload = pendingWritesRef.current.join("");
      pendingWritesRef.current = [];
      webViewRef.current.injectJavaScript(
        `window.writeToTerminal(${JSON.stringify(payload)}); true;`,
      );
    }, []);

    useEffect(() => {
      webViewRef.current?.injectJavaScript(
        `window.updateTheme(${JSON.stringify(resolvedTheme)}); true;`,
      );
    }, [resolvedTheme]);

    const handleMessage = useCallback(
      (event: any) => {
        try {
          const message: TerminalMessage = JSON.parse(event.nativeEvent.data);
          if (message.type === "input") {
            onInput?.(message.data);
            return;
          }

          if (message.type === "terminalReady") {
            isReadyRef.current = true;
            onReady?.(message.cols, message.rows);
            flushPendingWrites();
            return;
          }

          if (message.type === "resize") {
            onResize?.(message.cols, message.rows);
          }
        } catch {
          // ignore malformed messages
        }
      },
      [flushPendingWrites, onInput, onReady, onResize],
    );

    useImperativeHandle(ref, () => ({
      write: (data: string) => {
        if (!isReadyRef.current) {
          pendingWritesRef.current.push(data);
          return;
        }

        webViewRef.current?.injectJavaScript(
          `window.writeToTerminal(${JSON.stringify(data)}); true;`,
        );
      },
      clear: () => {
        pendingWritesRef.current = [];
        webViewRef.current?.injectJavaScript("window.clearTerminal(); true;");
      },
      fit: () => {
        webViewRef.current?.injectJavaScript("window.fitTerminal(); true;");
      },
      focus: () => {
        webViewRef.current?.injectJavaScript("window.focusTerminal(); true;");
      },
    }));

    return (
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html }}
        onMessage={handleMessage}
        style={style}
        javaScriptEnabled
        scrollEnabled={false}
        keyboardDisplayRequiresUserAction={false}
      />
    );
  },
);

Terminal.displayName = "Terminal";
