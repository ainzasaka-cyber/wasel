-- WASEL RLS foundation.
-- Apply this migration using a least-privilege application role, never a superuser.
-- The application role must be NOSUPERUSER NOBYPASSRLS and must own the tables.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'wasel_app') THEN
    CREATE ROLE wasel_app LOGIN NOSUPERUSER NOBYPASSRLS;
  END IF;
END $$;

-- Enable and force RLS on every tenant-owned table.
ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY; ALTER TABLE "Tenant" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Store" ENABLE ROW LEVEL SECURITY; ALTER TABLE "Store" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY; ALTER TABLE "Product" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY; ALTER TABLE "Customer" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY; ALTER TABLE "Order" FORCE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY; ALTER TABLE "OrderItem" FORCE ROW LEVEL SECURITY;
ALTER TABLE "OrderEvent" ENABLE ROW LEVEL SECURITY; ALTER TABLE "OrderEvent" FORCE ROW LEVEL SECURITY;
ALTER TABLE "TenantMembership" ENABLE ROW LEVEL SECURITY; ALTER TABLE "TenantMembership" FORCE ROW LEVEL SECURITY;
ALTER TABLE "ApiKey" ENABLE ROW LEVEL SECURITY; ALTER TABLE "ApiKey" FORCE ROW LEVEL SECURITY;
ALTER TABLE "IdempotencyRecord" ENABLE ROW LEVEL SECURITY; ALTER TABLE "IdempotencyRecord" FORCE ROW LEVEL SECURITY;
ALTER TABLE "WebhookEvent" ENABLE ROW LEVEL SECURITY; ALTER TABLE "WebhookEvent" FORCE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY; ALTER TABLE "AuditLog" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Courier" ENABLE ROW LEVEL SECURITY; ALTER TABLE "Courier" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Shipment" ENABLE ROW LEVEL SECURITY; ALTER TABLE "Shipment" FORCE ROW LEVEL SECURITY;
ALTER TABLE "ShipmentAssignment" ENABLE ROW LEVEL SECURITY; ALTER TABLE "ShipmentAssignment" FORCE ROW LEVEL SECURITY;
ALTER TABLE "DeliveryAttempt" ENABLE ROW LEVEL SECURITY; ALTER TABLE "DeliveryAttempt" FORCE ROW LEVEL SECURITY;
ALTER TABLE "ProofOfDelivery" ENABLE ROW LEVEL SECURITY; ALTER TABLE "ProofOfDelivery" FORCE ROW LEVEL SECURITY;
ALTER TABLE "CodCollection" ENABLE ROW LEVEL SECURITY; ALTER TABLE "CodCollection" FORCE ROW LEVEL SECURITY;
ALTER TABLE "SettlementBatch" ENABLE ROW LEVEL SECURITY; ALTER TABLE "SettlementBatch" FORCE ROW LEVEL SECURITY;
ALTER TABLE "SettlementBatchCollection" ENABLE ROW LEVEL SECURITY; ALTER TABLE "SettlementBatchCollection" FORCE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION wasel_current_tenant_id() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT NULLIF(current_setting('app.tenant_id', true), '')::uuid $$;
CREATE OR REPLACE FUNCTION wasel_rls_bypass() RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT current_setting('app.bypass_rls', true) = 'on' $$;

