import { Injectable } from '@angular/core';

/** Extraído del store de donaciones (F9): un signalStore no debería tocar el DOM. */
@Injectable({ providedIn: 'root' })
export class FileDownloadService {
  download(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
