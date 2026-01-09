/**
 * Script para testar a conexão com o Supabase
 * Execute: npx tsx test-supabase.ts
 */

import { supabase } from './lib/supabase';

async function testConnection() {
  console.log('🔍 Testando conexão com Supabase...\n');

  try {
    // Test 1: Verificar se consegue conectar
    console.log('1. Testando conexão básica...');
    const { data: testData, error: testError } = await supabase
      .from('jobs')
      .select('count');

    if (testError) {
      console.error('✗ Erro na conexão:', testError.message);
      process.exit(1);
    }

    console.log('✓ Conexão estabelecida com sucesso!\n');

    // Test 2: Listar tabelas
    console.log('2. Verificando tabelas...');
    const tables = ['jobs', 'videos', 'combinations'];
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('count').limit(1);
      
      if (error) {
        console.error(`✗ Tabela "${table}" não encontrada ou erro: ${error.message}`);
      } else {
        console.log(`✓ Tabela "${table}" existe`);
      }
    }

    console.log('\n3. Resumo:');
    const { count: jobsCount } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true });

    const { count: videosCount } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true });

    const { count: combinationsCount } = await supabase
      .from('combinations')
      .select('*', { count: 'exact', head: true });

    console.log(`   - Jobs: ${jobsCount || 0}`);
    console.log(`   - Vídeos: ${videosCount || 0}`);
    console.log(`   - Combinações: ${combinationsCount || 0}`);

    console.log('\n✅ Tudo funcionando! Você pode iniciar o servidor com: npm run dev\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro ao testar Supabase:', error);
    console.log('\n📖 Verifique:');
    console.log('   1. Se as variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão no .env.local');
    console.log('   2. Se as tabelas foram criadas (veja SUPABASE_SETUP.md)');
    console.log('   3. Se o projeto Supabase está ativo\n');
    process.exit(1);
  }
}

testConnection();
