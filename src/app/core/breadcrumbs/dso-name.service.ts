// dso-name.service.ts
// Servicio responsable de generar nombres para los objetos DSpace (DSO)
// Adaptado para la ontología MOP (Modelo Ontológico de Prensa)

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import {
  hasValue,
  isEmpty,
} from '../../shared/empty.util';
import { DSpaceObject } from '../shared/dspace-object.model';
import { Metadata } from '../shared/metadata.utils';

/**
 * Servicio que devuelve un nombre para un {@link DSpaceObject} basado
 * en sus tipos de renderizado.
 * Adaptado para soportar la ontología MOP (Modelo Ontológico de Prensa)
 */
@Injectable({
  providedIn: 'root',
})
export class DSONameService {

  constructor(private translateService: TranslateService) {}

  /**
   * Fábricas de nombres para diferentes tipos de objetos.
   * Cada función sabe cómo extraer el nombre apropiado según el tipo de DSO.
   */
  private readonly factories = {
    /**
     * Fábrica para EPersons (usuarios del sistema)
     * No aplica MOP, son usuarios internos de DSpace
     */
    EPerson: (dso: DSpaceObject, escapeHTML?: boolean): string => {
      const firstName = dso.firstMetadataValue('eperson.firstname', undefined, escapeHTML);
      const lastName = dso.firstMetadataValue('eperson.lastname', undefined, escapeHTML);
      
      if (isEmpty(firstName) && isEmpty(lastName)) {
        return this.translateService.instant('dso.name.unnamed');
      } else if (isEmpty(firstName) || isEmpty(lastName)) {
        return firstName || lastName;
      } else {
        return `${firstName} ${lastName}`;
      }
    },

    /**
     * Fábrica para Profesional (entidad MOP)
     * Según la ontología MOP, los profesionales usan mop.nombreYApellido
     * @see https://mediatecadelaprensa.cu/ontology/mop#Profesional
     */
    Profesional: (dso: DSpaceObject, escapeHTML?: boolean): string => {
      // Buscar el metadato específico de la ontología MOP
      const nombreCompleto = dso.firstMetadataValue('mop.nombreYApellido', undefined, escapeHTML);
      if (nombreCompleto) {
        return nombreCompleto;
      }
      
      // Fallback a person.familyName y person.givenName (si existen)
      const familyName = dso.firstMetadataValue('person.familyName', undefined, escapeHTML);
      const givenName = dso.firstMetadataValue('person.givenName', undefined, escapeHTML);
      if (familyName || givenName) {
        return isEmpty(familyName) ? givenName : 
               isEmpty(givenName) ? familyName : 
               `${familyName}, ${givenName}`;
      }
      
      // Último recurso: dc.title o nombre interno
      return dso.firstMetadataValue('dc.title', undefined, escapeHTML) || 
             dso.name || 
             this.translateService.instant('dso.name.unnamed');
    },

    /**
     * Fábrica para OrganizacionControlada (entidad MOP)
     * Muestra: "Nombre oficial (Acrónimo)" o solo nombre oficial si no hay acrónimo
     */
    OrganizacionControlada: (dso: DSpaceObject, escapeHTML?: boolean): string => {
      const nombreOficial = dso.firstMetadataValue('mop.nombreOficial', undefined, escapeHTML);
      const acronimo = dso.firstMetadataValue('mop.acronimo', undefined, escapeHTML);
      
      if (isEmpty(nombreOficial) && isEmpty(acronimo)) {
        // Fallback a dc.title o nombre interno
        return dso.firstMetadataValue('dc.title', undefined, escapeHTML) || 
               dso.name || 
               this.translateService.instant('dso.name.unnamed');
      }
      
      // Si hay acrónimo, mostrarlo entre paréntesis; si no, solo el nombre oficial
      return acronimo ? `${nombreOficial} (${acronimo})` : nombreOficial;
    },

    /**
     * Fábrica para OrganizacionExterna (entidad MOP)
     * Misma lógica que OrganizacionControlada
     */
    OrganizacionExterna: (dso: DSpaceObject, escapeHTML?: boolean): string => {
      // Reutiliza la misma lógica que OrganizacionControlada
      return this.factories.OrganizacionControlada(dso, escapeHTML);
    },

    /**
     * Fábrica para Person (persona estándar, no MOP)
     * Usa metadatos Dublin Core estándar
     */
    Person: (dso: DSpaceObject, escapeHTML?: boolean): string => {
      const familyName = dso.firstMetadataValue('person.familyName', undefined, escapeHTML);
      const givenName = dso.firstMetadataValue('person.givenName', undefined, escapeHTML);
      
      if (isEmpty(familyName) && isEmpty(givenName)) {
        return dso.firstMetadataValue('dc.title', undefined, escapeHTML) || 
               this.translateService.instant('dso.name.unnamed');
      } else if (isEmpty(familyName) || isEmpty(givenName)) {
        return familyName || givenName;
      } else {
        return `${familyName}, ${givenName}`;
      }
    },

    /**
     * Fábrica para OrgUnit (unidad organizativa, no MOP)
     */
    OrgUnit: (dso: DSpaceObject, escapeHTML?: boolean): string => {
      return dso.firstMetadataValue('organization.legalName', undefined, escapeHTML) ||
             dso.firstMetadataValue('dc.title', undefined, escapeHTML) ||
             dso.name ||
             this.translateService.instant('dso.name.unnamed');
    },

    /**
     * Fábrica por defecto para Items y otros tipos
     * PRIORIDAD MOP (para contenidos editoriales):
     * 1. mop.titulo
     * 2. mop.nombreOficial (para organizaciones que no se hayan detectado)
     * 3. dc.title (Dublin Core estándar)
     * 4. nombre interno o traducción
     * 
     * @see https://mediatecadelaprensa.cu/ontology/mop#titulo
     */
    Default: (dso: DSpaceObject, escapeHTML?: boolean): string => {
      // 1. mop.titulo (prioridad máxima para contenidos MOP)
      const mopTitulo = dso.firstMetadataValue('mop.titulo', undefined, escapeHTML);
      if (mopTitulo) {
        return mopTitulo;
      }
      
      // 2. mop.nombreOficial (para organizaciones que no se hayan detectado)
      const mopNombreOficial = dso.firstMetadataValue('mop.nombreOficial', undefined, escapeHTML);
      if (mopNombreOficial) {
        // Si tiene acrónimo, lo añadimos
        const acronimo = dso.firstMetadataValue('mop.acronimo', undefined, escapeHTML);
        return acronimo ? `${mopNombreOficial} (${acronimo})` : mopNombreOficial;
      }

      const mopFechaPublicacion = dso.firstMetadataValue('mop.fechaPublicacion', undefined, escapeHTML);
      if (mopFechaPublicacion) {
        return mopFechaPublicacion;
      }



      
      // 3. Fallback a dc.title (Dublin Core estándar)
      const dcTitle = dso.firstMetadataValue('dc.title', undefined, escapeHTML);
      if (dcTitle) {
        return dcTitle;
      }
      
      // 4. Último recurso: nombre interno o traducción
      return dso.name || this.translateService.instant('dso.name.untitled');
    },
  };

