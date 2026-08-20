// Fuente única de coordenadas de sucursales HomeX (Google Maps, verificadas a
// mano). Clave = InventSiteId (código estable que devuelve
// HE_GetActiveFMCMSites) para que el emparejamiento no dependa de coincidir
// texto libre. Si el endpoint suma una sucursal nueva, alcanza con agregar su
// entrada acá.
export interface BranchCoords {
  name: string
  lat: number | null
  lng: number | null
}

export const BRANCH_COORDS: Record<string, BranchCoords> = {
  ALA: { name: 'HomeX Alajuela', lat: 10.02365694836346, lng: -84.20451275293486 },
  CCA: { name: 'HomeX Cartago', lat: 9.847313, lng: -83.926938 },
  CPR: { name: 'HomeX Plaza Radio', lat: 9.847323393633168, lng: -83.88943813809767 },
  CPT: { name: 'HomeX Pitahaya', lat: 9.849284080953415, lng: -83.92689677695317 },
  SCA: { name: 'HomeX San Carlos', lat: 10.334217216478464, lng: -84.43236041431693 },
  SFN: { name: 'HomeX San Francisco', lat: 9.906575717443216, lng: -84.04890966878872 },
  SJO: { name: 'HomeX Barrio San José', lat: 10.015245851658326, lng: -84.22623013809769 },
  SSH: { name: 'HomeX San Sebastián', lat: 9.912578541238625, lng: -84.09060626878872 },
}

// Sucursales/puntos reales (coordenadas verificadas por el usuario en Google
// Maps) que todavía no tienen InventSiteId propio porque el endpoint
// HE_GetActiveFMCMSites sigue devolviendo solo 8 códigos (ALA, CCA, CPR, CPT,
// SCA, SFN, SJO, SSH). No se les inventa un InventSiteId: se guardan acá,
// aparte, con un id descriptivo propio, y el mapa las combina con las del
// endpoint. Quedan marcadas como "no confirmadas por el sistema" (es decir,
// el BFF/HE_GetActiveFMCMSites no las conoce todavía) aunque son ubicaciones
// reales y se muestran igual en el mapa.
export interface ExtraBranch {
  id: string
  name: string
  lat: number
  lng: number
  // true solo para el Centro de Distribución: no es punto de venta al público.
  isDistributionCenter?: boolean
}

export const EXTRA_BRANCHES: ExtraBranch[] = [
  { id: 'EXTRA_EL_GUARCO', name: 'HomeX El Guarco', lat: 9.848141722160909, lng: -83.95049541489466 },
  { id: 'EXTRA_OREAMUNO', name: 'HomeX Oreamuno', lat: 9.87972126089922, lng: -83.90536259155286 },
  {
    id: 'EXTRA_CD_PRINCIPAL',
    name: 'Centro de Distribución',
    lat: 9.84782355816272,
    lng: -83.950084956878873,
    isDistributionCenter: true,
  },
  { id: 'EXTRA_DESAMPARADOS', name: 'HomeX Desamparados', lat: 9.892900138249793, lng: -84.06376477569897 },
  { id: 'EXTRA_SAN_RAFAEL_ABAJO', name: 'HomeX San Rafael Abajo', lat: 9.889611964976012, lng: -84.07811249947973 },
  { id: 'EXTRA_SAN_JOSE', name: 'HomeX San Jose', lat: 9.932523554893674, lng: -84.0831326836259 },
  { id: 'EXTRA_ALAJUELITA', name: 'HomeX Alajuelita', lat: 9.901817604327325, lng: -84.09881133017076 },
  { id: 'EXTRA_MERCEDES_SUR', name: 'HomeX Mercedes Sur', lat: 10.004488211744155, lng: -84.14092120740666 },
]
