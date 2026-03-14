import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConnectionConfig } from "@/types";
import {
  CUSTOM_TERM_VALUE,
  DEFAULT_TERM_VALUE,
  isKnownTermValue,
  TERM_DEFAULTS,
} from "@/utils/termDefaults";
import { TerminalSettingsContent } from "@/components/terminal/TerminalSettingsContent";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ConnectionFormProfileProps {
  formData: Partial<ConnectionConfig>;
  onChange: (data: Partial<ConnectionConfig>) => void;
}

export function ConnectionFormProfile({
  formData,
  onChange,
}: ConnectionFormProfileProps) {
  const profile = formData.profile || {};
  const selectedTerm = profile.term || "";
  const selectedTheme =
    typeof profile.terminal_theme === "string" ? profile.terminal_theme : "";
  const [isCustomTerm, setIsCustomTerm] = useState<boolean>(
    selectedTerm !== "" && !isKnownTermValue(selectedTerm),
  );
  const [showThemePicker, setShowThemePicker] = useState(false);

  useEffect(() => {
    if (selectedTerm === "") {
      setIsCustomTerm(false);
      return;
    }
    if (!isKnownTermValue(selectedTerm)) {
      setIsCustomTerm(true);
    }
  }, [selectedTerm]);

  const termSelectValue = isCustomTerm
    ? CUSTOM_TERM_VALUE
    : selectedTerm === ""
      ? DEFAULT_TERM_VALUE
      : selectedTerm;

  if (showThemePicker) {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowThemePicker(false)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to profile
        </button>

        <TerminalSettingsContent
          themeName={selectedTheme}
          onSelectTheme={(name) => {
            onChange({
              ...formData,
              profile: { ...profile, terminal_theme: name },
            });
          }}
          onDone={() => setShowThemePicker(false)}
          showFontButton={false}
          includeGlobalOption
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">Profile</h3>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">TERM</p>
        <Select
          value={termSelectValue}
          onValueChange={(value) => {
            if (value === DEFAULT_TERM_VALUE) {
              setIsCustomTerm(false);
              onChange({
                ...formData,
                profile: { ...profile, term: "" },
              });
              return;
            }

            if (value === CUSTOM_TERM_VALUE) {
              setIsCustomTerm(true);
              onChange({
                ...formData,
                profile: {
                  ...profile,
                  term:
                    selectedTerm && !isKnownTermValue(selectedTerm)
                      ? selectedTerm
                      : "",
                },
              });
              return;
            }

            setIsCustomTerm(false);
            onChange({
              ...formData,
              profile: { ...profile, term: value },
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select TERM value" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={DEFAULT_TERM_VALUE}>Default</SelectItem>
            {TERM_DEFAULTS.map((term) => (
              <SelectItem key={term} value={term}>
                {term}
              </SelectItem>
            ))}
            <SelectItem value={CUSTOM_TERM_VALUE}>Custom value</SelectItem>
          </SelectContent>
        </Select>
        {isCustomTerm && (
          <Input
            value={selectedTerm}
            onChange={(e) =>
              onChange({
                ...formData,
                profile: { ...profile, term: e.target.value },
              })
            }
            placeholder="Enter custom TERM"
          />
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Font size</p>
        <Input
          type="number"
          min={0}
          value={profile.font_size ?? ""}
          onChange={(e) =>
            onChange({
              ...formData,
              profile: {
                ...profile,
                font_size:
                  e.target.value === "" ? undefined : Number(e.target.value),
              },
            })
          }
          placeholder="14"
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Terminal theme</p>
        <button
          type="button"
          onClick={() => setShowThemePicker(true)}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors"
        >
          <span className="text-sm font-medium">
            {selectedTheme.trim() ? selectedTheme : "Use global theme"}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Startup command</p>
        <Textarea
          value={profile.startup_command || ""}
          onChange={(e) =>
            onChange({
              ...formData,
              profile: { ...profile, startup_command: e.target.value },
            })
          }
          rows={4}
          placeholder="source ~/.bashrc"
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          Startup command delay (ms)
        </p>
        <Input
          type="number"
          min={0}
          max={60000}
          value={profile.startup_command_delay_ms ?? ""}
          onChange={(e) =>
            onChange({
              ...formData,
              profile: {
                ...profile,
                startup_command_delay_ms:
                  e.target.value === "" ? undefined : Number(e.target.value),
              },
            })
          }
          placeholder="0"
        />
      </div>
    </div>
  );
}
