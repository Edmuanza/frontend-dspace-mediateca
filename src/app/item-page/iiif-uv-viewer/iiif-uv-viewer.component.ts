import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Item } from '../../core/shared/item.model';

declare const UV: any;

@Component({
  selector: 'ds-iiif-uv-viewer',
  templateUrl: './iiif-uv-viewer.component.html',
  styleUrls: ['./iiif-uv-viewer.component.scss'],
})
export class IiifUvViewerComponent implements AfterViewInit, OnDestroy {
  @Input() item: Item;
  @ViewChild('uvContainer', { static: false }) uvContainer: ElementRef;

  private uvInstance: any;
  uvLoading = true;
  uvError = false;

  private readonly backendUrl = 'http://190.92.127.19:8080';

  ngAfterViewInit(): void {
    if (!this.isIiifEnabled) {
      this.uvLoading = false;
      return;
    }
    this.loadUvScript()
      .then(() => this.initViewer())
      .catch((err) => {
        console.error('Error cargando UV:', err);
        this.uvError = true;
        this.uvLoading = false;
      });
  }

  get isIiifEnabled(): boolean {
    return this.item?.firstMetadataValue('dspace.iiif.enabled') === 'true';
  }

  private loadUvScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof UV !== 'undefined') {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = '/assets/uv/umd/uv.js';
      script.onload = () => resolve();
      script.onerror = (e) => reject(e);
      document.body.appendChild(script);
    });
  }

  private initViewer(): void {
    if (!this.item?.uuid || !this.uvContainer) {
      this.uvError = true;
      this.uvLoading = false;
      return;
    }

    const manifestUrl = `${this.backendUrl}/server/iiif/${this.item.uuid}/manifest`;

    try {
      this.uvInstance = UV.init(this.uvContainer.nativeElement, {
        manifestUri: manifestUrl,
        embedded: true,
      });

      this.uvInstance.on('created', () => {
        this.uvLoading = false;
        this.uvInstance.resize();
      });

      this.uvInstance.on('error', (e: any) => {
        console.error('UV error:', e);
        this.uvError = true;
        this.uvLoading = false;
      });
    } catch (e) {
      console.error('Error inicializando UV:', e);
      this.uvError = true;
      this.uvLoading = false;
    }
  }

  ngOnDestroy(): void {
    if (this.uvInstance?.destroy) {
      this.uvInstance.destroy();
    }
  }
}