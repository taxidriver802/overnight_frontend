import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Elevation, Radii, Spacing } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { ModalCard } from "@/components/ui/modal-card";
import { TextField } from "@/components/ui/text-field";
import { useTheme } from "@/hooks/use-theme";

type ShiftData = {
  startTime: string;
  endTime: string;
  roundTimes: string[];
  roundsCompleted: number;
  totalRounds: number;
  checklistProgress: number;
  checklistTotal: number;
  pendingTasks: number;
};

type TabRoute = "rounds" | "tasks" | "incidents" | "passon";
type ShiftPreset = "8to4" | "9to5" | "custom";
type RoundTimes = string[];
type ShiftWindow = {
  startTime: string;
  endTime: string;
};

type StatusCardProps = {
  icon: React.ReactNode;
  value: string;
  label: string;
};


type ActionTileProps = {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onPress: () => void;
};

const TWO_HOURS_IN_MINUTES = 120;
const MINUTES_IN_DAY = 24 * 60;
const SHIFT_WINDOW_STORAGE_KEY = "@overnight/shift-window";
const CHECKLIST_TEMPLATE_TOTAL = 22;
const REPEATING_CHECKLIST_TEMPLATE_COUNT = 4;
const DEFAULT_SHIFT_WINDOW: ShiftWindow = { startTime: "8:00PM", endTime: "4:00AM" };

function parseTimeToMinutes(value: string): number | null {
  const normalized = value.trim().toUpperCase().replace(/\s+/g, "");
  const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?(AM|PM)$/);
  if (!match) return null;
  const rawHour = Number(match[1]);
  const minute = Number(match[2] ?? "0");
  const meridiem = match[3];
  if (rawHour < 1 || rawHour > 12 || minute < 0 || minute > 59) return null;

  let hour24 = rawHour % 12;
  if (meridiem === "PM") hour24 += 12;
  return hour24 * 60 + minute;
}

