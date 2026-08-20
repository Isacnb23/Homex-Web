import 'server-only'
import { fetchProtected } from './auth-fetch'
import { normalizeId, DATA_AREA_ID } from './auth-api'
import type { DirectionInput } from './auth-types'

export type DirectionResult =
  | { ok: true; message: string }
  | { ok: false; error: string }

// CreateDirection/UpdateDirection son [Authorize] y, pese a ser POST, ASP.NET
// Core los bindea por query string (son parámetros simples sin [FromBody]) —
// misma convención rara que el resto de esta API.
async function callDirectionEndpoint(
  path: 'CreateDirection' | 'UpdateDirection',
  vatNum: string,
  data: DirectionInput,
  postalAddress?: string
): Promise<DirectionResult> {
  try {
    const params = new URLSearchParams({
      dataAreaId: DATA_AREA_ID,
      vatNumParam: normalizeId(vatNum),
      fullName: data.fullName,
      country: 'Costa Rica',
      province: data.province,
      canton: data.canton,
      city: data.city,
      district: data.district,
      street: data.street,
      address: data.address,
      latitude: data.latitude ?? '',
      longitude: data.longitude ?? '',
      postalName: data.postalName,
    })
    if (postalAddress) params.set('postalAddress', postalAddress)

    const res = await fetchProtected(`/Authentication/${path}?${params.toString()}`, {
      method: 'POST',
    })

    if (!res.ok) {
      return { ok: false, error: `MercasaVIP API respondió ${res.status}` }
    }

    // El formato de la respuesta real no está documentado (no vimos un DTO
    // de retorno); leemos como texto plano para no romper si no es JSON.
    const message = await res.text()
    return { ok: true, message }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Error desconocido guardando la dirección',
    }
  }
}

export function createDirection(vatNum: string, data: DirectionInput) {
  return callDirectionEndpoint('CreateDirection', vatNum, data)
}

// TODO: falta un endpoint para LISTAR direcciones guardadas (no encontrado
// en AuthenticationController). Sin eso, no sabemos el "postalAddress" de una
// dirección existente para poder actualizarla — esta función queda lista
// para cuando se resuelva ese punto.
export function updateDirection(vatNum: string, postalAddress: string, data: DirectionInput) {
  return callDirectionEndpoint('UpdateDirection', vatNum, data, postalAddress)
}