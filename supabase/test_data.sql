-- 1. First, get a valid Profile ID from your existing `profiles` table.
-- Run this to see available users:
-- SELECT * FROM profiles LIMIT 1;

-- 2. Replace 'YOUR_PROFILE_ID_HERE' with the UUID you found above.
DO $$
DECLARE
    -- REPLACE THIS UUID WITH A REAL PROFILE ID FROM YOUR DATABASE
    test_profile_id UUID := 'YOUR_PROFILE_ID_HERE'; 
    new_case_id UUID;
BEGIN
    -- Insert a Test Case
    INSERT INTO cases (profile_id, type, status, title, description)
    VALUES (test_profile_id, 'ANALYSIS', 'SUBMITTED', 'Test Cyber Incident', 'Suspicious activity detected on firewall logs.')
    RETURNING id INTO new_case_id;

    RAISE NOTICE 'Created Case ID: %', new_case_id;

    -- Insert Test Analysis Result
    INSERT INTO analysis_results (case_id, ai_threat_type, risk_score, summary, mitigation_steps)
    VALUES (new_case_id, 'DDoS Attempt', 85, 'High volume of traffic from multiple IPs.', '{"step1": "Block IPs", "step2": "Enable Rate Limiting"}'::jsonb);

    -- Insert Test Evidence
    INSERT INTO evidence (case_id, ipfs_cid, file_type, encryption_flag)
    VALUES (new_case_id, 'QmHash123456789', 'text/log', true);

    RAISE NOTICE 'Test data inserted successfully for Case ID: %', new_case_id;
END $$;

-- 3. Verify the data
-- SELECT * FROM cases;
-- SELECT * FROM analysis_results;
-- SELECT * FROM evidence;