function minutesToLabel(totalMinutes: number): string {
  const minutes = ((totalMinutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
  const hour24 = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const meridiem = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minute.toString().padStart(2, "0")}${meridiem}`;
}

function getRoundTimes(startTime: string, endTime: string): RoundTimes {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (start === null || end === null) return [];

  const normalizedEnd = end >= start ? end : end + MINUTES_IN_DAY;
  const times: RoundTimes = [];

  // Round starts happen every 2 hours and should never be after clock-out.
  for (let minute = start; minute < normalizedEnd; minute += TWO_HOURS_IN_MINUTES) {
    times.push(minutesToLabel(minute));
  }

  return times;
}

function getChecklistTotal(roundCount: number): number {
  const nonRepeating = CHECKLIST_TEMPLATE_TOTAL - REPEATING_CHECKLIST_TEMPLATE_COUNT;
  return nonRepeating + REPEATING_CHECKLIST_TEMPLATE_COUNT * roundCount;
}

function buildShiftData(window: ShiftWindow, previous?: Partial<ShiftData>): ShiftData {
  const roundTimes = getRoundTimes(window.startTime, window.endTime);
  const totalRounds = roundTimes.length;
  const checklistTotal = getChecklistTotal(totalRounds);
  const checklistProgress = previous?.checklistProgress ?? 0;
  return {
    startTime: window.startTime,
    endTime: window.endTime,
    roundTimes,
    roundsCompleted: previous?.roundsCompleted ?? 0,
    totalRounds,
    checklistProgress,
    checklistTotal,
    pendingTasks: Math.max(checklistTotal - checklistProgress, 0),
  };
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function getShiftBounds(startTime: string, endTime: string, now: Date): { start: Date; end: Date } | null {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);
  if (startMinutes === null || endMinutes === null) return null;

  const start = new Date(now);
  start.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const overnight = endMinutes <= startMinutes;
  if (overnight) {
    // For overnight windows, any time before the configured start belongs to
    // the shift that started yesterday (active or already ended).
    if (nowMinutes < startMinutes) {
      start.setDate(start.getDate() - 1);
    }
  }

  const durationMinutes =
    endMinutes > startMinutes
      ? endMinutes - startMinutes
      : endMinutes + MINUTES_IN_DAY - startMinutes;
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  if (!overnight && now > end) {
    start.setDate(start.getDate() + 1);
    return {
      start,
      end: new Date(start.getTime() + durationMinutes * 60 * 1000),
    };
  }

  return { start, end };
}

function getShiftStatus(
  startTime: string,
  endTime: string,
  roundTimes: RoundTimes,
  now: Date
): {
  mode: "round" | "clockout" | "ended";
  primaryText: string;
  hintText: string;
  roundsCompleted: number;
} {
  const bounds = getShiftBounds(startTime, endTime, now);
  const startMinutes = parseTimeToMinutes(startTime);
  if (!bounds || startMinutes === null) {
    return {
      mode: "ended",
      primaryText: "--:--",
      hintText: "Set shift window to generate rounds",
      roundsCompleted: 0,
    };
  }

  const roundDateEntries = roundTimes
    .map((label) => {
      const minutes = parseTimeToMinutes(label);
      if (minutes === null) return null;
      const offset = minutes >= startMinutes ? minutes - startMinutes : minutes + MINUTES_IN_DAY - startMinutes;
      return { label, date: new Date(bounds.start.getTime() + offset * 60 * 1000) };
    })
    .filter((entry): entry is { label: string; date: Date } => entry !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const roundsCompleted =
    now < bounds.start
      ? 0
      : roundDateEntries.filter((entry) => entry.date <= now).length;

  const nextRound = roundDateEntries.find((entry) => entry.date > now);
  if (nextRound) {
    return {
      mode: "round",
      primaryText: formatDuration(nextRound.date.getTime() - now.getTime()),
      hintText: `Next round at ${nextRound.label}`,
      roundsCompleted,
    };
  }

  if (now < bounds.end) {
    return {
      mode: "clockout",
      primaryText: formatDuration(bounds.end.getTime() - now.getTime()),
      hintText: `Clock out at ${endTime}`,
      roundsCompleted,
    };
  }

  return {
    mode: "ended",
    primaryText: "End of Shift",
    hintText: `Shift ended at ${endTime}`,
    roundsCompleted: roundDateEntries.length,
  };
}

export default function DashboardScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [openDataModel, setOpenDataModel] = useState(false);
  const [curShiftData, setCurShiftData] = useState<ShiftData | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<ShiftPreset>("8to4");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [shiftError, setShiftError] = useState<string | undefined>();
  const [now, setNow] = useState(() => new Date());
  const [shiftHydrated, setShiftHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SHIFT_WINDOW_STORAGE_KEY);
        if (!raw || cancelled) return;

        const parsed: unknown = JSON.parse(raw);
        if (
          !parsed ||
          typeof parsed !== "object" ||
          !("startTime" in parsed) ||
          !("endTime" in parsed)
        ) {
          return;
        }

        const { startTime, endTime } = parsed as { startTime?: unknown; endTime?: unknown };
        if (typeof startTime !== "string" || typeof endTime !== "string") return;

        const hydrated = buildShiftData({ startTime, endTime });
        if (hydrated.roundTimes.length < 1) return;

        setCurShiftData(hydrated);

        // Optional: keep the picker roughly in sync.
        if (startTime === "8:00PM" && endTime === "4:00AM") {
          setSelectedPreset("8to4");
        } else if (startTime === "9:00PM" && endTime === "5:00AM") {
          setSelectedPreset("9to5");
        } else {
          setSelectedPreset("custom");
          setCustomStart(startTime);
          setCustomEnd(endTime);
        }
      } catch {
        // If storage is missing or malformed, we’ll force selection via the modal.
      } finally {
        if (!cancelled) setShiftHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!shiftHydrated) return;
    if (!curShiftData) setOpenDataModel(true);
  }, [shiftHydrated, curShiftData]);

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const navigateToTab = (screen: TabRoute) => {
    router.push(`/(tabs)/${screen}` as const);
  };

  const shiftData: ShiftData = curShiftData ?? buildShiftData(DEFAULT_SHIFT_WINDOW);

  const savePresetShift = (preset: Exclude<ShiftPreset, "custom">) => {
    const nextWindow =
      preset === "8to4"
        ? { startTime: "8:00PM", endTime: "4:00AM" }
        : { startTime: "9:00PM", endTime: "5:00AM" };
    setCurShiftData((prev) => buildShiftData(nextWindow, prev ?? shiftData));
    void AsyncStorage.setItem(
      SHIFT_WINDOW_STORAGE_KEY,
      JSON.stringify(nextWindow)
    );
    setShiftError(undefined);
    setOpenDataModel(false);
  };

  const saveCustomShift = () => {
    if (!customStart.trim() || !customEnd.trim()) {
      setShiftError("Enter both start and end times.");
      return;
    }
    const customWindow = { startTime: customStart.trim(), endTime: customEnd.trim() };
    const generatedRoundTimes = getRoundTimes(customWindow.startTime, customWindow.endTime);
    if (generatedRoundTimes.length < 1) {
      setShiftError("Use valid times like 8:00PM and 4:00AM.");
      return;
    }
    setCurShiftData((prev) => buildShiftData(customWindow, prev ?? shiftData));
    void AsyncStorage.setItem(
      SHIFT_WINDOW_STORAGE_KEY,
      JSON.stringify(customWindow)
    );
    setShiftError(undefined);
    setOpenDataModel(false);
  };

  const roundTimes = useMemo(
    () =>
      shiftData.roundTimes.length > 0
        ? shiftData.roundTimes
        : getRoundTimes(shiftData.startTime, shiftData.endTime),
    [shiftData.roundTimes, shiftData.startTime, shiftData.endTime]
  );
  const shiftStatus = useMemo(
    () => getShiftStatus(shiftData.startTime, shiftData.endTime, roundTimes, now),
    [shiftData.startTime, shiftData.endTime, roundTimes, now]
  );
  const roundsCompleted = Math.min(shiftStatus.roundsCompleted, shiftData.totalRounds);
  const pendingTasks = Math.max(shiftData.checklistTotal - shiftData.checklistProgress, 0);

  const checklistPercent = Math.round(
    (shiftData.checklistProgress / shiftData.checklistTotal) * 100
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: Spacing.lg,
      gap: Spacing.lg,
    },

    shiftBar: {
      flexDirection: "row",
      justifyContent: "space-between",
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.xs,
    },

    subText: {
      fontSize: 12,
      color: colors.textMuted,
    },

    card: {
      backgroundColor: colors.surface,
      padding: Spacing.lg,
      borderRadius: Radii.md,
      gap: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },

    label: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textMuted,
    },

    timer: {
      fontSize: 28,
      fontWeight: "700",
      textAlign: "center",
      color: colors.text,
    },
    timerHint: {
      textAlign: "center",
      color: colors.textMuted,
      fontSize: 12,
    },

    cardButton: {
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
      alignItems: "center",
    },

    cardButtonText: {
      color: colors.tint,
      fontWeight: "600",
    },

    grid: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: Spacing.sm,
    },

    statusCard: {
      flex: 1,
      marginHorizontal: 0,
      backgroundColor: colors.surface,
      borderRadius: Radii.sm,
      padding: Spacing.md,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      ...Elevation.sm,
    },

    iconWrap: {
      marginBottom: Spacing.xs,
    },

    value: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },

    smallLabel: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: Spacing.xxs,
      textAlign: "center",
    },

    section: {
      gap: Spacing.sm,
    },

    sectionLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.textMuted,
      textTransform: "uppercase",
    },

    actionGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.sm,
    },

    actionTile: {
      flex: 1,
      minWidth: "45%",
      padding: Spacing.lg,
      borderRadius: Radii.md,
      backgroundColor: colors.tint,
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.xs,
      ...Elevation.sm,
    },

    dangerTile: {
      backgroundColor: colors.error,
    },

    actionText: {
      color: colors.onPrimary,
      fontSize: 12,
      fontWeight: "600",
      textAlign: "center",
    },

    progressCard: {
      backgroundColor: colors.surface,
      padding: Spacing.md,
      borderRadius: Radii.md,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      ...Elevation.sm,
    },

    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: Spacing.sm,
    },

    progressTitle: {
      fontWeight: "600",
      color: colors.text,
    },

    progressBg: {
      height: 6,
      backgroundColor: colors.controlMuted,
      borderRadius: 999,
      overflow: "hidden",
    },

    progressFill: {
      height: "100%",
      backgroundColor: colors.tint,
    },
    modalTitle: {
      fontSize: 20,
      marginBottom: Spacing.xs,
    },
    modalSubText: {
      color: colors.textMuted,
      marginBottom: Spacing.lg,
    },
    presetList: {
      gap: Spacing.sm,
      marginBottom: Spacing.md,
    },
    presetOption: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radii.md,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      backgroundColor: colors.surface,
    },
    presetOptionActive: {
      borderColor: colors.tint,
      backgroundColor: colors.controlMuted,
    },
    presetOptionTitle: {
      fontWeight: "600",
      color: colors.text,
    },
    presetOptionSub: {
      marginTop: Spacing.xxs,
      color: colors.textMuted,
      fontSize: 12,
    },
    customWrap: {
      marginTop: Spacing.xs,
    },
    modalActions: {
      flexDirection: "row",
      gap: Spacing.sm,
      marginTop: Spacing.sm,
    },
    actionHalf: {
      flex: 1,
    },
  });

  function StatusCard({ icon, value, label }: StatusCardProps) {
    return (
      <View style={styles.statusCard}>
        <View style={styles.iconWrap}>{icon}</View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.smallLabel}>{label}</Text>
      </View>
    );
  }

  function ActionTile({ icon, label, onPress, danger }: ActionTileProps) {
    return (
      <Pressable
        onPress={onPress}
        style={[styles.actionTile, danger && styles.dangerTile]}
      >
        {icon}
        <Text style={styles.actionText}>{label}</Text>
      </Pressable>
    );
  }



  return (
    <ThemedView style={styles.container} backgroundRole="backgroundSecondary">
      {/* Shift Info */}
      <View style={styles.shiftBar}>
        <View style={styles.row}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <Text style={styles.subText}>
            {shiftData.startTime} - {shiftData.endTime}
          </Text>
        </View>

        <Text style={styles.subText}>Night Shift</Text>
      </View>

      {/* Next Round Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Next Patrol Round</Text>

        <Text style={styles.timer}>
          {shiftStatus.primaryText}
        </Text>
        <Text style={styles.timerHint}>
          {shiftStatus.hintText}
        </Text>



        <Pressable
          onPress={() => navigateToTab("rounds")}
          style={styles.cardButton}
        >
          <Text style={styles.cardButtonText}>View Schedule</Text>
        </Pressable>
      </View>

      {/* Status Grid */}
      <View style={styles.grid}>
        <StatusCard
          icon={
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color={colors.success}
            />
          }
          value={`${roundsCompleted}/${shiftData.totalRounds}`}
          label="Rounds"
        />

        <StatusCard
          icon={<Ionicons name="list-outline" size={18} color={colors.info} />}
          value={`${checklistPercent}%`}
          label="Tasks"
        />

        <StatusCard
          icon={<Ionicons name="alert-circle-outline" size={18} color={colors.warning} />}
          value={pendingTasks.toString()}
          label="Pending"
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Quick Actions</Text>

        <View style={styles.actionGrid}>
          <ActionTile
            icon={<Ionicons name="map-outline" size={20} color={colors.onPrimary} />}
            label="Start Round"
            danger={false}
            onPress={() => navigateToTab("rounds")}
          />

          <ActionTile
            icon={<Ionicons name="clipboard-outline" size={20} color={colors.onPrimary} />}
            label="Checklist"
            danger={false}
            onPress={() => navigateToTab("tasks")}
          />

          <ActionTile
            icon={<Ionicons name="warning-outline" size={20} color={colors.onPrimary} />}
            label="Incident"
            danger
            onPress={() => navigateToTab("incidents")}
          />

          <ActionTile
            icon={<Ionicons name="mail-outline" size={20} color={colors.onPrimary} />}
            label="Pass-On"
            danger={false}
            onPress={() => navigateToTab("passon")}
          />
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressCard, { position: "absolute", bottom: 30, left: 20, right: 20 }]}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Shift Progress</Text>
          <Text style={styles.subText}>
            {shiftData.checklistProgress}/{shiftData.checklistTotal} tasks
          </Text>
        </View>

        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              { width: `${checklistPercent}%` },
            ]}
          />
        </View>
      </View>

      <ModalCard
        visible={openDataModel}
        onClose={() => {
          if (curShiftData) {
            setOpenDataModel(false);
          }
        }}
      >
        <ThemedText type="title" style={styles.modalTitle}>
          Select shift window
        </ThemedText>
        <ThemedText style={styles.modalSubText}>
          Choose a default schedule or enter custom start/end times.
        </ThemedText>

        <View style={styles.presetList}>
          <Pressable
            style={[
              styles.presetOption,
              selectedPreset === "8to4" && styles.presetOptionActive,
            ]}
            onPress={() => setSelectedPreset("8to4")}
          >
            <ThemedText style={styles.presetOptionTitle}>8:00PM - 4:00AM</ThemedText>
            <ThemedText style={styles.presetOptionSub}>Most common overnight block</ThemedText>
          </Pressable>

          <Pressable
            style={[
              styles.presetOption,
              selectedPreset === "9to5" && styles.presetOptionActive,
            ]}
            onPress={() => setSelectedPreset("9to5")}
          >
            <ThemedText style={styles.presetOptionTitle}>9:00PM - 5:00AM</ThemedText>
            <ThemedText style={styles.presetOptionSub}>Later start with same 8-hour length</ThemedText>
          </Pressable>

          <Pressable
            style={[
              styles.presetOption,
              selectedPreset === "custom" && styles.presetOptionActive,
            ]}
            onPress={() => setSelectedPreset("custom")}
          >
            <ThemedText style={styles.presetOptionTitle}>Custom</ThemedText>
            <ThemedText style={styles.presetOptionSub}>Use your own start and end times</ThemedText>
          </Pressable>
        </View>

        {selectedPreset === "custom" ? (
          <View style={styles.customWrap}>
            <TextField
              label="Start time"
              placeholder="e.g. 8:30PM"
              value={customStart}
              onChangeText={setCustomStart}
              autoCapitalize="characters"
            />
            <TextField
              label="End time"
              placeholder="e.g. 4:30AM"
              value={customEnd}
              onChangeText={setCustomEnd}
              autoCapitalize="characters"
              error={shiftError}
            />
          </View>
        ) : null}

        <View style={styles.modalActions}>
          {curShiftData ? (
            <Button
              variant="secondary"
              style={styles.actionHalf}
              onPress={() => setOpenDataModel(false)}
            >
              Cancel
            </Button>
          ) : null}
          <Button
            variant="primary"
            style={styles.actionHalf}
            onPress={() =>
              selectedPreset === "custom"
                ? saveCustomShift()
                : savePresetShift(selectedPreset)
            }
          >
            Save Shift
          </Button>
        </View>
      </ModalCard>
    </ThemedView>
  );
}
