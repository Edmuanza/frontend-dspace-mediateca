import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Exhibition, Slide } from './exhibition.model';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DspaceExhibitionService {

  private apiUrl = environment.rest.baseUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene una exposición completa con sus diapositivas ordenadas.
   */
  getExhibition(exhibitionUuid: string): Observable<Exhibition> {
    return this.http.get<any>(`${this.apiUrl}/core/items/${exhibitionUuid}`).pipe(
      switchMap((item: any): Observable<Exhibition> => {
        const title = this.md(item, 'exhibition.title') || this.md(item, 'dc.title');
        const description = this.md(item, 'exhibition.description');
        const coverManifest = this.md(item, 'exhibition.coverManifest');
        return this.getSlides(exhibitionUuid).pipe(
          map((slides: Slide[]): Exhibition => ({
            uuid: exhibitionUuid,
            title,
            description,
            coverManifest,
            slides
          }))
        );
      })
    );
  }

  /**
   * Obtiene las diapositivas vinculadas a la exposición vía relaciones.
   */
  private getSlides(exhibitionUuid: string): Observable<Slide[]> {
    return this.http.get<any>(`${this.apiUrl}/core/items/${exhibitionUuid}/relationships`).pipe(
      switchMap((response: any): Observable<any[]> => {
        const rels: any[] = response._embedded?.relationships || [];

        const slideRels = rels.filter((rel: any) => {
          const rt = rel._embedded?.relationshipType;
          return rt?.rightType?.label === 'ExhibitionSlide'
              || rt?.leftType?.label === 'ExhibitionSlide';
        });

        if (slideRels.length === 0) {
          return of([] as any[]);
        }

        const reqs: Observable<any>[] = slideRels.map((rel: any) => {
          const rt = rel._embedded.relationshipType;
          const uuid = rt.rightType.label === 'ExhibitionSlide'
            ? rel._links.rightItem.href.split('/').pop()
            : rel._links.leftItem.href.split('/').pop();
          return this.http.get<any>(`${this.apiUrl}/core/items/${uuid}`);
        });

        return forkJoin(reqs);
      }),
      map((items: any[]) =>
        items
          .map((i: any) => this.mapToSlide(i))
          .sort((a: Slide, b: Slide) => a.order - b.order)
      )
    );
  }

  /**
   * Mapea un ítem DSpace a la interfaz Slide.
   */
  private mapToSlide(item: any): Slide {
    return {
      uuid: item.uuid,
      order: parseInt(this.md(item, 'exhibition.order') || '0', 10),
      narrative: this.md(item, 'exhibition.narrative'),
      manifestUrl: this.md(item, 'exhibition.manifestUrl'),
      title: this.md(item, 'dc.title') || this.md(item, 'exhibition.title')
    };
  }

  /**
   * Extrae el primer valor de un campo de metadatos de DSpace.
   */
  private md(item: any, field: string): string {
    const v = item.metadata?.[field];
    return v && v.length > 0 ? v[0].value : '';
  }
}