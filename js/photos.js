// Fortschrittsfotos: liegen nur auf dem Gerät (IndexedDB), nie im Netz
const DB = 'agon-fotos';
const STORE = 'photos';

function open() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: 'id' });
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
function tx(mode, fn) {
  return open().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const res = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(res && 'result' in res ? res.result : undefined);
    t.onerror = () => reject(t.error);
  }));
}

export const POSES = [['front', 'Vorne'], ['side', 'Seite'], ['back', 'Hinten']];

export async function listPhotos() {
  try { return (await tx('readonly', s => s.getAll())) || []; } catch { return []; }
}
export function putPhoto(p) { return tx('readwrite', s => s.put(p)); }
export function deletePhoto(id) { return tx('readwrite', s => s.delete(id)); }

// Bild verkleinern (lange Seite max. 1280 px) und als JPEG speichern
export async function shrink(file, max = 1280) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Bild nicht lesbar'));
      i.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * scale);
    c.height = Math.round(img.naturalHeight * scale);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return await new Promise(resolve => c.toBlob(resolve, 'image/jpeg', 0.82));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(blob);
  });
}
export async function dataUrlToBlob(u) {
  const r = await fetch(u);
  return r.blob();
}
