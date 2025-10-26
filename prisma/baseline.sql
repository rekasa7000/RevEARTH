-- CreateEnum
CREATE TYPE "OccupancyType" AS ENUM ('residential', 'commercial', 'industrial', 'lgu', 'academic');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('draft', 'submitted', 'validated', 'archived');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('natural_gas', 'heating_oil', 'propane', 'diesel', 'gasoline', 'coal', 'wood', 'biomass', 'lpg', 'kerosene', 'fuel_oil', 'biodiesel', 'ethanol', 'other');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('sedan', 'suv', 'truck', 'van', 'motorcycle');

-- CreateEnum
CREATE TYPE "RefrigerantType" AS ENUM ('R_410A', 'R_134a', 'R_32', 'R_404A');

-- CreateEnum
CREATE TYPE "TransportMode" AS ENUM ('car', 'motorcycle', 'bus', 'jeepney', 'train', 'bicycle', 'walking');

-- CreateEnum
CREATE TYPE "ErrorLevel" AS ENUM ('error', 'warn', 'info', 'debug');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "password_hash" TEXT,
    "verification_token" TEXT,
    "reset_token" TEXT,
    "reset_token_expires" TIMESTAMP(3),
    "last_login" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "expires_at" TIMESTAMP(3),
    "password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry_sector" TEXT,
    "occupancy_type" "OccupancyType" NOT NULL,
    "reporting_boundaries" JSONB,
    "applicable_scopes" JSONB NOT NULL DEFAULT '{"scope1": true, "scope2": true, "scope3": false}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "address" TEXT,
    "area_sqm" DECIMAL(10,2),
    "employee_count" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emission_records" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "facility_id" TEXT,
    "reporting_period_start" DATE NOT NULL,
    "reporting_period_end" DATE NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'draft',
    "scope_selection" JSONB NOT NULL DEFAULT '{"scope1": true, "scope2": true, "scope3": false}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emission_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_usage" (
    "id" TEXT NOT NULL,
    "emission_record_id" TEXT NOT NULL,
    "fuel_type" "FuelType" NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "co2e_calculated" DECIMAL(12,4),
    "entry_date" DATE NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "fuel_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_usage" (
    "id" TEXT NOT NULL,
    "emission_record_id" TEXT NOT NULL,
    "vehicle_id" TEXT,
    "vehicle_type" "VehicleType" NOT NULL,
    "fuel_type" "FuelType" NOT NULL,
    "fuel_consumed" DECIMAL(10,2),
    "mileage" DECIMAL(10,2),
    "unit" TEXT NOT NULL,
    "co2e_calculated" DECIMAL(12,4),
    "entry_date" DATE NOT NULL,

    CONSTRAINT "vehicle_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refrigerant_usage" (
    "id" TEXT NOT NULL,
    "emission_record_id" TEXT NOT NULL,
    "equipment_id" TEXT,
    "refrigerant_type" "RefrigerantType" NOT NULL,
    "quantity_leaked" DECIMAL(10,4),
    "quantity_purchased" DECIMAL(10,4),
    "unit" TEXT NOT NULL,
    "co2e_calculated" DECIMAL(12,4),
    "entry_date" DATE NOT NULL,
    "leak_detection_log" JSONB,

    CONSTRAINT "refrigerant_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "electricity_usage" (
    "id" TEXT NOT NULL,
    "emission_record_id" TEXT NOT NULL,
    "facility_id" TEXT,
    "meter_number" TEXT,
    "kwh_consumption" DECIMAL(12,2) NOT NULL,
    "peak_hours_kwh" DECIMAL(12,2),
    "offpeak_hours_kwh" DECIMAL(12,2),
    "co2e_calculated" DECIMAL(12,4),
    "billing_period_start" DATE NOT NULL,
    "billing_period_end" DATE NOT NULL,
    "utility_bill_data" JSONB,

    CONSTRAINT "electricity_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commuting_data" (
    "id" TEXT NOT NULL,
    "emission_record_id" TEXT NOT NULL,
    "employee_count" INTEGER NOT NULL,
    "avg_distance_km" DECIMAL(8,2),
    "transport_mode" "TransportMode" NOT NULL,
    "days_per_week" INTEGER,
    "wfh_days" INTEGER,
    "co2e_calculated" DECIMAL(12,4),
    "survey_date" DATE,

    CONSTRAINT "commuting_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_commute_surveys" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "employee_identifier" TEXT,
    "distance_km" DECIMAL(8,2) NOT NULL,
    "transport_mode" "TransportMode" NOT NULL,
    "office_days_per_week" INTEGER NOT NULL,
    "wfh_days_per_week" INTEGER NOT NULL,
    "survey_date" DATE NOT NULL,
    "quarter" TEXT,

    CONSTRAINT "employee_commute_surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emission_calculations" (
    "id" TEXT NOT NULL,
    "emission_record_id" TEXT NOT NULL,
    "total_scope1_co2e" DECIMAL(15,4),
    "total_scope2_co2e" DECIMAL(15,4),
    "total_scope3_co2e" DECIMAL(15,4),
    "total_co2e" DECIMAL(15,4),
    "breakdown_by_category" JSONB,
    "emission_factors_used" JSONB,
    "emissions_per_employee" DECIMAL(12,4),
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emission_calculations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "error_logs" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "level" "ErrorLevel" NOT NULL DEFAULT 'error',
    "context" TEXT,
    "url" TEXT,
    "user_agent" TEXT,
    "user_id" TEXT,
    "method" TEXT,
    "status_code" INTEGER,
    "request_body" JSONB,
    "metadata" JSONB,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "resolved_by" TEXT,
    "occurrences" INTEGER NOT NULL DEFAULT 1,
    "first_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "environment" TEXT NOT NULL DEFAULT 'production',

    CONSTRAINT "error_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_user_id_key" ON "organizations"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "emission_calculations_emission_record_id_key" ON "emission_calculations"("emission_record_id");

-- CreateIndex
CREATE INDEX "error_logs_level_resolved_idx" ON "error_logs"("level", "resolved");

-- CreateIndex
CREATE INDEX "error_logs_first_seen_at_idx" ON "error_logs"("first_seen_at");

-- CreateIndex
CREATE INDEX "error_logs_user_id_idx" ON "error_logs"("user_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emission_records" ADD CONSTRAINT "emission_records_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_usage" ADD CONSTRAINT "fuel_usage_emission_record_id_fkey" FOREIGN KEY ("emission_record_id") REFERENCES "emission_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_usage" ADD CONSTRAINT "vehicle_usage_emission_record_id_fkey" FOREIGN KEY ("emission_record_id") REFERENCES "emission_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refrigerant_usage" ADD CONSTRAINT "refrigerant_usage_emission_record_id_fkey" FOREIGN KEY ("emission_record_id") REFERENCES "emission_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "electricity_usage" ADD CONSTRAINT "electricity_usage_emission_record_id_fkey" FOREIGN KEY ("emission_record_id") REFERENCES "emission_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "electricity_usage" ADD CONSTRAINT "electricity_usage_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commuting_data" ADD CONSTRAINT "commuting_data_emission_record_id_fkey" FOREIGN KEY ("emission_record_id") REFERENCES "emission_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_commute_surveys" ADD CONSTRAINT "employee_commute_surveys_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emission_calculations" ADD CONSTRAINT "emission_calculations_emission_record_id_fkey" FOREIGN KEY ("emission_record_id") REFERENCES "emission_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

