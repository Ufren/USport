import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "./constants";

export async function setStorage(key: string, value: any): Promise<void> {
  const stringValue = typeof value === "string" ? value : JSON.stringify(value);
  await AsyncStorage.setItem(key, stringValue);
}

export async function getStorage<T = any>(key: string): Promise<T | null> {
  const value = await AsyncStorage.getItem(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return value as unknown as T;
  }
}

export async function removeStorage(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export async function clearStorage(): Promise<void> {
  await AsyncStorage.clear();
}

export async function getToken(): Promise<string | null> {
  return getStorage<string>(STORAGE_KEYS.TOKEN);
}

export async function setToken(token: string): Promise<void> {
  await setStorage(STORAGE_KEYS.TOKEN, token);
}

export async function removeToken(): Promise<void> {
  await removeStorage(STORAGE_KEYS.TOKEN);
}
