#!/bin/bash
# server/src/scripts/baseline.sh
# Use this script to baseline an existing database that has tables but no migration history (Error P3005).

echo "🚀 Baselining Prisma Migrations..."

MIGRATIONS=(
  "20251016072450_init"
  "20251016194339_phase2_admin_workflow"
  "20251017101355_new_backend"
  "20251021151941_add_password_reset_fields"
  "20251025095344_update_vision_submission"
  "20251025104153_add_pilot_project_model"
  "20251104055943_add_pilot_project_type"
  "20251109172240_add_healing_content_models"
  "20251109191736_add_user_to_healing_submission"
  "20251109193214_add_vision_submission_relation"
  "20251122024857_add_document_model_and_link_to_infrastructure"
  "20251122141015_add_document_type"
  "20251122191931_suggestions"
  "20251127143228_init_generic_invoicing"
  "20251210060819_add_category_back"
  "20251213022647_re_add_document_task_link"
  "20251220080815_add_pilot_engagement"
  "20251220104712_add_comments_to_task_document"
  "20260129190011_sync_missing_tables"
  "20260129202829_add_pilot_project"
  "20260204204333_add_user_client_details"
)

for m in "${MIGRATIONS[@]}"; do
  echo "✅ Marking $m as applied..."
  npx prisma migrate resolve --applied "$m" || echo "⚠️  Failed to resolve $m (might already be resolved or missing)"
done

echo "🎉 Baseline complete. You can now run 'npx prisma migrate deploy' or start the server."
