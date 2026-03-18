import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";

import { useThemeStore } from "@/stores";
import { getDefaultTheme } from "@/utils";

interface TerminalProps {
  style?: any;
  onInput?: (data: string) => void;
  onReady?: (cols: number, rows: number) => void;
  onResize?: (cols: number, rows: number) => void;
  theme?: {
    background: string;
    foreground: string;
    cursor?: string;
    selection?: string;
  };
  showLoading?: boolean;
  connectionName?: string;
}

export type TerminalHandle = {
  write: (data: string) => void;
  clear: () => void;
  fit: () => void;
  focus: () => void;
};

const TerminalComponent = forwardRef<TerminalHandle, TerminalProps>(
  ({ style, onInput, onReady, onResize, theme, showLoading, connectionName }, ref) => {
    const webViewRef = useRef<WebView>(null);
    const isReadyRef = useRef(false);
    const pendingWritesRef = useRef<string[]>([]);
    const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isMountedRef = useRef(true);

    const [screenDimensions, setScreenDimensions] = useState(
      Dimensions.get("window"),
    );
    const [htmlContent, setHtmlContent] = useState("");
    const [isConnected, setIsConnected] = useState(false);

    const isDark = useThemeStore.getState().theme === 'dark';
    const terminalTheme = getDefaultTheme(!isDark).theme;

    const resolvedTheme = {
      background: terminalTheme.background,
      foreground: terminalTheme.foreground,
      cursor: terminalTheme.cursor,
      selection: terminalTheme.selection || "rgba(255,255,255,0.2)",
      black: terminalTheme.black,
      red: terminalTheme.red,
      green: terminalTheme.green,
      yellow: terminalTheme.yellow,
      blue: terminalTheme.blue,
      magenta: terminalTheme.magenta,
      cyan: terminalTheme.cyan,
      white: terminalTheme.white,
      brightBlack: terminalTheme.brightBlack,
      brightRed: terminalTheme.brightRed,
      brightGreen: terminalTheme.brightGreen,
      brightYellow: terminalTheme.brightYellow,
      brightBlue: terminalTheme.brightBlue,
      brightMagenta: terminalTheme.brightMagenta,
      brightCyan: terminalTheme.brightCyan,
      brightWhite: terminalTheme.brightWhite,
    };

    const generateHTML = useCallback(() => {
      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Terminal</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: ${resolvedTheme.background};
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      font-family: 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    }

    #terminal {
      width: 100vw;
      height: 100vh;
      min-height: 100vh;
      padding: 4px 4px 20px 4px;
      margin: 0;
      box-sizing: border-box;
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

    input, textarea, .xterm-helper-textarea {
      position: absolute !important;
      left: -9999px !important;
      top: -9999px !important;
      opacity: 0 !important;
    }
  </style>
  <link rel="stylesheet" href="https://unpkg.com/xterm@5.3.0/css/xterm.css" />
</head>
<body>
  <div id="terminal"></div>

  <script>
    // Robust logging to React Native
    window.lastLog = "";
    function logToNative(msg, type = 'log') {
      window.lastLog = msg;
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'debug',
          data: { message: msg, type }
        }));
      }
    }

    window.onerror = function(message, source, lineno, colno, error) {
      logToNative('JS Error: ' + message + ' at ' + source + ':' + lineno + ':' + colno, 'error');
      return true;
    };

    logToNative('WebView starting initialization...');

    function loadScript(url) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => {
          logToNative('Script loaded: ' + url);
          resolve();
        };
        script.onerror = () => {
          logToNative('Script fail: ' + url, 'error');
          reject(new Error('Failed to load script: ' + url));
        };
        document.head.appendChild(script);
      });
    }

    async function init() {
      try {
        await loadScript("https://unpkg.com/xterm@5.3.0/lib/xterm.js");
        await loadScript("https://unpkg.com/xterm-addon-fit@0.8.0/lib/xterm-addon-fit.js");

        logToNative('Creating terminal instance...');
        const terminal = new Terminal({
          cursorBlink: true,
          scrollback: 10000,
          fontSize: 14,
          lineHeight: 0.8,
          fontFamily: 'SF Mono, Monaco, Consolas, "Courier New", monospace',
          theme: {
            background: '${resolvedTheme.background}',
            foreground: '${resolvedTheme.foreground}',
            cursor: '${resolvedTheme.cursor}',
            selection: '${resolvedTheme.selection}',
            black: '${resolvedTheme.black}',
            red: '${resolvedTheme.red}',
            green: '${resolvedTheme.green}',
            yellow: '${resolvedTheme.yellow}',
            blue: '${resolvedTheme.blue}',
            magenta: '${resolvedTheme.magenta}',
            cyan: '${resolvedTheme.cyan}',
            white: '${resolvedTheme.white}',
            brightBlack: '${resolvedTheme.brightBlack}',
            brightRed: '${resolvedTheme.brightRed}',
            brightGreen: '${resolvedTheme.brightGreen}',
            brightYellow: '${resolvedTheme.brightYellow}',
            brightBlue: '${resolvedTheme.brightBlue}',
            brightMagenta: '${resolvedTheme.brightMagenta}',
            brightCyan: '${resolvedTheme.brightCyan}',
            brightWhite: '${resolvedTheme.brightWhite}'
          },
          allowTransparency: true,
          convertEol: true,
          screenReaderMode: false,
          windowsMode: false,
          macOptionIsMeta: false,
          macOptionClickForcesSelection: false,
          rightClickSelectsWord: false,
          fastScrollModifier: 'alt',
          fastScrollSensitivity: 5,
          allowProposedApi: true,
          disableStdin: true,
          cursorInactiveStyle: 'bar',
          altClickMovesCursor: false
        });

        const fitAddon = new FitAddon.FitAddon();
        terminal.loadAddon(fitAddon);
        const terminalElement = document.getElementById('terminal');
        terminal.open(terminalElement);
        logToNative('Terminal opened, cols: ' + terminal.cols + ' rows: ' + terminal.rows);

        window.writeToTerminal = function(data) {
          try { 
            terminal.write(data);
          } catch(e) {
            logToNative('Error writing: ' + e.message, 'error');
          }
        };

        window.clearTerminal = function() {
          try {
            terminal.clear();
            terminal.reset();
          } catch(e) {}
        };

        window.fitTerminal = function() {
          try {
            fitAddon.fit();
          } catch(e) {}
        };

        window.focusTerminal = function() {
          try { terminal.focus(); } catch(e) {}
        };

        terminal.onData((data) => {
          try {
            if (window.ReactNativeWebView) {
              const message = JSON.stringify({ type: 'input', data: data });
              window.ReactNativeWebView.postMessage(message);
            }
          } catch(e) {
            console.error('Error sending input:', e);
          }
        });

        // Simple resize handler
        window.addEventListener('resize', () => {
          setTimeout(() => {
            try {
              fitAddon.fit();
            } catch(e) {}
          }, 100);
        });

        // Send ready message
        setTimeout(() => {
          try {
            fitAddon.fit();
            if (window.ReactNativeWebView) {
              const message = JSON.stringify({
                type: 'terminalReady',
                data: { cols: terminal.cols, rows: terminal.rows }
              });
              window.ReactNativeWebView.postMessage(message);
            }
          } catch(e) {
            console.error('Error sending ready:', e);
          }
        }, 150);

      } catch (err) {
        logToNative('Init error: ' + err.message, 'error');
      }
    }

    init();
  </script>
