-- Create Enums
CREATE TYPE case_type AS ENUM ('ANALYSIS', 'REPORT');
CREATE TYPE case_status AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'ACTION_TAKEN', 'CLOSED');

-- Create Cases Table
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type case_type NOT NULL,
    status case_status NOT NULL DEFAULT 'SUBMITTED',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for cases
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Create Policies for cases (Basic example: Users see their own, Admins see all - requires admin check logic which varies, assuming basic auth.uid() check for now)
CREATE POLICY "Users can view their own cases" ON cases
    FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own cases" ON cases
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Create Analysis Results Table (One-to-One with cases)
CREATE TABLE analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL UNIQUE REFERENCES cases(id) ON DELETE CASCADE,
    ai_threat_type TEXT NOT NULL,
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    summary TEXT,
    mitigation_steps JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for analysis_results
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analysis of their own cases" ON analysis_results
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM cases WHERE cases.id = analysis_results.case_id AND cases.profile_id = auth.uid())
    );

-- Create Evidence Table (One-to-Many with cases)
CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    ipfs_cid TEXT NOT NULL,
    file_type TEXT NOT NULL,
    encryption_flag BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for evidence
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view evidence of their own cases" ON evidence
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM cases WHERE cases.id = evidence.case_id AND cases.profile_id = auth.uid())
    );

-- Create Case Actions Table (Admin-only audit table)
CREATE TABLE case_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    action_by UUID NOT NULL REFERENCES auth.users(id),
    remarks TEXT,
    previous_status case_status,
    new_status case_status,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for case_actions
ALTER TABLE case_actions ENABLE ROW LEVEL SECURITY;

-- Note: Policies for case_actions should be restricted to Admins only.
-- Example (assuming a function or claim checks for admin role):
-- CREATE POLICY "Admins can view all case actions" ON case_actions
--     FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR is_admin());
