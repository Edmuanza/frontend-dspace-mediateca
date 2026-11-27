import {
  Component, OnInit, OnDestroy, Input,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Item } from '../../../../core/shared/item.model';
import { DspaceExhibitionService } from './dspace-exhibition.service';
import { ScreenplayService } from './screenplay.service';

@Component({
  selector: 'ds-exhibition',
  templateUrl: './exhibition.component.html',
  styleUrls: ['./exhibition.component.scss'],
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ExhibitionComponent implements OnInit, OnDestroy {

  @Input() item: Item;

  loading = true;
  error = '';
  screenplayUrl: SafeUrl = '';
  private objectUrl = '';

  constructor(
    private dspace: DspaceExhibitionService,
    private screenplay: ScreenplayService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    if (!this.item?.uuid) {
      this.error = 'No se especificó un ítem.';
      this.loading = false;
      return;
    }
    this.loadExhibition(this.item.uuid);
  }

  ngOnDestroy(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }
  }

  private loadExhibition(uuid: string): void {
    this.dspace.getExhibition(uuid).subscribe({
      next: (exhibition) => {
        if (!exhibition.slides?.length) {
          this.error = 'Esta exposición no tiene diapositivas.';
          this.loading = false;
          return;
        }
        const json = JSON.stringify(this.screenplay.buildScreenplay(exhibition));
        const blob = new Blob([json], { type: 'application/json' });
        this.objectUrl = URL.createObjectURL(blob);
        this.screenplayUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar exposición:', err);
        this.error = 'Error al cargar la exposición.';
        this.loading = false;
      }
    });
  }
}