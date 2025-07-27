import type { Response } from "express";

// Standard API response helpers
export function successResponse<T>(res: Response, data: T, message?: string) {
  return res.json({
    success: true,
    data,
    message: message || "Operation completed successfully"
  });
}

export function errorResponse(res: Response, statusCode: number, message: string, code?: string, details?: any) {
  return res.status(statusCode).json({
    success: false,
    error: message,
    code,
    details
  });
}

export function paginatedResponse<T>(
  res: Response, 
  data: T[], 
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
) {
  return res.json({
    success: true,
    data,
    pagination: {
      currentPage: pagination.page,
      itemsPerPage: pagination.limit,
      totalItems: pagination.total,
      totalPages: pagination.totalPages,
      hasNextPage: pagination.page < pagination.totalPages,
      hasPrevPage: pagination.page > 1
    }
  });
}

// Response compression helper
export function compressedResponse(res: Response, data: any) {
  res.setHeader('Content-Encoding', 'gzip');
  return res.json(data);
}

// Cache headers helper
export function setCacheHeaders(res: Response, maxAge: number = 300) {
  res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
  res.setHeader('ETag', generateETag(JSON.stringify(res.locals.data || {})));
}

function generateETag(data: string): string {
  // Simple ETag generation - in production use a proper hash function
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `"${Math.abs(hash).toString(16)}"`;
}