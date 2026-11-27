import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { RouteService } from '../../../../core/services/route.service';
import { ViewMode } from '../../../../core/shared/view-mode.model';
import { listableObjectComponent } from '../../../../shared/object-collection/shared/listable-object/listable-object.decorator';

import { GenericItemPageFieldComponent } from '../../../../item-page/simple/field-components/specific-field/generic/generic-item-page-field.component';
import { ThemedItemPageTitleFieldComponent } from '../../../../item-page/simple/field-components/specific-field/title/themed-item-page-field.component';
import { ItemPageDateFieldComponent } from '../../../../item-page/simple/field-components/specific-field/date/item-page-date-field.component';
import { ItemPageUriFieldComponent } from '../../../../item-page/simple/field-components/specific-field/uri/item-page-uri-field.component';

import { ItemComponent } from '../../../../item-page/simple/item-types/shared/item.component';
import { DsoEditMenuComponent } from '../../../../shared/dso-page/dso-edit-menu/dso-edit-menu.component';
import { MetadataFieldWrapperComponent } from '../../../../shared/metadata-field-wrapper/metadata-field-wrapper.component';
import { ThemedResultsBackButtonComponent } from '../../../../shared/results-back-button/themed-results-back-button.component';
import { ThemedThumbnailComponent } from '../../../../thumbnail/themed-thumbnail.component';

import { ThemedFileSectionComponent } from '../../../../item-page/simple/field-components/file-section/themed-file-section.component';
import { ThemedMediaViewerComponent } from '../../../../item-page/media-viewer/themed-media-viewer.component';
import { MiradorViewerComponent } from '../../../../item-page/mirador-viewer/mirador-viewer.component';

// ✅ RUTA CORREGIDA
import { CollectionsComponent } from '../../../../item-page/field-components/collections/collections.component';
// ✅ RUTA CORREGIDA (no existe ThemedRelatedItemsComponent)
import { RelatedItemsComponent } from '../../../../item-page/simple/related-items/related-items-component';

@listableObjectComponent('OrganizacionControlada', ViewMode.StandalonePage)
@Component({
  selector: 'ds-organizacion',
  templateUrl: './organizacion.component.html',
  styleUrls: [],
  standalone: true,
  imports: [
    AsyncPipe,
    RouterLink,
    TranslateModule,
    ThemedResultsBackButtonComponent,
    ThemedItemPageTitleFieldComponent,
    DsoEditMenuComponent,
    MetadataFieldWrapperComponent,
    ThemedThumbnailComponent,
    GenericItemPageFieldComponent,
    ItemPageDateFieldComponent,
    ItemPageUriFieldComponent,
    ThemedFileSectionComponent,
    ThemedMediaViewerComponent,
    MiradorViewerComponent,
    CollectionsComponent,
    RelatedItemsComponent,
  ],
})
export class OrganizacionComponent extends ItemComponent implements OnInit {

  constructor(
    protected routeService: RouteService,
    protected router: Router
  ) {
    super(routeService, router);
  }

  ngOnInit(): void {
    // Lógica específica si es necesaria
  }
}