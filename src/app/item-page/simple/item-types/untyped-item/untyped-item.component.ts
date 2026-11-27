import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

import { Item } from '../../../../core/shared/item.model';
import { ViewMode } from '../../../../core/shared/view-mode.model';
import { DsoEditMenuComponent } from '../../../../shared/dso-page/dso-edit-menu/dso-edit-menu.component';
import { MetadataFieldWrapperComponent } from '../../../../shared/metadata-field-wrapper/metadata-field-wrapper.component';
import { listableObjectComponent } from '../../../../shared/object-collection/shared/listable-object/listable-object.decorator';
import { ThemedResultsBackButtonComponent } from '../../../../shared/results-back-button/themed-results-back-button.component';
import { ThemedThumbnailComponent } from '../../../../thumbnail/themed-thumbnail.component';
import { CollectionsComponent } from '../../../field-components/collections/collections.component';
import { ThemedMediaViewerComponent } from '../../../media-viewer/themed-media-viewer.component';
import { ThemedFileSectionComponent } from '../../field-components/file-section/themed-file-section.component';
import { ItemPageAbstractFieldComponent } from '../../field-components/specific-field/abstract/item-page-abstract-field.component';
import { ItemPageDateFieldComponent } from '../../field-components/specific-field/date/item-page-date-field.component';
import { GenericItemPageFieldComponent } from '../../field-components/specific-field/generic/generic-item-page-field.component';
import { GeospatialItemPageFieldComponent } from '../../field-components/specific-field/geospatial/geospatial-item-page-field.component';
import { ThemedItemPageTitleFieldComponent } from '../../field-components/specific-field/title/themed-item-page-field.component';
import { ItemPageUriFieldComponent } from '../../field-components/specific-field/uri/item-page-uri-field.component';
import { ThemedMetadataRepresentationListComponent } from '../../metadata-representation-list/themed-metadata-representation-list.component';
import { RelatedItemsComponent } from '../../related-items/related-items-component';
import { ItemComponent } from '../shared/item.component';

@listableObjectComponent(Item, ViewMode.StandalonePage)
@Component({
  selector: 'ds-untyped-item',
  standalone: true,
  styleUrls: ['./untyped-item.component.scss'],
  templateUrl: './untyped-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    CollectionsComponent,
    DsoEditMenuComponent,
    GenericItemPageFieldComponent,
    GeospatialItemPageFieldComponent,
    ItemPageAbstractFieldComponent,
    ItemPageDateFieldComponent,
    ItemPageUriFieldComponent,
    MetadataFieldWrapperComponent,
    RelatedItemsComponent,
    RouterLink,
    ThemedFileSectionComponent,
    ThemedItemPageTitleFieldComponent,
    ThemedMediaViewerComponent,
    ThemedMetadataRepresentationListComponent,
    ThemedResultsBackButtonComponent,
    ThemedThumbnailComponent,
    TranslateModule,
  ],
})
export class UntypedItemComponent extends ItemComponent {
  iiifEnabled = true;

  private readonly backendUrl = 'http://190.92.127.19:8080';
  private readonly sanitizer = inject(DomSanitizer);
  private readonly http = inject(HttpClient);

  private uvUrlCache$: Observable<SafeResourceUrl | null> | null = null;

  /**
   * Getter que genera la URL segura del UV.
   * - Si el manifiesto tiene canvas (imágenes), usa el manifiesto original.
   * - Si no tiene canvas pero sí PDF, genera un manifiesto IxIF con el PDF.
   *
   * Se usa un getter (no una propiedad de clase) porque `this.object`
   * aún es undefined cuando se construye el componente. El getter se
   * evalúa cuando Angular renderiza el template, con el @Input ya asignado.
   */
  get uvUrlSafe$(): Observable<SafeResourceUrl | null> {
    if (!this.object?.uuid) {
      return of(null);
    }

    if (!this.uvUrlCache$) {
      this.uvUrlCache$ = this.http.get<any>(
        `${this.backendUrl}/server/iiif/${this.object.uuid}/manifest`
      ).pipe(
        map((manifest: any) => {
          const hasCanvases = manifest.sequences?.[0]?.canvases?.length > 0;

          if (hasCanvases) {
            // Ítem con imágenes: usar el manifiesto original
            return this.buildUvUrl(manifest['@id']);
          }

          // Ítem con PDF: generar manifiesto IxIF
          const pdfUrl = manifest.rendering?.['@id'];
          if (!pdfUrl) {
            return null;
          }

          const ixifManifest = this.buildIxifManifest(manifest, pdfUrl);
          const ixifDataUrl =
            `data:application/json;charset=utf-8,` +
            encodeURIComponent(JSON.stringify(ixifManifest));

          return this.buildUvUrl(ixifDataUrl);
        }),
        catchError((err) => {
          console.error('Error cargando manifiesto IIIF:', err);
          return of(null);
        }),
        shareReplay(1)
      );
    }

    return this.uvUrlCache$;
  }

  private buildUvUrl(manifestUrl: string): SafeResourceUrl {
    const uvUrl = `/assets/uv/uv.html#?manifest=${encodeURIComponent(manifestUrl)}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(uvUrl);
  }

  private buildIxifManifest(originalManifest: any, pdfUrl: string): any {
    return {
      '@context': [
        'http://iiif.io/api/presentation/2/context.json',
        'http://wellcomelibrary.org/ld/ixif/0/context.json',
      ],
      '@id': originalManifest['@id'],
      '@type': 'sc:Manifest',
      label: originalManifest.label || 'Documento PDF',
      metadata: originalManifest.metadata || [],
      mediaSequences: [
        {
          '@id': `${originalManifest['@id']}/ixif-sequence`,
          '@type': 'ixif:MediaSequence',
          label: 'PDF',
          elements: [
            {
              '@id': pdfUrl,
              '@type': 'foaf:Document',
              format: 'application/pdf',
              label: 'Documento PDF',
            },
          ],
        },
      ],
      rendering: originalManifest.rendering,
    };
  }
}