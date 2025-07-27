// Production Log Cleanup
// Removes unnecessary debug logs for better performance

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DEBUG_PATTERNS = [
  /console\.log\([^)]*DEBUG[^)]*\)/g,
  /console\.log\([^)]*\[.*DEBUG.*\][^)]*\)/g,
  /console\.info\([^)]*DEBUG[^)]*\)/g,
  /console\.warn\([^)]*DEBUG[^)]*\)/g,
];

const PRODUCTION_LOG_PATTERNS = [
  /console\.log\([^)]*`Added.*`[^)]*\)/g,
  /console\.log\([^)]*`✅.*`[^)]*\)/g,
  /console\.log\([^)]*`Found.*`[^)]*\)/g,
  /console\.error\([^)]*`Equipment not found.*`[^)]*\)/g,
];

export function cleanupDebugLogs(directory: string) {
  const files = readdirSync(directory, { recursive: true });
  let totalCleaned = 0;
  
  files.forEach((file) => {
    if (file.toString().endsWith('.ts') && !file.toString().includes('node_modules')) {
      const filePath = join(directory, file.toString());
      const content = readFileSync(filePath, 'utf8');
      let cleanedContent = content;
      
      // Remove debug patterns
      [...DEBUG_PATTERNS, ...PRODUCTION_LOG_PATTERNS].forEach(pattern => {
        const matches = cleanedContent.match(pattern);
        if (matches) {
          totalCleaned += matches.length;
          cleanedContent = cleanedContent.replace(pattern, '// Debug log removed for production');
        }
      });
      
      if (cleanedContent !== content) {
        writeFileSync(filePath, cleanedContent);
      }
    }
  });
  
  return totalCleaned;
}

// Performance monitoring constants
export const PERFORMANCE_METRICS = {
  MAX_RESPONSE_TIME: 1000, // 1 second
  MAX_DB_QUERY_TIME: 500,  // 500ms
  MAX_MEMORY_USAGE: 512 * 1024 * 1024, // 512MB
  
  // Warning thresholds
  WARN_RESPONSE_TIME: 500,
  WARN_DB_QUERY_TIME: 200,
  WARN_MEMORY_USAGE: 256 * 1024 * 1024,
  
  // Cache efficiency targets
  MIN_CACHE_HIT_RATE: 80, // 80%
  MAX_CACHE_SIZE: 100 * 1024 * 1024, // 100MB
};