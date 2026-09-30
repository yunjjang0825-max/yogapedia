insert into public.organizations (id, name, slug, city, address) values
  ('10000000-0000-4000-8000-000000000001', 'Yogapedia Busan Pilot', 'yogapedia-busan-pilot', 'Busan', 'Pilot location to be confirmed');

insert into public.class_boxes (id, name, slug, summary) values
  ('20000000-0000-4000-8000-000000000001', 'Busan 4060 Movement Recovery ClassBox', 'busan-4060-movement-recovery', 'A four-week wellness program supporting comfortable movement and continued practice.');

insert into public.class_box_versions (
  id, class_box_id, version, status, curriculum, measurement_definition, safety_rules
) values (
  '30000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  '1.0.0',
  'draft',
  '[
    {"session":1,"week":1,"title":"Breath and comfortable range"},
    {"session":2,"week":1,"title":"Shoulder and upper back mobility"},
    {"session":3,"week":2,"title":"Hip mobility and balance"},
    {"session":4,"week":2,"title":"Knee-friendly lower body movement"},
    {"session":5,"week":3,"title":"Core stability for daily movement"},
    {"session":6,"week":3,"title":"Whole-body coordination"},
    {"session":7,"week":4,"title":"Personal practice routine"},
    {"session":8,"week":4,"title":"Review and continued practice"}
  ]'::jsonb,
  '{"pre_post":["discomfort","daily_function","confidence"],"weekly":["attendance","home_practice"]}'::jsonb,
  '{"scope":"wellness_not_medical","red_flags":"pause_and_refer_for_human_review","alternatives_required":true}'::jsonb
);

insert into public.programs (
  id, organization_id, class_box_version_id, title, slug, description, location,
  starts_on, ends_on, capacity, status
) values (
  '40000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000001',
  'Busan 4060 Movement Recovery Pilot',
  'busan-4060-movement-recovery-pilot',
  'Four weeks and eight sessions for adults seeking a sustainable movement routine.',
  'Busan pilot venue to be confirmed',
  '2026-11-02', '2026-11-27', 20, 'draft'
);

insert into public.sessions (program_id, sequence, title, lesson_reference, starts_at, ends_at)
select
  '40000000-0000-4000-8000-000000000001',
  item.sequence,
  item.title,
  'classbox-1.0.0/session-' || item.sequence,
  ('2026-11-02 10:00:00+09'::timestamptz + ((item.sequence - 1) * interval '3 days 12 hours')),
  ('2026-11-02 11:00:00+09'::timestamptz + ((item.sequence - 1) * interval '3 days 12 hours'))
from (values
  (1, 'Breath and comfortable range'),
  (2, 'Shoulder and upper back mobility'),
  (3, 'Hip mobility and balance'),
  (4, 'Knee-friendly lower body movement'),
  (5, 'Core stability for daily movement'),
  (6, 'Whole-body coordination'),
  (7, 'Personal practice routine'),
  (8, 'Review and continued practice')
) as item(sequence, title);
