
import type { ProcessedFilePart } from '../types';

export const fileToGenerativePart = async (file: File): Promise<ProcessedFilePart> => {
  const base64encodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error('Failed to read file as data URL.'));
      }
      const dataUrl = reader.result;
      const base64Data = dataUrl.split(',')[1];
      if (!base64Data) {
        return reject(new Error('Failed to extract base64 data from file.'));
      }
      resolve(base64Data);
    };
    reader.onerror = (error) => {
        reject(error);
    }
    reader.readAsDataURL(file);
  });
  
  return {
    inlineData: {
      mimeType: file.type,
      data: base64encodedData,
    },
  };
};
