import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ds-pdf-viewer-modal',
  templateUrl: './pdf-viewer-modal.component.html',
  styleUrls: ['./pdf-viewer-modal.component.scss']
})
export class PdfViewerModalComponent implements OnInit {
  /**
   * URL del PDF (el bitstream de la edición)
   */
  @Input() pdfUrl: string;

  /**
   * Página inicial del artículo (viene de mop.paginaInicio)
   */
  @Input() startPage: number = 1;

  /**
   * Título del artículo (para mostrarlo en el modal)
   */
  @Input() articleTitle: string = '';

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    // Aseguramos que startPage sea un número válido
    if (!this.startPage || this.startPage < 1) {
      this.startPage = 1;
    }
  }

  /**
   * Cierra el modal
   */
  close(): void {
    this.activeModal.dismiss('close');
  }
}