DROP POLICY IF EXISTS tenant_isolation_tenant ON "Tenant";
CREATE POLICY tenant_isolation_tenant ON "Tenant" USING (wasel_rls_bypass() OR id = wasel_current_tenant_id()) WITH CHECK (wasel_rls_bypass() OR id = wasel_current_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_store ON "Store";
CREATE POLICY tenant_isolation_store ON "Store" USING (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id()) WITH CHECK (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id());
DROP POLICY IF EXISTS tenant_isolation_product ON "Product";
CREATE POLICY tenant_isolation_product ON "Product" USING (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id()) WITH CHECK (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id());
DROP POLICY IF EXISTS tenant_isolation_customer ON "Customer";
CREATE POLICY tenant_isolation_customer ON "Customer" USING (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id()) WITH CHECK (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id());
DROP POLICY IF EXISTS tenant_isolation_order ON "Order";
CREATE POLICY tenant_isolation_order ON "Order" USING (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id()) WITH CHECK (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id());
DROP POLICY IF EXISTS tenant_isolation_order_item ON "OrderItem";
CREATE POLICY tenant_isolation_order_item ON "OrderItem" USING (wasel_rls_bypass() OR EXISTS (SELECT 1 FROM "Order" o WHERE o.id = "OrderItem"."orderId" AND o."tenantId" = wasel_current_tenant_id())) WITH CHECK (wasel_rls_bypass() OR EXISTS (SELECT 1 FROM "Order" o WHERE o.id = "OrderItem"."orderId" AND o."tenantId" = wasel_current_tenant_id()));
DROP POLICY IF EXISTS tenant_isolation_order_event ON "OrderEvent";
CREATE POLICY tenant_isolation_order_event ON "OrderEvent" USING (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id()) WITH CHECK (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id());
DROP POLICY IF EXISTS tenant_isolation_membership ON "TenantMembership";
CREATE POLICY tenant_isolation_membership ON "TenantMembership" USING (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id()) WITH CHECK (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id());
DROP POLICY IF EXISTS tenant_isolation_api_key ON "ApiKey";
CREATE POLICY tenant_isolation_api_key ON "ApiKey" USING (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id()) WITH CHECK (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id());
DROP POLICY IF EXISTS tenant_isolation_idempotency ON "IdempotencyRecord";
CREATE POLICY tenant_isolation_idempotency ON "IdempotencyRecord" USING (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id()) WITH CHECK (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id());
DROP POLICY IF EXISTS tenant_isolation_webhook ON "WebhookEvent";
CREATE POLICY tenant_isolation_webhook ON "WebhookEvent" USING (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id()) WITH CHECK (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id());
DROP POLICY IF EXISTS tenant_isolation_audit_log ON "AuditLog";
CREATE POLICY tenant_isolation_audit_log ON "AuditLog" USING (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id()) WITH CHECK (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id());
DROP POLICY IF EXISTS tenant_isolation_courier ON "Courier";
CREATE POLICY tenant_isolation_courier ON "Courier" USING (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id()) WITH CHECK (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id());
DROP POLICY IF EXISTS tenant_isolation_shipment ON "Shipment";
CREATE POLICY tenant_isolation_shipment ON "Shipment" USING (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id()) WITH CHECK (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id());
DROP POLICY IF EXISTS tenant_isolation_assignment ON "ShipmentAssignment";
CREATE POLICY tenant_isolation_assignment ON "ShipmentAssignment" USING (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id()) WITH CHECK (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id());
DROP POLICY IF EXISTS tenant_isolation_attempt ON "DeliveryAttempt";
CREATE POLICY tenant_isolation_attempt ON "DeliveryAttempt" USING (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id()) WITH CHECK (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id());
DROP POLICY IF EXISTS tenant_isolation_pod ON "ProofOfDelivery";
CREATE POLICY tenant_isolation_pod ON "ProofOfDelivery" USING (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id()) WITH CHECK (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id());
DROP POLICY IF EXISTS tenant_isolation_cod_collection ON "CodCollection";
CREATE POLICY tenant_isolation_cod_collection ON "CodCollection" USING (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id()) WITH CHECK (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id());
DROP POLICY IF EXISTS tenant_isolation_settlement_batch ON "SettlementBatch";
CREATE POLICY tenant_isolation_settlement_batch ON "SettlementBatch" USING (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id()) WITH CHECK (wasel_rls_bypass() OR "tenantId" = wasel_current_tenant_id());
DROP POLICY IF EXISTS tenant_isolation_settlement_link ON "SettlementBatchCollection";
CREATE POLICY tenant_isolation_settlement_link ON "SettlementBatchCollection" USING (wasel_rls_bypass() OR EXISTS (SELECT 1 FROM "SettlementBatch" b WHERE b.id = "SettlementBatchCollection"."settlementBatchId" AND b."tenantId" = wasel_current_tenant_id())) WITH CHECK (wasel_rls_bypass() OR EXISTS (SELECT 1 FROM "SettlementBatch" b WHERE b.id = "SettlementBatchCollection"."settlementBatchId" AND b."tenantId" = wasel_current_tenant_id()));
