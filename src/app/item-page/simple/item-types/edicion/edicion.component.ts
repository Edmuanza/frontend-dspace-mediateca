import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Item } from '../../../../core/shared/item.model';
import { ViewMode } from '../../../../core/shared/view-mode.model';
import { listableObjectComponent } from '../../../../shared/object-collection/shared/listable-object/listable-object.decorator';
import { DsoEditMenuComponent } from '../../../../shared/dso-page/dso-edit-menu/dso-edit-menu.component';
import { MetadataFieldWrapperComponent } from '../../../../shared/metadata-field-wrapper/metadata-field-wrapper.component';
import { ThemedResultsBackButtonComponent } from '../../../../shared/results-back-button/themed-results-back-button.component';
import { ThemedThumbnailComponent } from '../../../../thumbnail/themed-thumbnail.component';

import { GenericItemPageFieldComponent } from '../../field-components/specific-field/generic/generic-item-page-field.component';
import { ThemedItemPageTitleFieldComponent } from '../../field-components/specific-field/title/themed-item-page-field.component';

import { ItemComponent } from '../shared/item.component';

@listableObjectComponent('Edicion', ViewMode.StandalonePage)
@Component({
  selector: 'ds-edicion',
  templateUrl: './edicion.component.html',
  styleUrls: ['./edicion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    // Angular
    AsyncPipe,
    RouterLink,
    TranslateModule,

    // Componentes de DSpace
    ThemedResultsBackButtonComponent,
    ThemedItemPageTitleFieldComponent,
    DsoEditMenuComponent,
    MetadataFieldWrapperComponent,
    ThemedThumbnailComponent,
    GenericItemPageFieldComponent,
  ],
})
export class EdicionComponent extends ItemComponent {
}
