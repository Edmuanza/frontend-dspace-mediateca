import { Injectable } from '@angular/core';
import { Exhibition, PanelTruckScreenplay } from './exhibition.model';

@Injectable({ providedIn: 'root' })
export class ScreenplayService {

  buildScreenplay(exhibition: Exhibition): PanelTruckScreenplay {
    const sources = exhibition.slides.map((s, i) => ({
      id: `slide-${i}`,
      type: 'iiifManifest' as const,
      manifest: s.manifestUrl
    }));

    const scenes = exhibition.slides.map((s, i) => ({
      sceneSource: `slide-${i}`,
      caption: {
        title: s.title || `Paso ${i + 1}`,
        text: s.narrative
      }
    }));

    return {
      metadata: {
        title: exhibition.title,
        subtitle: exhibition.description,
        author: 'Tu Institución'
      },
      sources,
      scenes
    };
  }
}