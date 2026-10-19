CREATE SCHEMA "transport";
--> statement-breakpoint
CREATE TABLE "transport"."transport_locations" (
	"id" text PRIMARY KEY NOT NULL,
	"transport_id" text NOT NULL,
	"location_type" text NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"pin_code" text NOT NULL,
	"lat" double precision,
	"lng" double precision,
	"business_hours_start" text NOT NULL,
	"business_hours_end" text NOT NULL,
	"contact_phone" text
);
--> statement-breakpoint
CREATE TABLE "transport"."transport_pricing" (
	"id" text PRIMARY KEY NOT NULL,
	"transport_id" text NOT NULL,
	"pricing_type" text NOT NULL,
	"rate" numeric(10, 2) NOT NULL,
	"unit" text NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "transport"."transports" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone_number" text NOT NULL,
	"gst_number" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transport"."transport_locations" ADD CONSTRAINT "transport_locations_transport_id_transports_id_fk" FOREIGN KEY ("transport_id") REFERENCES "transport"."transports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transport"."transport_pricing" ADD CONSTRAINT "transport_pricing_transport_id_transports_id_fk" FOREIGN KEY ("transport_id") REFERENCES "transport"."transports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_locations_city" ON "transport"."transport_locations" USING btree ("city");--> statement-breakpoint
CREATE INDEX "idx_locations_state" ON "transport"."transport_locations" USING btree ("state");--> statement-breakpoint
CREATE INDEX "idx_locations_pin_code" ON "transport"."transport_locations" USING btree ("pin_code");--> statement-breakpoint
CREATE INDEX "idx_locations_transport_id" ON "transport"."transport_locations" USING btree ("transport_id");--> statement-breakpoint
CREATE INDEX "idx_pricing_transport_id" ON "transport"."transport_pricing" USING btree ("transport_id");--> statement-breakpoint
CREATE INDEX "idx_pricing_unit" ON "transport"."transport_pricing" USING btree ("unit");--> statement-breakpoint
CREATE INDEX "idx_transports_name" ON "transport"."transports" USING btree ("name");