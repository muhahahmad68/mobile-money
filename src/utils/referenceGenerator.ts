import { pool } from '../config/database';

/**
 * Generates a unique human-readable reference number for transactions.
 * Format: TXN-YYYYMMDD-XXXXX
 * 
 * Example: TXN-20260322-00001
 * 
 * The reference number includes:
 * - Prefix: TXN (Transaction)
 * - Date: YYYYMMDD format for easy sorting and identification
 * - Sequence: 5-digit zero-padded sequential number per day
 * 
 * @returns A unique reference number string
 */
export async function generateReferenceNumber(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  const prefix = `TXN-${dateStr}-`;
  
  // Get the highest sequence number for today
  const result = await pool.query(
    `SELECT reference_number FROM transactions 
     WHERE reference_number LIKE $1 
     ORDER BY reference_number DESC 
     LIMIT 1`,
    [`${prefix}%`]
  );
  
  let sequence = 1;
  if (result.rows.length > 0) {
    const lastRef = result.rows[0].reference_number;
    const lastSequence = parseInt(lastRef.split('-')[2], 10);
    sequence = lastSequence + 1;
  }
  
  const sequenceStr = String(sequence).padStart(5, '0');
  return `${prefix}${sequenceStr}`;
}

/**
 * Validates a reference number format.
 * 
 * @param referenceNumber - The reference number to validate
 * @returns true if valid, false otherwise
 */
export function isValidReferenceNumber(referenceNumber: string): boolean {
  const pattern = /^TXN-\d{8}-\d{5}$/;
  return pattern.test(referenceNumber);
}
