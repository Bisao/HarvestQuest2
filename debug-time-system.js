// Sistema de Debug para Velocidade do Tempo
console.log("🔍 INICIANDO DIAGNÓSTICO COMPLETO DO SISTEMA DE TEMPO...\n");

// 1. Testar velocidade NORMAL (60 min)
console.log("1️⃣ TESTE: Configurando velocidade NORMAL...");
const setNormal = await fetch('http://localhost:5000/api/time/speed/set', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ speed: 'NORMAL' })
});
const normalResult = await setNormal.json();
console.log("✅ NORMAL configurado:", normalResult.speedInfo);

// Capturar hora inicial
console.log("\n📊 MEDINDO VELOCIDADE NORMAL (60 min = 24h)...");
const time1 = await fetch('http://localhost:5000/api/time/current').then(r => r.json());
console.log("Hora inicial:", `${time1.hour}:${time1.minute.toString().padStart(2, '0')}`);

// Aguardar 5 segundos
console.log("⏳ Aguardando 5 segundos...");
await new Promise(resolve => setTimeout(resolve, 5000));

const time2 = await fetch('http://localhost:5000/api/time/current').then(r => r.json());
console.log("Hora após 5s:", `${time2.hour}:${time2.minute.toString().padStart(2, '0')}`);

// Calcular diferença
const diffMinutes1 = (time2.minute - time1.minute + (time2.hour - time1.hour) * 60);
console.log(`📈 Diferença: ${diffMinutes1} minutos em 5 segundos reais`);
console.log(`🎯 Esperado NORMAL: ~2 minutos de jogo (5s * 24h/60min/60s = 2min)`);

console.log("\n" + "=".repeat(50));

// 2. Testar velocidade FAST (45 min)
console.log("2️⃣ TESTE: Configurando velocidade FAST...");
const setFast = await fetch('http://localhost:5000/api/time/speed/set', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ speed: 'FAST' })
});
const fastResult = await setFast.json();
console.log("✅ FAST configurado:", fastResult.speedInfo);

console.log("\n📊 MEDINDO VELOCIDADE FAST (45 min = 24h)...");
const time3 = await fetch('http://localhost:5000/api/time/current').then(r => r.json());
console.log("Hora inicial:", `${time3.hour}:${time3.minute.toString().padStart(2, '0')}`);

// Aguardar 5 segundos
console.log("⏳ Aguardando 5 segundos...");
await new Promise(resolve => setTimeout(resolve, 5000));

const time4 = await fetch('http://localhost:5000/api/time/current').then(r => r.json());
console.log("Hora após 5s:", `${time4.hour}:${time4.minute.toString().padStart(2, '0')}`);

const diffMinutes2 = (time4.minute - time3.minute + (time4.hour - time3.hour) * 60);
console.log(`📈 Diferença: ${diffMinutes2} minutos em 5 segundos reais`);
console.log(`🎯 Esperado FAST: ~2.67 minutos de jogo (5s * 24h/45min/60s = 2.67min)`);

console.log("\n" + "=".repeat(50));

// 3. Testar velocidade VERY_SLOW (120 min)
console.log("3️⃣ TESTE: Configurando velocidade VERY_SLOW...");
const setSlow = await fetch('http://localhost:5000/api/time/speed/set', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ speed: 'VERY_SLOW' })
});
const slowResult = await setSlow.json();
console.log("✅ VERY_SLOW configurado:", slowResult.speedInfo);

console.log("\n📊 MEDINDO VELOCIDADE VERY_SLOW (120 min = 24h)...");
const time5 = await fetch('http://localhost:5000/api/time/current').then(r => r.json());
console.log("Hora inicial:", `${time5.hour}:${time5.minute.toString().padStart(2, '0')}`);

// Aguardar 5 segundos
console.log("⏳ Aguardando 5 segundos...");
await new Promise(resolve => setTimeout(resolve, 5000));

const time6 = await fetch('http://localhost:5000/api/time/current').then(r => r.json());
console.log("Hora após 5s:", `${time6.hour}:${time6.minute.toString().padStart(2, '0')}`);

const diffMinutes3 = (time6.minute - time5.minute + (time6.hour - time5.hour) * 60);
console.log(`📈 Diferença: ${diffMinutes3} minutos em 5 segundos reais`);
console.log(`🎯 Esperado VERY_SLOW: ~1 minuto de jogo (5s * 24h/120min/60s = 1min)`);

console.log("\n" + "=".repeat(50));
console.log("🎯 RESUMO DOS TESTES:");
console.log(`NORMAL (60min): ${diffMinutes1}min em 5s (esperado: ~2min)`);
console.log(`FAST (45min): ${diffMinutes2}min em 5s (esperado: ~2.67min)`);
console.log(`VERY_SLOW (120min): ${diffMinutes3}min em 5s (esperado: ~1min)`);

if (diffMinutes1 === diffMinutes2 && diffMinutes2 === diffMinutes3) {
  console.log("❌ PROBLEMA IDENTIFICADO: Todas as velocidades têm o mesmo resultado!");
  console.log("🔧 A mudança de velocidade não está sendo aplicada corretamente.");
} else {
  console.log("✅ VELOCIDADES FUNCIONANDO: Cada velocidade produz resultados diferentes.");
}