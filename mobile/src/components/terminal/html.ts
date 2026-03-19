import type { TerminalPalette } from "./types";

function escapeTemplateString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

export function buildTerminalHtml(theme: TerminalPalette): string {
  const colors = Object.fromEntries(
    Object.entries(theme).map(([key, value]) => [key, escapeTemplateString(value)]),
  ) as TerminalPalette;

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
      background-color: ${colors.background};
      overflow: hidden;
      width: 100%;
      height: 100%;
      font-family: 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    }

    #terminal {
      width: 100%;
      height: 100%;
      min-height: 100%;
      padding: 0;
      margin: 0;
      box-sizing: border-box;
    }

    .xterm {
      width: 100% !important;
      height: 100% !important;
      text-rendering: auto;
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
  <link rel="stylesheet" href="https://unpkg.com/xterm@5.3.0/css/xterm.css" />
</head>
<body>
  <div id="terminal"></div>

  <script>
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

    window.onerror = function(message, source, lineno, colno) {
      logToNative('JS Error: ' + message + ' at ' + source + ':' + lineno + ':' + colno, 'error');
      return true;
    };

    function loadScript(url) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load script: ' + url));
        document.head.appendChild(script);
      });
    }

    async function init() {
      try {
        await loadScript("https://unpkg.com/xterm@5.3.0/lib/xterm.js");
        await loadScript("https://unpkg.com/xterm-addon-fit@0.8.0/lib/xterm-addon-fit.js");

        const terminal = new Terminal({
          cursorBlink: true,
          scrollback: 10000,
          fontSize: 14,
          lineHeight: 1.15,
          fontFamily: 'SF Mono, Monaco, Consolas, "Courier New", monospace',
          theme: {
            background: '${colors.background}',
            foreground: '${colors.foreground}',
            cursor: '${colors.cursor}',
            selection: '${colors.selection}',
            black: '${colors.black}',
            red: '${colors.red}',
            green: '${colors.green}',
            yellow: '${colors.yellow}',
            blue: '${colors.blue}',
            magenta: '${colors.magenta}',
            cyan: '${colors.cyan}',
            white: '${colors.white}',
            brightBlack: '${colors.brightBlack}',
            brightRed: '${colors.brightRed}',
            brightGreen: '${colors.brightGreen}',
            brightYellow: '${colors.brightYellow}',
            brightBlue: '${colors.brightBlue}',
            brightMagenta: '${colors.brightMagenta}',
            brightCyan: '${colors.brightCyan}',
            brightWhite: '${colors.brightWhite}'
          },
          allowTransparency: false,
          convertEol: true,
          screenReaderMode: false,
          windowsMode: false,
          macOptionIsMeta: false,
          macOptionClickForcesSelection: false,
          rightClickSelectsWord: false,
          fastScrollModifier: 'alt',
          fastScrollSensitivity: 5,
          allowProposedApi: true,
          disableStdin: false,
          cursorStyle: 'bar',
          cursorInactiveStyle: 'bar',
          altClickMovesCursor: false
        });
        window.terminal = terminal;

        const fitAddon = new FitAddon.FitAddon();
        terminal.loadAddon(fitAddon);
        terminal.open(document.getElementById('terminal'));

        let lastCols = terminal.cols;
        let lastRows = terminal.rows;

        const postResizeIfNeeded = function() {
          try {
            const cols = terminal.cols;
            const rows = terminal.rows;
            if (cols === lastCols && rows === lastRows) return;
            lastCols = cols;
            lastRows = rows;
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'resize',
                data: { cols, rows }
              }));
            }
          } catch (e) {}
        };

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

        window.blurTerminal = function() {
          try { terminal.blur(); } catch(e) {}
        };

        window.setTerminalInputEnabled = function(enabled) {
          try {
            terminal.options.disableStdin = !enabled;
            if (!enabled) {
              terminal.blur();
              if (document.activeElement && document.activeElement.blur) {
                document.activeElement.blur();
              }
            }
          } catch(e) {}
        };

        terminal.onData((data) => {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'input', data }));
          }
        });

        window.addEventListener('resize', () => {
          setTimeout(() => {
            try {
              fitAddon.fit();
              postResizeIfNeeded();
            } catch(e) {}
          }, 50);
        });

        requestAnimationFrame(() => {
          try {
            fitAddon.fit();
            lastCols = terminal.cols;
            lastRows = terminal.rows;
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'terminalReady',
                data: { cols: terminal.cols, rows: terminal.rows }
              }));
            }
          } catch(e) {
            logToNative('Error sending ready: ' + e.message, 'error');
          }
        });
      } catch (err) {
        logToNative('Init error: ' + err.message, 'error');
      }
    }

    init();
  </script>
</body>
</html>`;
}
