<?php

require_once __DIR__ . '/env.php';

// Load .env if it exists (local development)
loadEnv(__DIR__ . '/.env');

$SUPABASE_URL              = getenv('SUPABASE_URL');
$SUPABASE_ANON_KEY         = getenv('SUPABASE_ANON_KEY');
$SUPABASE_SERVICE_ROLE_KEY = getenv('SUPABASE_SERVICE_ROLE_KEY');

if (!$SUPABASE_URL || !$SUPABASE_ANON_KEY || !$SUPABASE_SERVICE_ROLE_KEY) {
    die('Missing required Supabase environment variables. Check your .env file or host environment variables.');
}
