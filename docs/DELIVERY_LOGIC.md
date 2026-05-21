# Catering Śląski — Logika dostaw (DELIVERY_LOGIC.md)

Żywy dokument — opisuje moduł dostaw enterprise-grade.

## 1. Modele

```
DeliveryZone (cs.delivery_zones, PostGIS polygon w raw column)
├─ id, name, slug, zone_type [local|regional|national]
├─ supported_methods: string[]  (kody z DeliveryMethod.code)
├─ postal_codes: string[]       (fast-path lookup)
├─ delivery_days: number[]      (0=Sun..6=Sat; pusta = wszystkie)
├─ operating_hours: { weekday → {open, close} }
├─ base_delivery_fee_cents, free_delivery_threshold_cents
├─ min_order_cents
├─ cutoff_hour, cutoff_minute
├─ requires_thermal_packaging
└─ capture_lead_when_out_of_range

DeliveryMethod (cs.delivery_methods)
├─ code (unique): own_fleet | courier_dpd | courier_inpost | pickup_own | …
├─ requires_thermal_packaging, supports_same_day, supports_weekend
├─ default_cost_cents, default_cutoff_hour, default_lead_time_days
├─ has_tracking, allowed_categories
└─ provider_config (encrypted)

DeliveryTimeSlot (cs.time_slots)
├─ delivery_zone_id, slot_date, time_from, time_to
├─ capacity, booked_count
└─ status [open|full|blocked|closed]

SlotReservation (cs.slot_reservations)
├─ time_slot_id, cart_id, order_id
└─ status [pending|confirmed|expired|released], TTL 20min

ProductAvailability (cs.product_availabilities)
├─ product_id, weekdays[], available_from/to, daily_limit
├─ kitchen_lead_minutes, zone_restrictions[]
└─ is_active

ProductDailyCount (cs.product_daily_counts)
└─ ordered_quantity, reserved_quantity, cancelled_quantity per (product, date)

DeliveryRoute (cs.delivery_routes)
├─ route_date, zone_id, driver_id, vehicle
├─ stops: [{ order_id, sequence, address, lat, lng, eta, status, notes }]
├─ status, estimated_distance_km, estimated_duration_min
└─ HACCP: loading_temp_celsius, loading_temp_at

ProductionRun (cs.production_runs)
├─ production_date, status
├─ order_ids[], aggregated_items[{product_id, name, qty, allergens}]
└─ kitchen_notes, shift_manager_id

KitchenLabel (cs.kitchen_labels)
└─ order_id, customer_name, product_name, allergens[], delivery_date, qr_payload

QualityCheck (cs.quality_checks) — HACCP log
├─ check_type, related_order_id, related_route_id
├─ temperature_celsius, passed
└─ recorded_by, recorded_at, notes
```

## 2. Flow zamawiania (klient)

```
1. Klient wpisuje kod pocztowy → GET /store/postal-lookup?code=40-159
   ├─ matched_zone OR
   └─ capture_lead → pokazujemy NewsletterSignup z opcją "powiadom mnie"

2. Klient wybiera datę → GET /store/product-availability?product_id=...&date=...
   (oraz analogicznie dla całego koszyka)

3. Klient wybiera okienko → GET /store/time-slots?zone_id=...&date=...
   ├─ filtrujemy: cutoff > now()
   ├─ filtrujemy: status == "open" && available > 0
   └─ filtrujemy: method.allowed_categories ⊇ cart.categories

4. Klient wybiera sposób dostawy (z dostępnych w strefie)
   └─ koszt = max(method.default_cost_cents, zone.base_delivery_fee_cents)
   └─ jeśli cart.total >= zone.free_delivery_threshold → 0

5. Checkout:
   - cart.metadata.delivery_zone_id
   - cart.metadata.delivery_method_code
   - cart.metadata.delivery_date (YYYY-MM-DD)
   - cart.metadata.delivery_slot (HH:MM-HH:MM)
   - cart.metadata.delivery_notes (kod do bramy itp.)
   - SlotReservation z TTL 20min

6. Po payment.captured:
   - SlotReservation.status = "confirmed"
   - ProductionRun (nightly cron) zaktualizuje aggregated_items
   - subscriber `order-fulfillment-shipped` wyśle SMS/email gdy kierowca rusza
```

## 3. Cut-off logic

Per slot (fallback per zone):

```
cutoff_at(slot) = slot.slot_date - (slot.cutoff_offset_hours or zone.cutoff_hour) hours
                  - zone.lead_time_days days
                  + zone.cutoff_minute minutes
```

Storefront ukrywa okienka gdzie `cutoff_at < now()`. Backend dodatkowo waliduje na
`POST /store/carts/:id/complete` — w razie kolizji zwraca 409 z aktualnym
najbliższym dostępnym oknem.

## 4. Postal code lookup vs geofencing

| Metoda | Latency | Coverage | Use case |
|---|---|---|---|
| postal_codes (JSON array) | ~5ms | Dokładnie te kody co dodano | Storefront UI step 1 |
| PostGIS polygon | ~50ms | Cała geometria | Cart fallback, edge cases |

Strategia: storefront używa postal-lookup jako fast path. Jeśli kod nie matchuje
żadnej strefy, zone-lookup po lat/lng może jeszcze złapać klienta (np. nowy
adres, którego jeszcze nie dodano do `postal_codes`).

## 5. Strefy — przykładowa konfiguracja (do seedowania)

| Strefa | Kody | Metody | Cena bazowa | Free od | Cut-off | Lead |
|---|---|---|---|---|---|---|
| Katowice — centrum | 40-001..40-959 | own_fleet, pickup_own | 19 zł | 600 zł | 20:00 D-1 | 0d |
| Sosnowiec / Mysłowice | 41-200..41-299, 41-400..41-509 | own_fleet | 29 zł | 800 zł | 18:00 D-1 | 1d |
| Aglomeracja Śląska | 41-100..41-959 (większość) | own_fleet | 39 zł | 1000 zł | 16:00 D-1 | 1d |
| Reszta PL | * | courier_dpd, courier_inpost | 25 zł | 200 zł | 12:00 D-1 | 1-2d |
| Beskidy / Cieszyn | 43-300..43-509 | local_courier_manual, pickup_own | 49 zł | 1500 zł | 14:00 D-1 | 1d |

(Realne wartości — do potwierdzenia przez właściciela. Seed script
`pnpm exec medusa exec ./src/scripts/seed-delivery-zones-v2.ts` w TODO.)

## 6. HACCP log

Triggered:
- Przy starcie route: `POST /admin/routes/:id/start` → tworzy QualityCheck (loading_temp)
- Przy dostawie: `POST /admin/routes/:id/stops/:i/deliver` → QualityCheck (delivery_temp)
- Reklamacja: agent może dodać incident → QualityCheck z notes

Raporty: GET /admin/quality-checks?from=&to= → CSV export dla audytu SANEPID.

## 7. Co jeszcze do dorobienia (poza nocną sesją)

- [ ] TSP solver / auto-router dla DeliveryRoute (np. OR-Tools microservice)
- [ ] Realtime tracking kierowcy (GPS via mobile app — osobny project)
- [ ] DPD/InPost API integration (etykiety, tracking webhook)
- [ ] Glovo/Wolt API
- [ ] Reverse geocoding fallback gdy postal_codes pusty
- [ ] Mapa stref w admin (LeafletJS + GeoJSON z PostGIS)
- [ ] Migracja danych: konwersja istniejących DeliveryZone z `delivery_method` (single) na `supported_methods` (array). Skrypt `migrate-zones-v2.ts` w TODO.
