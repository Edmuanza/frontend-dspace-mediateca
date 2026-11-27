export interface Slide {
  uuid: string;
  order: number;
  narrative: string;
  manifestUrl: string;
  title: string;
}

export interface Exhibition {
  uuid: string;
  title: string;
  description: string;
  coverManifest: string;
  slides: Slide[];
}

export interface PanelTruckScreenplay {
  metadata: { title: string; subtitle?: string; author?: string };
  sources: Array<{ id: string; type: 'iiifManifest'; manifest: string }>;
  scenes: Array<{ sceneSource: string; caption: { title: string; text: string } }>;
}