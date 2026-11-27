import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { PdfViewerModalComponent } from './pdf-viewer-modal.component';

@NgModule({
  declarations: [PdfViewerModalComponent],
  imports: [
    CommonModule,
    NgbModule,
    NgxExtendedPdfViewerModule
  ],
  exports: [PdfViewerModalComponent]
})
export class PdfViewerModalModule { }