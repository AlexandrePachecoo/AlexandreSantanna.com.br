#!/usr/bin/env node
// Re-dispara a Edge Function `gerar-arte` para pedidos travados (status pago/processando/erro
// e ainda sem arte_url). Use depois de algum incidente em que o processamento ficou pendurado.
//
// Uso:
//   node scripts/reprocessar-pedidos.js              # dry-run (só lista)
//   node scripts/reprocessar-pedidos.js --confirm    # executa
//
// Lê SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY de env vars ou de um .env na raiz.

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadDotEnv() {
  try {
    const text = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
    for (const line of text.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (!m) continue;
      const [, key, raw] = m;
      if (process.env[key]) continue;
      const val = raw.replace(/^["'](.*)["']$/, '$1');
      process.env[key] = val;
    }
  } catch {
    // .env opcional — segue sem
  }
}

loadDotEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Faltam SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY (env ou .env).');
  process.exit(1);
}

const confirm = process.argv.includes('--confirm');
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  const { data: pedidos, error } = await supabase
    .from('pedidos')
    .select('id, email, nome_mae, status, erro_mensagem, created_at, updated_at')
    .in('status', ['pago', 'processando', 'erro'])
    .is('arte_url', null)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erro ao listar pedidos:', error.message);
    process.exit(1);
  }

  if (!pedidos.length) {
    console.log('Nenhum pedido travado. Tudo certo.');
    return;
  }

  console.log(`Pedidos travados (${pedidos.length}):\n`);
  for (const p of pedidos) {
    const erro = p.erro_mensagem ? `  [erro: ${p.erro_mensagem.slice(0, 80)}]` : '';
    console.log(`  ${p.id}  ${p.status.padEnd(12)}  ${p.email}  (${p.nome_mae})${erro}`);
  }

  if (!confirm) {
    console.log('\nDry-run. Rode novamente com --confirm para reprocessar todos.');
    return;
  }

  console.log('\nDisparando reprocessamento sequencial. Cada pedido pode levar ate ~2min.\n');

  let ok = 0;
  let fail = 0;
  for (const p of pedidos) {
    process.stdout.write(`-> ${p.id} ... `);
    const t0 = Date.now();
    try {
      const r = await fetch(`${SUPABASE_URL}/functions/v1/gerar-arte`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({ pedidoId: p.id }),
      });
      const text = await r.text();
      const ms = Date.now() - t0;
      if (r.ok) {
        console.log(`OK ${r.status} (${ms}ms)`);
        ok++;
      } else {
        console.log(`FALHOU ${r.status} (${ms}ms): ${text.slice(0, 200)}`);
        fail++;
      }
    } catch (err) {
      console.log(`ERRO de rede: ${err.message}`);
      fail++;
    }
  }

  console.log(`\nResumo: ${ok} ok, ${fail} falha — total ${pedidos.length}.`);
  process.exit(fail > 0 ? 2 : 0);
}

main().catch((err) => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
