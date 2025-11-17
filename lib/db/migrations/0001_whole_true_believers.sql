DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invitations') THEN
    ALTER TABLE "invitations" DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_members') THEN
    ALTER TABLE "team_members" DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teams') THEN
    ALTER TABLE "teams" DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;--> statement-breakpoint
DROP TABLE IF EXISTS "invitations" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "team_members" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "teams" CASCADE;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'activity_logs_team_id_teams_id_fk'
  ) THEN
    ALTER TABLE "activity_logs" DROP CONSTRAINT "activity_logs_team_id_teams_id_fk";
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activity_logs' AND column_name = 'user_id' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE "activity_logs" ALTER COLUMN "user_id" SET NOT NULL;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activity_logs' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE "activity_logs" DROP COLUMN "team_id";
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE "users" DROP COLUMN "role";
  END IF;
END $$;