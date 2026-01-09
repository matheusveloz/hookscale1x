/**
 * Script para inicializar o banco de dados
 * Execute: npx tsx scripts/init-db.ts
 */

import { initializeDatabase } from '../lib/db';

async function main() {
  console.log('Inicializando banco de dados...');
  
  try {
    await initializeDatabase();
    console.log('✓ Banco de dados inicializado com sucesso!');
    console.log('\nTabelas criadas:');
    console.log('  - jobs');
    console.log('  - videos');
    console.log('  - combinations');
    console.log('\nÍndices criados para otimização de queries.');
    process.exit(0);
  } catch (error) {
    console.error('✗ Erro ao inicializar banco de dados:', error);
    process.exit(1);
  }
}

main();
