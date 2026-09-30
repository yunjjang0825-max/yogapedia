create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create function public.is_organization_manager(target_organization_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = target_organization_id
      and profile_id = auth.uid()
      and role = 'organization_manager'
  );
$$;

create function public.is_program_instructor(target_program_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.program_instructors
    where program_id = target_program_id and instructor_id = auth.uid()
  );
$$;

create function public.can_manage_program(target_program_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select public.is_admin() or exists (
    select 1 from public.programs p
    where p.id = target_program_id and public.is_organization_manager(p.organization_id)
  );
$$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.class_boxes enable row level security;
alter table public.class_box_versions enable row level security;
alter table public.programs enable row level security;
alter table public.program_instructors enable row level security;
alter table public.sessions enable row level security;
alter table public.enrollments enable row level security;
alter table public.consents enable row level security;
alter table public.assessments enable row level security;
alter table public.attendance enable row level security;
alter table public.session_notes enable row level security;
alter table public.practice_logs enable row level security;
alter table public.recommendations enable row level security;
alter table public.reports enable row level security;
alter table public.audit_events enable row level security;

create policy profiles_select_self on public.profiles for select using (
  id = auth.uid() or public.is_admin() or exists (
    select 1 from public.enrollments e
    where e.participant_id = profiles.id
      and (public.is_program_instructor(e.program_id) or public.can_manage_program(e.program_id))
  )
);
create policy profiles_update_self on public.profiles for update using (
  id = auth.uid() or public.is_admin()
) with check (id = auth.uid() or public.is_admin());

create policy organizations_select_member on public.organizations for select using (
  public.is_admin() or public.is_organization_manager(id) or exists (
    select 1 from public.organization_members where organization_id = organizations.id and profile_id = auth.uid()
  )
);
create policy organizations_admin_all on public.organizations for all using (public.is_admin()) with check (public.is_admin());

create policy organization_members_select_scoped on public.organization_members for select using (
  profile_id = auth.uid() or public.is_organization_manager(organization_id) or public.is_admin()
);
create policy organization_members_manage_scoped on public.organization_members for all using (
  public.is_organization_manager(organization_id) or public.is_admin()
) with check (public.is_organization_manager(organization_id) or public.is_admin());

create policy class_boxes_admin_all on public.class_boxes for all using (public.is_admin()) with check (public.is_admin());
create policy class_box_versions_admin_all on public.class_box_versions for all using (public.is_admin()) with check (public.is_admin());
create policy class_box_versions_staff_read on public.class_box_versions for select using (
  public.is_admin() or exists (
    select 1 from public.programs p where p.class_box_version_id = class_box_versions.id
      and (public.is_program_instructor(p.id) or public.is_organization_manager(p.organization_id))
  )
);

create policy programs_select_scoped on public.programs for select using (
  public.is_admin() or public.is_organization_manager(organization_id) or public.is_program_instructor(id)
  or exists (select 1 from public.enrollments e where e.program_id = programs.id and e.participant_id = auth.uid())
);
create policy programs_manage_scoped on public.programs for all using (
  public.is_admin() or public.is_organization_manager(organization_id)
) with check (public.is_admin() or public.is_organization_manager(organization_id));

create policy program_instructors_select_scoped on public.program_instructors for select using (
  instructor_id = auth.uid() or public.can_manage_program(program_id)
);
create policy program_instructors_manage_scoped on public.program_instructors for all using (public.can_manage_program(program_id)) with check (public.can_manage_program(program_id));

create policy sessions_select_scoped on public.sessions for select using (
  public.can_manage_program(program_id) or public.is_program_instructor(program_id)
  or exists (select 1 from public.enrollments e where e.program_id = sessions.program_id and e.participant_id = auth.uid())
);
create policy sessions_manage_scoped on public.sessions for all using (public.can_manage_program(program_id)) with check (public.can_manage_program(program_id));

create policy enrollments_select_scoped on public.enrollments for select using (
  participant_id = auth.uid() or public.is_program_instructor(program_id) or public.can_manage_program(program_id)
);
create policy enrollments_insert_self on public.enrollments for insert with check (participant_id = auth.uid());
create policy enrollments_update_scoped on public.enrollments for update using (
  public.can_manage_program(program_id)
) with check (public.can_manage_program(program_id));

create policy consents_participant_all on public.consents for all using (
  exists (select 1 from public.enrollments e where e.id = consents.enrollment_id and e.participant_id = auth.uid())
) with check (exists (select 1 from public.enrollments e where e.id = consents.enrollment_id and e.participant_id = auth.uid()));
create policy consents_manager_read on public.consents for select using (
  exists (select 1 from public.enrollments e where e.id = consents.enrollment_id and public.can_manage_program(e.program_id))
);

create policy assessments_participant_all on public.assessments for all using (
  exists (select 1 from public.enrollments e where e.id = assessments.enrollment_id and e.participant_id = auth.uid())
) with check (exists (select 1 from public.enrollments e where e.id = assessments.enrollment_id and e.participant_id = auth.uid()));
create policy assessments_manager_read on public.assessments for select using (
  exists (select 1 from public.enrollments e where e.id = assessments.enrollment_id and public.can_manage_program(e.program_id))
);

create policy attendance_select_scoped on public.attendance for select using (
  exists (select 1 from public.enrollments e where e.id = attendance.enrollment_id and (e.participant_id = auth.uid() or public.is_program_instructor(e.program_id) or public.can_manage_program(e.program_id)))
);
create policy attendance_instructor_manage on public.attendance for all using (
  exists (select 1 from public.enrollments e where e.id = attendance.enrollment_id and (public.is_program_instructor(e.program_id) or public.can_manage_program(e.program_id)))
) with check (exists (select 1 from public.enrollments e where e.id = attendance.enrollment_id and (public.is_program_instructor(e.program_id) or public.can_manage_program(e.program_id))));

create policy session_notes_staff_all on public.session_notes for all using (
  exists (select 1 from public.sessions s where s.id = session_notes.session_id and (public.is_program_instructor(s.program_id) or public.can_manage_program(s.program_id)))
) with check (exists (select 1 from public.sessions s where s.id = session_notes.session_id and (public.is_program_instructor(s.program_id) or public.can_manage_program(s.program_id))));

create policy practice_logs_participant_all on public.practice_logs for all using (
  exists (select 1 from public.enrollments e where e.id = practice_logs.enrollment_id and e.participant_id = auth.uid())
) with check (exists (select 1 from public.enrollments e where e.id = practice_logs.enrollment_id and e.participant_id = auth.uid()));
create policy practice_logs_staff_read on public.practice_logs for select using (
  exists (select 1 from public.enrollments e where e.id = practice_logs.enrollment_id and (public.is_program_instructor(e.program_id) or public.can_manage_program(e.program_id)))
);

create policy recommendations_participant_read on public.recommendations for select using (
  exists (select 1 from public.enrollments e where e.id = recommendations.enrollment_id and e.participant_id = auth.uid())
);
create policy recommendations_manager_all on public.recommendations for all using (
  exists (select 1 from public.enrollments e where e.id = recommendations.enrollment_id and public.can_manage_program(e.program_id))
) with check (exists (select 1 from public.enrollments e where e.id = recommendations.enrollment_id and public.can_manage_program(e.program_id)));

create policy reports_select_scoped on public.reports for select using (
  public.can_manage_program(program_id) or exists (
    select 1 from public.enrollments e where e.id = reports.enrollment_id and e.participant_id = auth.uid()
  )
);
create policy reports_manager_all on public.reports for all using (public.can_manage_program(program_id)) with check (public.can_manage_program(program_id));
create policy audit_events_admin_read on public.audit_events for select using (public.is_admin());
create policy audit_events_authenticated_insert on public.audit_events for insert to authenticated with check (actor_id = auth.uid());

create view public.public_programs with (security_invoker = true) as
select p.id, p.title, p.slug, p.description, p.location, p.starts_on, p.ends_on, p.capacity,
       o.name as organization_name, cb.name as class_box_name
from public.programs p
join public.organizations o on o.id = p.organization_id
join public.class_box_versions cbv on cbv.id = p.class_box_version_id
join public.class_boxes cb on cb.id = cbv.class_box_id
where p.status = 'published';

grant select on public.public_programs to anon, authenticated;
grant select on public.programs, public.organizations, public.class_box_versions, public.class_boxes to anon;

create policy programs_public_published on public.programs for select to anon using (status = 'published');
create policy organizations_public_program on public.organizations for select to anon using (
  exists (select 1 from public.programs p where p.organization_id = organizations.id and p.status = 'published')
);
create policy class_box_versions_public_program on public.class_box_versions for select to anon using (
  exists (select 1 from public.programs p where p.class_box_version_id = class_box_versions.id and p.status = 'published')
);
create policy class_boxes_public_program on public.class_boxes for select to anon using (
  exists (select 1 from public.class_box_versions v join public.programs p on p.class_box_version_id = v.id where v.class_box_id = class_boxes.id and p.status = 'published')
);
