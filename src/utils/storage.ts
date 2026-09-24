import Storage from "expo-sqlite/kv-store";

export const storage = {
  getItem(key: string): string | null {
    try {
      return Storage.getItemSync(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string) {
    try {
      Storage.setItemSync(key, value);
    } catch (e) {
      console.error(`[storage] failed to set ${key}`, e);
    }
  },
  removeItem(key: string) {
    try {
      Storage.removeItemSync(key);
    } catch (e) {
      console.error(`[storage] failed to remove ${key}`, e);
    }
  },
};
