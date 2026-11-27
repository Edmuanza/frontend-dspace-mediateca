import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Item } from '../../core/shared/item.model';
import { BundleDataService } from '../../core/data/bundle-data.service';
import { BitstreamDataService } from '../../core/data/bitstream-data.service';
import { RemoteData } from '../../core/data/remote-data';
import { PaginatedList } from '../../core/data/paginated-list.model';
import { Bitstream } from '../../core/shared/bitstream.model';

@Injectable({
  providedIn: 'root'
})
export class MiradorViewerService {

  showEmbeddedViewer(): boolean {
    return true;
  }

  getImageCount(
    object: Item,
    bitstreamDataService: BitstreamDataService,
    bundleDataService: BundleDataService
  ): Observable<number> {
    // Obtener bitstreams del bundle "ORIGINAL"
    return bitstreamDataService.findAllByItemAndBundleName(object, 'ORIGINAL').pipe(
      // Primero extraemos el payload del RemoteData
      map((bitstreamsRD: RemoteData<PaginatedList<Bitstream>>) => {
        return bitstreamsRD.payload;
      }),
      // Luego accedemos a .page en el PaginatedList
      map((paginatedList: PaginatedList<Bitstream>) => {
        if (paginatedList && paginatedList.page) {
          return paginatedList.page.length;
        }
        return 0;
      })
    );
  }
}