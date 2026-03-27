import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'md-mermaid-editor:v1';

interface PersistedState {
  content: string;
  completedMissionIds: string[];
}

/**
 * 管理草稿與任務進度的 LocalStorage。
 * - 首次會讀取已儲存資料
 * - 後續內容/進度變化會自動同步
 */
export function useLocalStorageDraft(defaultContent: string) {
  const initialValue = useMemo<PersistedState>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { content: defaultContent, completedMissionIds: [] };
      }
      const parsed = JSON.parse(raw) as PersistedState;
      return {
        content: parsed.content || defaultContent,
        completedMissionIds: parsed.completedMissionIds || []
      };
    } catch {
      return { content: defaultContent, completedMissionIds: [] };
    }
  }, [defaultContent]);

  const [content, setContent] = useState<string>(initialValue.content);
  const [completedMissionIds, setCompletedMissionIds] = useState<string[]>(
    initialValue.completedMissionIds
  );

  useEffect(() => {
    const payload: PersistedState = { content, completedMissionIds };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [content, completedMissionIds]);

  return { content, setContent, completedMissionIds, setCompletedMissionIds };
}
