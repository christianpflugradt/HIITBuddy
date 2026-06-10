export type TimerSnapshot = {
  elapsedSeconds: number;
  totalSeconds: number;
  remainingSeconds: number;
  isComplete: boolean;
};

export type TimerState = {
  startedAt: DOMHighResTimeStamp;
  baseDurationSeconds: number;
  addedSeconds: number;
};

export const createTimerState = ({
  startedAt,
  baseDurationSeconds,
  addedSeconds = 0
}: {
  startedAt: DOMHighResTimeStamp;
  baseDurationSeconds: number;
  addedSeconds?: number;
}): TimerState => {
  if (!Number.isFinite(startedAt)) {
    throw new RangeError("startedAt must be finite.");
  }

  if (!Number.isFinite(baseDurationSeconds) || baseDurationSeconds < 0) {
    throw new RangeError("baseDurationSeconds must be a non-negative number.");
  }

  if (!Number.isFinite(addedSeconds) || addedSeconds < 0) {
    throw new RangeError("addedSeconds must be a non-negative number.");
  }

  return {
    startedAt,
    baseDurationSeconds,
    addedSeconds
  };
};

export const getTimerSnapshot = (timer: TimerState, now: DOMHighResTimeStamp): TimerSnapshot => {
  const elapsedSeconds = Math.max(0, (now - timer.startedAt) / 1000);
  const totalSeconds = timer.baseDurationSeconds + timer.addedSeconds;
  const rawRemaining = Math.max(0, totalSeconds - elapsedSeconds);
  const remainingSeconds = Math.ceil(rawRemaining);

  return {
    elapsedSeconds,
    totalSeconds,
    remainingSeconds,
    isComplete: rawRemaining <= 0
  };
};

export const extendTimer = (timer: TimerState, seconds: number): TimerState => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new RangeError("Extension seconds must be a non-negative number.");
  }

  return {
    ...timer,
    addedSeconds: timer.addedSeconds + seconds
  };
};
