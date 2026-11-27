import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { RouteService } from '../../../../core/services/route.service';
import { ViewMode } from '../../../../core/shared/view-mode.model';
import { listableObjectComponent } from '../../../../shared/object-collection/shared/listable-object/listable-object.decorator';
import { GenericItemPageFieldComponent } from '../../../../item-page/simple/field-components/specific-field/generic/generic-item-page-field.component';
import { ThemedItemPageTitleFieldComponent } from '../../../../item-page/simple/field-components/specific-field/title/themed-item-page-field.component';
import { ItemComponent } from '../../../../item-page/simple/item-types/shared/item.component';
import { DsoEditMenuComponent } from '../../../../shared/dso-page/dso-edit-menu/dso-edit-menu.component';
import { MetadataFieldWrapperComponent } from '../../../../shared/metadata-field-wrapper/metadata-field-wrapper.component';
import { ThemedResultsBackButtonComponent } from '../../../../shared/results-back-button/themed-results-back-button.component';
import { ThemedThumbnailComponent } from '../../../../thumbnail/themed-thumbnail.component';
// Importa el componente de ítems relacionados
import { RelatedItemsComponent } from '../../../../item-page/simple/related-items/related-items-component';

@listableObjectComponent('Profesional', ViewMode.StandalonePage)
@Component({
  selector: 'ds-profesional',
  templateUrl: './profesional.component.html',
  styleUrls: [],
  standalone: true,
  imports: [
    ThemedResultsBackButtonComponent,
    ThemedItemPageTitleFieldComponent,
    DsoEditMenuComponent,
    MetadataFieldWrapperComponent,
    ThemedThumbnailComponent,
    GenericItemPageFieldComponent,
    RouterLink,
    AsyncPipe,
    TranslateModule,
    RelatedItemsComponent, // ← Añadido
  ],
})
export class ProfesionalComponent extends ItemComponent implements OnInit {

  constructor(
    protected routeService: RouteService,
    protected router: Router
  ) {
    super(routeService, router);
  }

  ngOnInit(): void {
    // Sin lógica adicional
  }
}