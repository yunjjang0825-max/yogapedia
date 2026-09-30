begin;
select plan(9);

select has_table('public', 'profiles', 'profiles exists');
select has_table('public', 'class_boxes', 'class_boxes exists');
select has_table('public', 'programs', 'programs exists');
select has_table('public', 'enrollments', 'enrollments exists');
select has_view('public', 'public_programs', 'restricted public program view exists');
select policies_are(
  'public',
  'profiles',
  array['profiles_insert_self', 'profiles_select_self', 'profiles_update_self'],
  'profiles expose only deliberate policies'
);
select policies_are(
  'public',
  'enrollments',
  array['enrollments_select_scoped', 'enrollments_insert_self', 'enrollments_update_scoped'],
  'enrollment access is scoped by role and organization'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.assessments'::regclass),
  true,
  'assessments enable row level security'
);
select is(
  (select count(*)::integer from public.public_programs),
  0,
  'unpublished seed programs stay outside the public view'
);

select * from finish();
rollback;