  /**
   * Obtiene el nombre para un DSpaceObject
   * 
   * @param dso El objeto DSpace del que obtener el nombre
   * @param escapeHTML Si debe escapar HTML (útil para [innerHTML])
   * @returns El nombre del objeto
   */
  getName(dso: DSpaceObject | undefined, escapeHTML?: boolean): string {
    if (!dso) {
      return '';
    }

    // Obtiene los tipos de renderizado del objeto
    const types = dso.getRenderTypes();
    
    // Busca una fábrica que coincida con algún tipo de renderizado
    const match = types
      .filter((type) => typeof type === 'string')
      .find((type: string) => Object.keys(this.factories).includes(type)) as string;

    let name;
    // Si encontró una fábrica específica, la usa
    if (hasValue(match)) {
      name = this.factories[match](dso, escapeHTML);
    }
    
    // Si no obtuvo nombre, usa la fábrica por defecto
    if (isEmpty(name)) {
      name = this.factories.Default(dso, escapeHTML);
    }
    
    return name;
  }

  /**
   * Obtiene el nombre con resaltados de búsqueda (hit highlights)
   * Útil para resultados de búsqueda donde algunas palabras aparecen resaltadas
   * 
   * @param object Objeto de respuesta de búsqueda con hitHighlights
   * @param dso El objeto DSpace
   * @param escapeHTML Si debe escapar HTML
   * @returns Nombre con resaltados HTML
   */
  getHitHighlights(object: any, dso: DSpaceObject, escapeHTML?: boolean): string {
    const types = dso.getRenderTypes();
    
    // Determina el tipo de entidad para tratamiento especial
    const entityType = types
      .filter((type) => typeof type === 'string')
      .find((type: string) => (['Profesional', 'Person', 'OrgUnit', 'OrganizacionControlada', 'OrganizacionExterna']).includes(type)) as string;
    
    // Tratamiento especial para Profesional (MOP)
    if (entityType === 'Profesional') {
      const nombreCompleto = this.firstMetadataValue(object, dso, 'mop.nombreYApellido', escapeHTML);
      if (nombreCompleto) {
        return nombreCompleto;
      }
      
      const familyName = this.firstMetadataValue(object, dso, 'person.familyName', escapeHTML);
      const givenName = this.firstMetadataValue(object, dso, 'person.givenName', escapeHTML);
      
      if (isEmpty(familyName) && isEmpty(givenName)) {
        // Fallback a mop.titulo o dc.title
        return this.firstMetadataValue(object, dso, 'mop.titulo', escapeHTML) || 
               this.firstMetadataValue(object, dso, 'dc.title', escapeHTML) || 
               dso.name || 
               this.translateService.instant('dso.name.untitled');
      } else if (isEmpty(familyName) || isEmpty(givenName)) {
        return familyName || givenName;
      }
      return `${familyName}, ${givenName}`;
    }
    
    // Tratamiento especial para OrganizacionControlada y OrganizacionExterna (MOP)
    if (entityType === 'OrganizacionControlada' || entityType === 'OrganizacionExterna') {
      const nombreOficial = this.firstMetadataValue(object, dso, 'mop.nombreOficial', escapeHTML);
      const acronimo = this.firstMetadataValue(object, dso, 'mop.acronimo', escapeHTML);
      
      if (isEmpty(nombreOficial) && isEmpty(acronimo)) {
        return this.firstMetadataValue(object, dso, 'dc.title', escapeHTML) || 
               dso.name || 
               this.translateService.instant('dso.name.untitled');
      }
      return acronimo ? `${nombreOficial} (${acronimo})` : nombreOficial;
    }
    
    // Tratamiento especial para Person (no MOP)
    if (entityType === 'Person') {
      const familyName = this.firstMetadataValue(object, dso, 'person.familyName', escapeHTML);
      const givenName = this.firstMetadataValue(object, dso, 'person.givenName', escapeHTML);
      
      if (isEmpty(familyName) && isEmpty(givenName)) {
        return this.firstMetadataValue(object, dso, 'dc.title', escapeHTML) || 
               dso.name || 
               this.translateService.instant('dso.name.untitled');
      } else if (isEmpty(familyName) || isEmpty(givenName)) {
        return familyName || givenName;
      }
      return `${familyName}, ${givenName}`;
    } 
    
    // Tratamiento especial para OrgUnit
    else if (entityType === 'OrgUnit') {
      return this.firstMetadataValue(object, dso, 'organization.legalName', escapeHTML) ||
             this.firstMetadataValue(object, dso, 'dc.title', escapeHTML) ||
             dso.name ||
             this.translateService.instant('dso.name.untitled');
    }
    
    // Para cualquier otro tipo (items), prioridad MOP: mop.titulo
    return this.firstMetadataValue(object, dso, 'mop.titulo', escapeHTML) || 
           this.firstMetadataValue(object, dso, 'mop.nombreOficial', escapeHTML) || // Caso de organizaciones no detectadas
           this.firstMetadataValue(object, dso, 'dc.title', escapeHTML) || 
           dso.name || 
           this.translateService.instant('dso.name.untitled');
  }

  /**
   * Obtiene el primer valor de metadato que coincida, prefiriendo hitHighlights
   * 
   * @param object Objeto con hitHighlights
   * @param dso Objeto DSpace con metadatos
   * @param keyOrKeys Clave(s) de metadato a buscar
   * @param escapeHTML Si debe escapar HTML
   * @returns El primer valor encontrado
   */
  firstMetadataValue(object: any, dso: DSpaceObject, keyOrKeys: string | string[], escapeHTML?: boolean): string {
    return Metadata.firstValue(
      dso.metadata,           // Metadatos del objeto
      keyOrKeys,              // Clave(s) a buscar
      object?.hitHighlights,  // Resaltados de búsqueda (opcional)
      undefined,              // Preferencia de idioma (ninguna)
      escapeHTML              // Escapar HTML?
    );
  }
}