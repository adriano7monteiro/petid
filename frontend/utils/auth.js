import AsyncStorage from '@react-native-async-storage/async-storage';
const TOKEN_KEY = 'petid_token';
export async function saveToken(t){ await AsyncStorage.setItem(TOKEN_KEY, t); }
export async function getToken(){ return AsyncStorage.getItem(TOKEN_KEY); }
export async function clearToken(){ await AsyncStorage.removeItem(TOKEN_KEY); }