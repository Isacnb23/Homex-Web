// Fuente única de coordenadas de sucursales HomeX (Google Maps, verificadas a
// mano). Clave = InventSiteId (código estable que devuelve
// HE_GetActiveFMCMSites) para que el emparejamiento no dependa de coincidir
// texto libre. Si el endpoint suma una sucursal nueva, alcanza con agregar su
// entrada acá.
//
// CPT (Pitahaya) está activa en el endpoint pero no tenemos coordenada real
// todavía: se deja con lat/lng null a propósito (no inventar coordenadas).
export interface BranchCoords {
  name: string
  lat: number | null
  lng: number | null
}

export const BRANCH_COORDS: Record<string, BranchCoords> = {
  ALA: { name: 'HomeX Alajuela', lat: 10.022688, lng: -84.204063 },
  CCA: { name: 'HomeX Cartago', lat: 9.847313, lng: -83.926938 },
  CPR: { name: 'HomeX Plaza Radio', lat: 9.84517, lng: -83.88974 },
  CPT: { name: 'HomeX Pitahaya', lat: null, lng: null },
  SCA: { name: 'HomeX San Carlos', lat: 10.333035, lng: -84.431749 },
  SFN: { name: 'HomeX San Francisco', lat: 9.900188, lng: -84.049063 },
  SJO: { name: 'HomeX Barrio San José', lat: 10.014313, lng: -84.226438 },
  SSH: { name: 'HomeX San Sebastián', lat: 9.910688, lng: -84.090688 },
}
