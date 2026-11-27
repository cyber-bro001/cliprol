-- Required by the request-scoped authenticated client used by backend processing.
-- RLS is already enabled on public.projects and public.clips.
-- Every write below remains restricted to rows owned by auth.uid().

-- Processing updates the lifecycle state and stores the thumbnail path/title.
GRANT UPDATE (status, thumbnail_path, title) ON public.projects TO authenticated;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'projects'
          AND policyname = 'projects_owner_update'
    ) THEN
        CREATE POLICY projects_owner_update
            ON public.projects
            FOR UPDATE
            TO authenticated
            USING (user_id = (SELECT auth.uid()))
            WITH CHECK (user_id = (SELECT auth.uid()));
    END IF;
END
$$;

-- Failed processing cleanup deletes only the authenticated owner's project.
GRANT DELETE ON public.projects TO authenticated;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'projects'
          AND policyname = 'projects_owner_delete'
    ) THEN
        CREATE POLICY projects_owner_delete
            ON public.projects
            FOR DELETE
            TO authenticated
            USING (user_id = (SELECT auth.uid()));
    END IF;
END
$$;

-- Processing can create clip metadata only under a project owned by this user.
GRANT INSERT ON public.clips TO authenticated;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'clips'
          AND policyname = 'clips_owner_create'
    ) THEN
        CREATE POLICY clips_owner_create
            ON public.clips
            FOR INSERT
            TO authenticated
            WITH CHECK (
                EXISTS (
                    SELECT 1
                    FROM public.projects AS p
                    WHERE p.id = clips.project_id
                      AND p.user_id = (SELECT auth.uid())
                )
            );
    END IF;
END
$$;
