import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import { ViewStyle } from 'react-native'
import { WebView } from 'react-native-webview'

export type TerminalHandle = {
  write: (data: string) => void
  clear: () => void
  fit: () => void
  focus: () => void
}

type TerminalProps = {
  style?: ViewStyle
  onInput?: (data: string) => void
  onReady?: (cols: number, rows: number) => void
  theme?: {
    background: string
    foreground: string
    cursor?: string
    selection?: string
  }
}

type TerminalMessage =
  | { type: 'input'; data: string }
  | { type: 'ready'; cols: number; rows: number }
  | { type: 'resize'; cols: number; rows: number }

const buildHtml = (theme: Required<NonNullable<TerminalProps['theme']>>) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://unpkg.com/xterm@5.3.0/lib/xterm.js"></script>
    <script src="https://unpkg.com/xterm-addon-fit@0.8.0/lib/xterm-addon-fit.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/xterm@5.3.0/css/xterm.css" />
    <style>
      html, body, #terminal {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: ${theme.background};
      }
      #terminal {
        padding: 6px;
        box-sizing: border-box;
      }
      .xterm .xterm-viewport::-webkit-scrollbar {
        width: 8px;
        background: transparent;
      }
      .xterm .xterm-viewport::-webkit-scrollbar-thumb {
        background: rgba(180,180,180,0.6);
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
        theme: {
          background: '${theme.background}',
          foreground: '${theme.foreground}',
          cursor: '${theme.cursor}',
          selection: '${theme.selection}'
        }
      });
      const fitAddon = new FitAddon.FitAddon();
      terminal.loadAddon(fitAddon);
      terminal.open(document.getElementById('terminal'));
      fitAddon.fit();

      function post(type, data) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type, ...data }));
      }

      terminal.onData((data) => {
        post('input', { data });
      });

      window.writeToTerminal = function(data) {
        try { terminal.write(data); } catch (e) {}
      };

      window.clearTerminal = function() {
        try { terminal.reset(); terminal.write('\\x1b[2J\\x1b[H'); } catch (e) {}
      };

      window.fitTerminal = function() {
        try { fitAddon.fit(); } catch (e) {}
        post('resize', { cols: terminal.cols, rows: terminal.rows });
      };

      post('ready', { cols: terminal.cols, rows: terminal.rows });
      window.addEventListener('resize', () => {
        window.fitTerminal();
      });
    </script>
  </body>
</html>
`

export const Terminal = forwardRef<TerminalHandle, TerminalProps>(
  ({ style, onInput, onReady, theme }, ref) => {
    const webViewRef = useRef<WebView>(null)
    const resolvedTheme = useMemo(
      () => ({
        background: theme?.background ?? '#0b0b0b',
        foreground: theme?.foreground ?? '#e5e7eb',
        cursor: theme?.cursor ?? (theme?.foreground ?? '#e5e7eb'),
        selection: theme?.selection ?? 'rgba(255,255,255,0.2)',
      }),
      [theme]
    )
    const html = useMemo(() => buildHtml(resolvedTheme), [resolvedTheme])

    const handleMessage = useCallback(
      (event: any) => {
        try {
          const message: TerminalMessage = JSON.parse(event.nativeEvent.data)
          if (message.type === 'input') {
            onInput?.(message.data)
          } else if (message.type === 'ready') {
            onReady?.(message.cols, message.rows)
          } else if (message.type === 'resize') {
            onReady?.(message.cols, message.rows)
          }
        } catch {
          // ignore invalid messages
        }
      },
      [onInput, onReady]
    )

    useImperativeHandle(ref, () => ({
      write: (data: string) => {
        webViewRef.current?.injectJavaScript(
          `window.writeToTerminal(${JSON.stringify(data)}); true;`
        )
      },
      clear: () => {
        webViewRef.current?.injectJavaScript('window.clearTerminal(); true;')
      },
      fit: () => {
        webViewRef.current?.injectJavaScript('window.fitTerminal(); true;')
      },
      focus: () => {
        webViewRef.current?.injectJavaScript('window.fitTerminal(); true;')
      },
    }))

    return (
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html }}
        onMessage={handleMessage}
        style={style}
        javaScriptEnabled
        scrollEnabled={false}
        keyboardDisplayRequiresUserAction={false}
      />
    )
  }
)

Terminal.displayName = 'Terminal'
