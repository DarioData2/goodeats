const checks = [
  ['EXPO_PUBLIC_SUPABASE_URL', value => {
    try { return new URL(value).protocol === 'https:'; } catch { return false; }
  }],
  ['EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY', value => value.startsWith('sb_publishable_')],
];

const invalid = checks.filter(([name, valid]) => !process.env[name] || !valid(process.env[name]));
if (invalid.length) {
  for (const [name] of invalid) console.error(`Configura ${name} en las variables de compilación de Cloudflare Pages.`);
  process.exitCode = 1;
} else {
  console.log('Configuración pública de Supabase validada.');
}
