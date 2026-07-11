import {API_BASE_URL} from './constants';

export const processVideoUrl = async (url: string) => {
    return fetch(`${API_BASE_URL}/process-url?url=${encodeURIComponent(url)}`, {
        method: 'POST',
       });
};

export const processVideoFile = async (file: File) => {
const formData = new FormData();
formData.append('file', file);

return fetch(`${API_BASE_URL}/upload-video`, {
    method: 'POST',
    body: formData,
});
}