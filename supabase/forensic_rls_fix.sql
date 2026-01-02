-- FIX RLS POLICIES FOR CERT ADMIN
-- This script ensures the cert.admin@gov.in user can view all forensic evidence

-- 1. Enable read access for Admin on 'cases'
DROP POLICY IF EXISTS "Admins can view all cases" ON cases;
CREATE POLICY "Admins can view all cases" ON cases
    FOR SELECT USING (
        auth.jwt() ->> 'email' = 'cert.admin@gov.in'
        OR auth.uid() = profile_id
    );

-- 2. Enable read access for Admin on 'evidence'
DROP POLICY IF EXISTS "Admins can view all evidence" ON evidence;
CREATE POLICY "Admins can view all evidence" ON evidence
    FOR SELECT USING (
        auth.jwt() ->> 'email' = 'cert.admin@gov.in'
        OR EXISTS (SELECT 1 FROM cases WHERE cases.id = evidence.case_id AND cases.profile_id = auth.uid())
    );

-- 3. Enable read access for Admin on 'analysis_results'
DROP POLICY IF EXISTS "Admins can view all analysis" ON analysis_results;
CREATE POLICY "Admins can view all analysis" ON analysis_results
    FOR SELECT USING (
        auth.jwt() ->> 'email' = 'cert.admin@gov.in'
        OR EXISTS (SELECT 1 FROM cases WHERE cases.id = analysis_results.case_id AND cases.profile_id = auth.uid())
    );

-- 4. Enable update access for Admin on 'cases' (to change status)
DROP POLICY IF EXISTS "Admins can update all cases" ON cases;
CREATE POLICY "Admins can update all cases" ON cases
    FOR UPDATE USING (
        auth.jwt() ->> 'email' = 'cert.admin@gov.in'
    );
