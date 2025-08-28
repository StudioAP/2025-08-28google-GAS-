
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error('Failed to read file as data URL.'));
      }
      // Return only the base64 part of the data URL
      const base64Data = reader.result.split(',')[1];
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
};
