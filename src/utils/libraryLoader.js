// utils/libraryLoader.js

export const loadJsPDF = () => {
  return new Promise((resolve, reject) => {
    if (window.jspdf) {
      resolve(window.jspdf);
      return;
    }

    // Verifica se lo script è già stato caricato
    const existingScript = document.querySelector('script[src*="jspdf"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.jspdf));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.async = true;
    
    script.onload = () => {
      if (window.jspdf) {
        resolve(window.jspdf);
      } else {
        reject(new Error('jsPDF failed to load'));
      }
    };
    
    script.onerror = () => reject(new Error('Failed to load jsPDF'));
    
    document.head.appendChild(script);
  });
};

export const loadXLSX = () => {
  return new Promise((resolve, reject) => {
    if (window.XLSX) {
      resolve(window.XLSX);
      return;
    }

    // Verifica se lo script è già stato caricato
    const existingScript = document.querySelector('script[src*="xlsx"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.XLSX));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.async = true;
    
    script.onload = () => {
      if (window.XLSX) {
        resolve(window.XLSX);
      } else {
        reject(new Error('XLSX failed to load'));
      }
    };
    
    script.onerror = () => reject(new Error('Failed to load XLSX'));
    
    document.head.appendChild(script);
  });
};

export const loadLibraries = async () => {
  try {
    const [jsPDF, XLSX] = await Promise.all([
      loadJsPDF(),
      loadXLSX()
    ]);
    
    return { jsPDF, XLSX };
  } catch (error) {
    console.error('Error loading export libraries:', error);
    throw error;
  }
};