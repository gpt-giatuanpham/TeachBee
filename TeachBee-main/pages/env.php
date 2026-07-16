<?php
/**
 * Minimal .env loader — no Composer/vlucas dependency required.
 * Reads KEY=VALUE lines from a .env file into getenv()/$_ENV.
 * Safe to call multiple times; won't override real environment
 * variables that are already set (e.g. by your hosting platform).
 */
function loadEnv(string $path): void
{
    if (!is_file($path)) {
        return; // no .env present — assume real env vars are set instead
    }

    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);

        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }

        if (!str_contains($line, '=')) {
            continue;
        }

        [$key, $value] = explode('=', $line, 2);
        $key   = trim($key);
        $value = trim($value);

        // Strip surrounding quotes if present
        if (strlen($value) >= 2 && (
            ($value[0] === '"' && $value[-1] === '"') ||
            ($value[0] === "'" && $value[-1] === "'")
        )) {
            $value = substr($value, 1, -1);
        }

        // Don't clobber variables the platform already injected
        if (getenv($key) === false) {
            putenv("$key=$value");
            $_ENV[$key] = $value;
        }
    }
}
