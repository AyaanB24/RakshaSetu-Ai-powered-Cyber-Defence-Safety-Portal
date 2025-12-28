-- Allow users to insert analysis results for their own cases
CREATE POLICY "Users can insert analysis of their own cases" ON analysis_results
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM cases WHERE cases.id = analysis_results.case_id AND cases.profile_id = auth.uid())
    );

-- Allow users to insert evidence for their own cases
CREATE POLICY "Users can insert evidence for their own cases" ON evidence
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM cases WHERE cases.id = evidence.case_id AND cases.profile_id = auth.uid())
    );
