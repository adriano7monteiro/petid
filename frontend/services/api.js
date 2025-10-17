import axios from 'axios';
import Constants from 'expo-constants';

let ACCESS_TOKEN = null;
export function setAuthToken(token){ ACCESS_TOKEN = token; }

// Get API URL from environment or use default
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://bc739a2b-2d9f-4ed8-9396-e19b2f4d3508.preview.emergentagent.com';

export const api = axios.create({
  baseURL: API_URL,
  headers: {'Content-Type': 'application/json'}
});

api.interceptors.request.use((config)=>{
  if (ACCESS_TOKEN) config.headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
  return config;
});

export const AuthAPI = {
  register: (email, password)=> api.post('/auth/register', { email, password }),
  login: (email, password)=> {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    return api.post('/auth/login', form, { headers: {'Content-Type': 'application/x-www-form-urlencoded'} });
  }
};

export const PetsAPI = {
  listMine: ()=> api.get('/api/pets'),
  create: (payload)=> api.post('/api/pets', payload),
};

export const DiaryAPI = {
  addEntry: (payload)=> api.post('/api/diary', payload),
  getEntries: (petId)=> api.get(`/api/diary/${petId}`),
};

export const UploadAPI = {
  image: (fileUri)=> {
    const data = new FormData();
    data.append('file', { uri: fileUri, name: 'photo.jpg', type: 'image/jpeg' });
    return api.post('/api/upload', data, { headers: {'Content-Type': 'multipart/form-data'} });
  }
};