</body>
</html>`;
    }, [resolvedTheme]);

    useEffect(() => {
      isMountedRef.current = true;
      // Generate HTML only once on mount
      setHtmlContent(generateHTML());
      return () => {
        isMountedRef.current = false;
        if (flushTimerRef.current) {
          clearTimeout(flushTimerRef.current);
          flushTimerRef.current = null;
        }
      };
    }, []); // Remove generateHTML dependency

    useEffect(() => {
      const subscription = Dimensions.addEventListener(
        "change",
        ({ window }) => {
          // No longer reloading HTML here, just letting CSS and handleResize handle it
          // But we can still keep handleResize as an event listener inside the WebView
        },
      );
      return () => subscription?.remove();
    }, []);

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
      try {
        const message = JSON.parse(event.nativeEvent.data);

        switch (message.type) {
          case "terminalReady":
            isReadyRef.current = true;
            setIsConnected(true);
            onReady?.(message.data.cols, message.data.rows);
            flushPendingWrites();
            webViewRef.current?.injectJavaScript(
              "window.focusTerminal(); window.resetScroll && window.resetScroll(); true;",
            );
            break;

          case "debug":
            break;

          case "input":
            onInput?.(message.data);
            break;

          case "resize":
            if (onResize) {
              onResize(message.data.cols, message.data.rows);
            }
            break;
        }
      } catch (error) {
        console.error("[Terminal] Error parsing WebView message:", error);
      }
    }, [onInput, onReady, onResize, flushPendingWrites]);

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
        webViewRef.current?.injectJavaScript("window.focusTerminal(); true;");
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
          scrollEnabled
          overScrollMode="never"
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          keyboardDisplayRequiresUserAction={false}
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
            <ActivityIndicator size="large" color="#22C55E" />
            <Text
              style={{
                color: "#ffffff",
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
