import {
  AsyncPipe,
  isPlatformBrowser,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import {
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import {
  Observable,
  of,
} from 'rxjs';
import {
  map,
  take,
} from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { BitstreamDataService } from '../../core/data/bitstream-data.service';
import { BundleDataService } from '../../core/data/bundle-data.service';
import { Item } from '../../core/shared/item.model';
import {
  HostWindowService,
  WidthCategory,
} from '../../shared/host-window.service';
import { MiradorViewerService } from './mirador-viewer.service';

@Component({
  selector: 'ds-mirador-viewer',
  standalone: true, // ✅ Importante
  styleUrls: ['./mirador-viewer.component.scss'],
  templateUrl: './mirador-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    TranslateModule,
  ],
})
export class MiradorViewerComponent implements OnInit {

  @Input() object: Item;
  @Input() query: string;
  @Input() searchable: boolean;

  isViewerAvailable = true;
  iframeViewerUrl: Observable<SafeResourceUrl>;
  multi = false;
  notMobile = false;
  viewerMessage = 'Sorry, the Mirador viewer is not currently available in development mode.';

  constructor(private sanitizer: DomSanitizer,
              private viewerService: MiradorViewerService,
              private bitstreamDataService: BitstreamDataService,
              private bundleDataService: BundleDataService,
              private hostWindowService: HostWindowService,
              @Inject(PLATFORM_ID) private platformId: any) {
  }

  setURL() {
    const manifestApiEndpoint = encodeURIComponent(environment.rest.baseUrl + '/iiif/'
      + this.object.id + '/manifest');
    let viewerPath = `/assets/mirador/index.html?manifest=${manifestApiEndpoint}`;
    if (this.searchable) {
      viewerPath += '&searchable=' + this.searchable;
    }
    if (this.query) {
      viewerPath += '&query=' + this.query;
    }
    if (this.multi) {
      viewerPath += '&multi=' + this.multi;
    }
    if (this.notMobile) {
      viewerPath += '&notMobile=true';
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(viewerPath);
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isViewerAvailable = this.viewerService.showEmbeddedViewer();

      this.hostWindowService.widthCategory
        .pipe(take(1))
        .subscribe((category: WidthCategory) => {
          this.notMobile = !(category === WidthCategory.XS || category === WidthCategory.SM);
        });

      if (this.searchable) {
        this.multi = true;
        const observable = of('');
        this.iframeViewerUrl = observable.pipe(
          map((val) => {
            return this.setURL();
          }),
        );
      } else {
        this.iframeViewerUrl = this.viewerService.getImageCount(
          this.object,
          this.bitstreamDataService,
          this.bundleDataService).pipe(
          map(c => {
            if (c > 1) {
              this.multi = true;
            }
            return this.setURL();
          }),
        );
      }
    }
  }
}
