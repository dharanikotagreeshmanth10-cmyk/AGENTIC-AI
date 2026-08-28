import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the CSV file from the root data directory
    const filePath = path.join(process.cwd(), 'data', 'water.csv');
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Parse CSV simple parser
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',');
    
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      return headers.reduce((obj: any, header, index) => {
        const val = values[index];
        // Convert to number if possible
        obj[header.trim()] = isNaN(Number(val)) ? val : Number(val);
        return obj;
      }, {});
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error reading water data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load water data' },
      { status: 500 }
    );
  }
}
