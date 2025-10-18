import axios from 'axios';
import { API_URL } from '../config.js';

let ACCESS_TOKEN = null;
export function setAuthToken(token){ ACCESS_TOKEN = token; }

export const api = axios.create({
  baseURL: API_URL,
  headers: {'Content-Type': 'application/json'},
  timeout: 10000 // 10 segundos de timeout
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
  listMine: ()=> api.get('/pets'),
  create: (payload)=> api.post('/pets', payload),
  updateVaccines: (petId, vaccines)=> api.put(`/pets/${petId}/vaccines`, vaccines),
  toggleVaccine: (petId, vaccineId, applied)=> api.patch(`/pets/${petId}/vaccines/${vaccineId}?applied=${applied}`),
};

export const DiaryAPI = {
  addEntry: (payload)=> api.post('/diary', payload),
  getEntries: (petId)=> api.get(`/diary/${petId}`),
};

export const UploadAPI = {
  image: (fileUri)=> {
    const data = new FormData();
    data.append('file', { uri: fileUri, name: 'photo.jpg', type: 'image/jpeg' });
    return api.post('/upload', data, { headers: {'Content-Type': 'multipart/form-data'} });
  }
};

export const AIAPI = {
  diagnose: (healthData)=> api.post('/ai-diagnosis', healthData),
  chat: (chatData)=> api.post('/ai-chat', chatData),
  suggestVaccines: (petData)=> api.post('/suggest-vaccines', petData),
};