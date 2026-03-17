import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { ViewStyle } from "react-native";
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
        padding: 6px 6px 20px 6px;
        box-sizing: border-box;
      }
      .xterm {
        width: 100% !important;
        height: 100% !important;
      }
      .xterm-viewport {
        width: 100% !important;
        height: 100% !important;
      }
      .xterm .xterm-viewport::-webkit-scrollbar {
        width: 0px;
        background: transparent;
      }
    </style>
  </head>
  <body>
    <div id="terminal"></div>
    <script>
      const terminal = new Terminal({
        cursorBlink: true,
        scrollback: 10000,
        fontSize: 13,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
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

      function notifyResize(type = 'resize') {
        try {
          fitAddon.fit();
          post(type, { cols: terminal.cols, rows: terminal.rows });
        } catch (e) {}
      }

      terminal.clear();
      terminal.reset();

      setTimeout(() => {
        notifyResize('terminalReady');
      }, 150);

      function post(type, data) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type, ...data }));
        }
      }

      terminal.onData((data) => {
        post('input', { data });
      });

      window.writeToTerminal = function(data) {
        try { terminal.write(data); } catch (e) { console.error(e); }
      };

      window.clearTerminal = function() {
        try { terminal.reset(); } catch (e) {}
      };

      window.fitTerminal = function() {
        notifyResize('resize');
      };

      window.focusTerminal = function() {
        try { terminal.focus(); } catch (e) {}
      };

      window.updateTheme = function(newTheme) {
        try {
          terminal.options.theme = newTheme;
          document.body.style.background = newTheme.background;
          const root = document.getElementById('terminal');
          if (root) root.style.background = newTheme.background;
        } catch (e) {}
      };

      window.addEventListener('resize', () => {
        notifyResize('resize');
      });
    </script>
  </body>
</html>
`;

export const Terminal = forwardRef<TerminalHandle, TerminalProps>(
  ({ style, onInput, onReady, onResize, theme }, ref) => {
    const webViewRef = useRef<WebView>(null);
    const resolvedTheme = useMemo(
      () => ({
        background: theme?.background ?? "#0b0b0b",
        foreground: theme?.foreground ?? "#e5e7eb",
        cursor: theme?.cursor ?? theme?.foreground ?? "#e5e7eb",
        selection: theme?.selection ?? "rgba(255,255,255,0.2)",
      }),
      [theme],
    );

    // Update theme without reloading WebView
    useEffect(() => {
      webViewRef.current?.injectJavaScript(
        `window.updateTheme(${JSON.stringify(resolvedTheme)}); true;`,
      );
    }, [resolvedTheme]);

    const html = useMemo(() => buildHtml(resolvedTheme), []); // Only initial HTML

    const handleMessage = useCallback(
      (event: any) => {
        try {
          const message: TerminalMessage = JSON.parse(event.nativeEvent.data);
          if (message.type === "input") {
            onInput?.(message.data);
          } else if (message.type === "terminalReady") {
            onReady?.(message.cols, message.rows);
          } else if (message.type === "resize") {
            onResize?.(message.cols, message.rows);
          }
        } catch {
          // ignore invalid messages
        }
      },
      [onInput, onReady, onResize],
    );

    useImperativeHandle(ref, () => ({
      write: (data: string) => {
        webViewRef.current?.injectJavaScript(
          `window.writeToTerminal(${JSON.stringify(data)}); true;`,
        );
      },
      clear: () => {
        webViewRef.current?.injectJavaScript("window.clearTerminal(); true;");
      },
      fit: () => {
        webViewRef.current?.injectJavaScript("window.fitTerminal(); true;");
      },
      focus: () => {
        webViewRef.current?.injectJavaScript("window.focusTerminal?.(); true;");
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
