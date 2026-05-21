// @ts-nocheck
/**
 * Seed: domyślne 3 strefy dostawy dla Catering Śląski
 *
 * Polygony to przybliżone obszary — admin po pierwszym deploy
 * powinien doprecyzować przez Zone Editor w panelu.
 *
 * Run: pnpm seed:zones
 */
import { Pool } from "pg"

const DATABASE_URL = process.env.DATABASE_URL || "postgres://medusa:medusa_dev_password@localhost:5432/catering_slaski"

// Strefa LOKALNA — Katowice, Sosnowiec, Dąbrowa, Bytom, Chorzów, Ruda, Mysłowice
// Przybliżony polygon centrum aglomeracji
const ZONE_LOCAL_POLYGON = {
  type: "Polygon",
  coordinates: [
    [
      [18.85, 50.40],  // NW (Bytom)
      [19.30, 50.40],  // NE (Sosnowiec/DG)
      [19.32, 50.18],  // SE (Jaworzno)
      [18.85, 50.18],  // SW (Mikolow)
      [18.85, 50.40],  // close
    ],
  ],
}

// Strefa REGIONALNA — Gliwice, Tychy, Zabrze, Mikołów, Jaworzno, Tarn. Góry
// Outer ring around local
const ZONE_REGIONAL_POLYGON = {
  type: "Polygon",
  coordinates: [
    [
      [18.55, 50.55],
      [19.55, 50.55],
      [19.55, 50.05],
      [18.55, 50.05],
      [18.55, 50.55],
    ],
  ],
}

// Strefa KRAJOWA — cała Polska
const ZONE_NATIONAL_POLYGON = {
  type: "Polygon",
  coordinates: [
    [
      [14.10, 54.85],  // NW
      [24.15, 54.85],  // NE
      [24.15, 49.00],  // SE
      [14.10, 49.00],  // SW
      [14.10, 54.85],  // close
    ],
  ],
}

const SEED_ZONES = [
  {
    name: "Strefa Lokalna",
    slug: "lokalna",
    zone_type: "local",
    delivery_method: "own_fleet",
    polygon: ZONE_LOCAL_POLYGON,
    base_delivery_fee_cents: 2900,
    free_delivery_threshold_cents: 50000,  // gratis >500zł
    min_order_cents: 15000,
    lead_time_days: 0,
    cutoff_hour: 9,
    cutoff_minute: 0,
    allowed_product_categories: [
      "hot_meals", "catering_boxes", "diet_meals",
      "bundles", "event_special", "subscription",
    ],
    max_transport_hours: 1,
    priority: 300,
    display_color: "#E54B17",  // signal orange
  },
  {
    name: "Strefa Regionalna",
    slug: "regionalna",
    zone_type: "regional",
    delivery_method: "own_fleet",
    polygon: ZONE_REGIONAL_POLYGON,
    base_delivery_fee_cents: 4900,
    free_delivery_threshold_cents: 80000,
    min_order_cents: 20000,
    lead_time_days: 1,
    cutoff_hour: 18,
    cutoff_minute: 0,
    allowed_product_categories: [
      "hot_meals", "catering_boxes", "diet_meals",
      "bundles", "event_special", "subscription",
    ],
    max_transport_hours: 2,
    priority: 200,
    display_color: "#0A0908",
  },
  {
    name: "Strefa Krajowa",
    slug: "krajowa",
    zone_type: "national",
    delivery_method: "courier_dpd",
    polygon: ZONE_NATIONAL_POLYGON,
    base_delivery_fee_cents: 3500,
    free_delivery_threshold_cents: null,
    min_order_cents: 30000,
    lead_time_days: 2,
    cutoff_hour: 18,
    cutoff_minute: 0,
    allowed_product_categories: ["catering_boxes"],  // tylko boxy które przeżyją kurier
    max_transport_hours: 24,
    priority: 100,
    display_color: "#585553",
  },
]

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL })
  const client = await pool.connect()

  try {
    console.log("→ Seeding delivery zones...")

    for (const zone of SEED_ZONES) {
      // Check if exists
      const existing = await client.query(
        "SELECT id FROM delivery_zones WHERE slug = $1",
        [zone.slug]
      )

      if (existing.rows.length > 0) {
        console.log(`  ⏭  ${zone.name} already exists, skipping`)
        continue
      }

      await client.query(
        `
        INSERT INTO delivery_zones (
          name, slug, zone_type, delivery_method,
          polygon,
          base_delivery_fee_cents, free_delivery_threshold_cents,
          min_order_cents, lead_time_days, cutoff_hour, cutoff_minute,
          allowed_product_categories, max_transport_hours, priority,
          is_active, display_color
        ) VALUES (
          $1, $2, $3, $4,
          ST_Multi(ST_GeomFromGeoJSON($5)),
          $6, $7, $8, $9, $10, $11,
          $12, $13, $14, $15, $16
        )
        `,
        [
          zone.name,
          zone.slug,
          zone.zone_type,
          zone.delivery_method,
          JSON.stringify(zone.polygon),
          zone.base_delivery_fee_cents,
          zone.free_delivery_threshold_cents,
          zone.min_order_cents,
          zone.lead_time_days,
          zone.cutoff_hour,
          zone.cutoff_minute,
          zone.allowed_product_categories,
          zone.max_transport_hours,
          zone.priority,
          true,
          zone.display_color,
        ]
      )
      console.log(`  ✓ ${zone.name}`)
    }

    // Sanity check: test point-in-polygon dla Katowic
    const katowice = await client.query(
      `
      SELECT name FROM delivery_zones
      WHERE ST_Contains(polygon, ST_SetSRID(ST_MakePoint(19.0207, 50.2598), 4326))
      ORDER BY priority DESC LIMIT 1
      `
    )
    console.log(`\n✓ Katowice (50.26, 19.02) → ${katowice.rows[0]?.name || "OUT"}`)

    const warszawa = await client.query(
      `
      SELECT name FROM delivery_zones
      WHERE ST_Contains(polygon, ST_SetSRID(ST_MakePoint(21.0118, 52.2297), 4326))
      ORDER BY priority DESC LIMIT 1
      `
    )
    console.log(`✓ Warszawa (52.23, 21.01) → ${warszawa.rows[0]?.name || "OUT"}`)

    console.log("\n✓ Done — admin może doprecyzować polygony w Zone Editor")
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
