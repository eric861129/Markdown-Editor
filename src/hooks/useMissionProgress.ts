import { useEffect, useMemo } from 'react';

import type { Mission } from '@/types/mission';

/** 任務狀態（未解鎖 / 進行中 / 完成） */
export type MissionStatus = 'locked' | 'active' | 'done';

/**
 * 依據當前內容與已完成任務，計算每個任務的狀態。
 * 規則：
 * 1) 前置任務未完成 => locked
 * 2) validator 成功 => done
 * 3) 其餘 => active
 */
export function useMissionProgress(
  missions: Mission[],
  content: string,
  completedMissionIds: string[],
  setCompletedMissionIds: (ids: string[]) => void
) {
  const missionStatuses = useMemo(() => {
    return missions.reduce<Record<string, MissionStatus>>((acc, mission) => {
      const dependencyDone = mission.dependsOn
        ? completedMissionIds.includes(mission.dependsOn)
        : true;

      if (!dependencyDone) {
        acc[mission.id] = 'locked';
        return acc;
      }

      const alreadyDone = completedMissionIds.includes(mission.id);
      const nowDone = mission.validator(content);

      acc[mission.id] = alreadyDone || nowDone ? 'done' : 'active';
      return acc;
    }, {});
  }, [missions, content, completedMissionIds]);

  const nextCompletedMissionIds = useMemo(() => {
    const doneSet = new Set(completedMissionIds);
    for (const mission of missions) {
      if (missionStatuses[mission.id] === 'done') {
        doneSet.add(mission.id);
      }
    }
    return Array.from(doneSet);
  }, [missions, missionStatuses, completedMissionIds]);

  useEffect(() => {
    const isSameLength = nextCompletedMissionIds.length === completedMissionIds.length;
    const isSameIds = nextCompletedMissionIds.every((id) => completedMissionIds.includes(id));

    if (!isSameLength || !isSameIds) {
      setCompletedMissionIds(nextCompletedMissionIds);
    }
  }, [nextCompletedMissionIds, completedMissionIds, setCompletedMissionIds]);

  return missionStatuses;
}
