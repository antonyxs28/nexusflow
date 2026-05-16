CREATE INDEX "idx_activities_owner_created" ON "activities" USING btree ("owner_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_analytics_events_owner" ON "analytics_events" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_clients_owner_id" ON "clients" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_owner_status_created" ON "invoices" USING btree ("owner_id","status","created_at");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_owner_status_created" ON "subscriptions" USING btree ("owner_id","status","created_at");--> statement-breakpoint
CREATE INDEX "idx_traffic_sources_owner_source" ON "traffic_sources" USING btree ("owner_id","source");