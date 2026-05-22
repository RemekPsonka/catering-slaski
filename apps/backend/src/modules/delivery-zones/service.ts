// @ts-nocheck
import { MedusaService } from "@medusajs/framework/utils"
import { MedusaContainer } from "@medusajs/framework/types"
import { DeliveryZone, DeliveryZoneType } from "./models/delivery-zone"

type ZoneLookupResult = DeliveryZoneType & {
  distance_to_center_km?: number
  available_categories: string[]
  delivery_fee_pln: number
  cutoff_today_passed: boolean
  next_available_dates: string[]
}

type CreateZoneInput = Omit<DeliveryZoneType, "id" | "created_at" | "updated_at"> & {
  polygon_geojson: object  // GeoJSON Polygon or MultiPolygon
}

/**
 * Delivery Zones Service
 *
 * Główna logika:
 *  - matchAddressToZone(lat, lng) — point-in-polygon, zwraca najlepszą strefę
 *  - listAllActiveZones() — dla mapy w storefront i admin
 *  - createZone() z GeoJSON — admin tworzy strefę
 *  - calculateEffectiveLeadTime(zone, productLeadTime) — dla checkout
 *
 * Operacje geometryczne idą przez raw SQL (PostGIS), reszta przez Mikro ORM.
 */
export default class DeliveryZonesService extends MedusaService({
  DeliveryZone,
}) {
  // knex is obtained lazily via getKnex_() from mikro-orm manager — no field needed
  constructor(container: MedusaContainer) {
    super(...arguments)
  }

  /**
   * Point-in-polygon: znajdź najlepszą strefę dla adresu klienta.
   * Zwraca strefę z najwyższym priority (LOCAL > REGIONAL > NATIONAL).
   */
  async matchAddressToZone(
    lat: number,
    lng: number
  ): Promise<ZoneLookupResult | null> {
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new Error("Invalid coordinates")
    }

    const knex = this.getKnex_()

    const result = await knex.raw(
      `
      SELECT
        id, name, slug, zone_type, delivery_method,
        base_delivery_fee_cents, free_delivery_threshold_cents,
        min_order_cents, lead_time_days, cutoff_hour, cutoff_minute,
        allowed_product_categories, max_transport_hours, priority,
        is_active, display_color, created_at, updated_at,
        ST_Distance(ST_Centroid(polygon)::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) / 1000 AS distance_to_center_km
      FROM delivery_zones
      WHERE is_active = true
        AND deleted_at IS NULL
        AND ST_Contains(polygon, ST_SetSRID(ST_MakePoint(?, ?), 4326))
      ORDER BY priority DESC
      LIMIT 1
      `,
      [lng, lat, lng, lat]
    )

    const row = result.rows?.[0]
    if (!row) return null

    return this.enrichZoneResult_(row)
  }

  /**
   * Zwraca wszystkie aktywne strefy z GeoJSON polygons (do mapy w storefront).
   */
  async listAllActiveZones(): Promise<
    Array<DeliveryZoneType & { polygon_geojson: object }>
  > {
    const knex = this.getKnex_()
    const result = await knex.raw(
      `
      SELECT
        id, name, slug, zone_type, delivery_method,
        base_delivery_fee_cents, free_delivery_threshold_cents,
        min_order_cents, lead_time_days, cutoff_hour, cutoff_minute,
        allowed_product_categories, max_transport_hours, priority,
        is_active, display_color, created_at, updated_at,
        ST_AsGeoJSON(polygon)::jsonb AS polygon_geojson
      FROM delivery_zones
      WHERE is_active = true AND deleted_at IS NULL
      ORDER BY priority DESC
      `
    )
    return result.rows
  }

  /**
   * Create new delivery zone from GeoJSON (admin operation).
   */
  async createZoneWithPolygon(input: CreateZoneInput): Promise<DeliveryZoneType> {
    const knex = this.getKnex_()
    const id = `dz_${crypto.randomUUID()}`

    await knex.raw(
      `
      INSERT INTO delivery_zones (
        id, name, slug, zone_type, delivery_method,
        polygon,
        base_delivery_fee_cents, free_delivery_threshold_cents, min_order_cents,
        lead_time_days, cutoff_hour, cutoff_minute,
        allowed_product_categories, max_transport_hours, priority,
        is_active, display_color
      ) VALUES (
        ?, ?, ?, ?, ?,
        ST_Multi(ST_GeomFromGeoJSON(?)),
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?
      )
      `,
      [
        id,
        input.name,
        input.slug,
        input.zone_type,
        input.delivery_method,
        JSON.stringify(input.polygon_geojson),
        input.base_delivery_fee_cents,
        input.free_delivery_threshold_cents,
        input.min_order_cents,
        input.lead_time_days,
        input.cutoff_hour,
        input.cutoff_minute,
        JSON.stringify(input.allowed_product_categories),
        input.max_transport_hours,
        input.priority,
        input.is_active,
        input.display_color,
      ]
    )

    const result = await knex.raw(
      `SELECT * FROM delivery_zones WHERE id = ?`,
      [id]
    )
    return result.rows[0]
  }

  /**
   * Effective lead time: max(product lead time, zone lead time), z opcjonalnym override.
   */
  async calculateEffectiveLeadTime(
    zoneId: string,
    productLeadTimeDays: number,
    productId?: string
  ): Promise<number> {
    const knex = this.getKnex_()

    // Sprawdź override w product_zone_availability
    if (productId) {
      const override = await knex.raw(
        `SELECT custom_lead_time_days FROM product_zone_availability
         WHERE product_id = ? AND delivery_zone_id = ? AND is_available = true`,
        [productId, zoneId]
      )
      if (override.rows[0]?.custom_lead_time_days != null) {
        return override.rows[0].custom_lead_time_days
      }
    }

    const zone = await this.retrieveDeliveryZone(zoneId)
    return Math.max(productLeadTimeDays, zone.lead_time_days)
  }

  /**
   * Sprawdza czy cutoff dla strefy jeszcze nie minął (lokalny czas Warsaw).
   */
  isCutoffPassed(zone: DeliveryZoneType, now: Date = new Date()): boolean {
    // Convert to Warsaw timezone — naive implementation, prod use date-fns-tz
    const warsawHour = (now.getUTCHours() + 2) % 24  // approx for summer time
    const warsawMinute = now.getUTCMinutes()

    if (warsawHour > zone.cutoff_hour) return true
    if (warsawHour === zone.cutoff_hour && warsawMinute >= zone.cutoff_minute) return true
    return false
  }

  /**
   * Zwraca najbliższe X dat dostawy uwzględniając cutoff + lead time.
   */
  getNextAvailableDates(zone: DeliveryZoneType, count = 14): string[] {
    const dates: string[] = []
    const now = new Date()
    const cutoffPassed = this.isCutoffPassed(zone, now)

    let startDay = zone.lead_time_days + (cutoffPassed ? 1 : 0)

    for (let i = 0; dates.length < count; i++) {
      const d = new Date(now.getTime() + (startDay + i) * 24 * 60 * 60 * 1000)
      dates.push(d.toISOString().split("T")[0])
    }
    return dates
  }

  // --- Private helpers ---

  private enrichZoneResult_(row: any): ZoneLookupResult {
    const zone: DeliveryZoneType = row
    return {
      ...zone,
      distance_to_center_km: row.distance_to_center_km
        ? Number(row.distance_to_center_km.toFixed(2))
        : undefined,
      available_categories: zone.allowed_product_categories,
      delivery_fee_pln: zone.base_delivery_fee_cents / 100,
      cutoff_today_passed: this.isCutoffPassed(zone),
      next_available_dates: this.getNextAvailableDates(zone, 14),
    }
  }

  private getKnex_(): any {
    // Medusa exposes knex via the manager — fallback to direct require if needed
    const manager = (this as any).baseRepository_?.activeManager_ ||
                    (this as any).manager_
    return manager.getConnection().getKnex()
  }
}
