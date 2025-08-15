-- Create teams table
CREATE TABLE public.teams (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create team_members table
CREATE TABLE public.team_members (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role_id uuid REFERENCES public.roles(id) ON DELETE SET NULL, -- Optional: specific role within the team
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE (team_id, user_id) -- Ensure a user can only be a member of a team once
);

-- Enable Row Level Security
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Policies for teams table
CREATE POLICY "Authenticated users can view teams." ON public.teams
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Team members can update their team's info." ON public.teams
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = teams.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can delete their team." ON public.teams
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = teams.id AND user_id = auth.uid()
    )
  );

-- Policies for team_members table
CREATE POLICY "Authenticated users can view team members." ON public.team_members
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can add team members." ON public.team_members
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Team members can remove themselves." ON public.team_members
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Team owners/admins can update member roles." ON public.team_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      JOIN public.roles r ON tm.role_id = r.id
      WHERE tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()
        AND r.name IN ('admin', 'team_owner')
    )
  );

-- Optional: Add a function to get team members for a given team
CREATE OR REPLACE FUNCTION public.get_team_members(p_team_id uuid)
RETURNS SETOF public.team_members
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.team_members
  WHERE team_id = p_team_id;
END;
$$;

-- Optional: Add a function to get teams for a given user
CREATE OR REPLACE FUNCTION public.get_user_teams(p_user_id uuid)
RETURNS SETOF public.teams
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT t.* FROM public.teams t
  JOIN public.team_members tm ON t.id = tm.team_id
  WHERE tm.user_id = p_user_id;
END;
$$;

-- Trigger to update 'updated_at' timestamp on team update
CREATE TRIGGER handle_updated_at_teams
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE PROCEDURE moddatetime (updated_at);