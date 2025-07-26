import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendorId, pricingData } = body;

    if (!vendorId || !pricingData) {
      return NextResponse.json(
        { error: 'Vendor ID and pricing data are required' },
        { status: 400 }
      );
    }

    // Check if pricing_data table exists, if not create it
    try {
      await prisma.$queryRaw`SELECT 1 FROM pricing_data LIMIT 1`;
    } catch (error) {
      console.log('pricing_data table not found, attempting to create it');
      try {
        // Create the pricing_data table
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS pricing_data (
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
            "basePrice" DECIMAL(65,30),
            "laborHours" INTEGER,
            "laborRate" DECIMAL(65,30),
            "materialCost" DECIMAL(65,30),
            "indirectRate" DECIMAL(65,30),
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "clinId" TEXT NOT NULL,
            "vendorId" TEXT NOT NULL,
            UNIQUE("clinId", "vendorId")
          )
        `;
        
        // Add foreign key constraints if they don't exist
        await prisma.$executeRaw`
          ALTER TABLE pricing_data 
          ADD CONSTRAINT IF NOT EXISTS pricing_data_clinId_fkey 
          FOREIGN KEY ("clinId") REFERENCES clins(id) ON DELETE CASCADE ON UPDATE CASCADE
        `;
        
        await prisma.$executeRaw`
          ALTER TABLE pricing_data 
          ADD CONSTRAINT IF NOT EXISTS pricing_data_vendorId_fkey 
          FOREIGN KEY ("vendorId") REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
        `;
        
        console.log('pricing_data table created successfully');
      } catch (createError) {
        console.error('Failed to create pricing_data table:', createError);
        return NextResponse.json(
          { error: 'Database setup failed. Please contact administrator.' },
          { status: 500 }
        );
      }
    }

    // Save or update pricing data for each CLIN
    const savedPricingData = [];
    
    for (const [clinId, data] of Object.entries(pricingData)) {
      const pricingEntry = data as any;
      
      const saved = await (prisma as any).pricingData.upsert({
        where: {
          clinId_vendorId: {
            clinId,
            vendorId
          }
        },
        update: {
          basePrice: pricingEntry.basePrice ? parseFloat(pricingEntry.basePrice) : null,
          laborHours: pricingEntry.laborHours ? parseInt(pricingEntry.laborHours) : null,
          laborRate: pricingEntry.laborRate ? parseFloat(pricingEntry.laborRate) : null,
          materialCost: pricingEntry.materialCost ? parseFloat(pricingEntry.materialCost) : null,
          indirectRate: pricingEntry.indirectRate ? parseFloat(pricingEntry.indirectRate) : null,
        },
        create: {
          clinId,
          vendorId,
          basePrice: pricingEntry.basePrice ? parseFloat(pricingEntry.basePrice) : null,
          laborHours: pricingEntry.laborHours ? parseInt(pricingEntry.laborHours) : null,
          laborRate: pricingEntry.laborRate ? parseFloat(pricingEntry.laborRate) : null,
          materialCost: pricingEntry.materialCost ? parseFloat(pricingEntry.materialCost) : null,
          indirectRate: pricingEntry.indirectRate ? parseFloat(pricingEntry.indirectRate) : null,
        }
      });
      
      savedPricingData.push(saved);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Pricing data saved successfully',
      data: savedPricingData 
    });

  } catch (error) {
    console.error('Error saving pricing data:', error);
    return NextResponse.json(
      { error: 'Failed to save pricing data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const solicitationId = searchParams.get('solicitationId');

    if (!vendorId || !solicitationId) {
      return NextResponse.json(
        { error: 'Vendor ID and solicitation ID are required' },
        { status: 400 }
      );
    }

    // Check if pricing_data table exists
    try {
      await prisma.$queryRaw`SELECT 1 FROM pricing_data LIMIT 1`;
    } catch (error) {
      // Table doesn't exist, return empty data
      return NextResponse.json({ 
        success: true, 
        data: {} 
      });
    }

    // Get pricing data for all CLINs in the solicitation for this vendor
    const pricingData = await (prisma as any).pricingData.findMany({
      where: {
        vendorId,
        clin: {
          solicitationId
        }
      },
      include: {
        clin: true
      }
    });

    // Transform to the format expected by the frontend
    const formattedData: any = {};
    pricingData.forEach((data: any) => {
      formattedData[data.clinId] = {
        basePrice: data.basePrice?.toString() || '',
        laborHours: data.laborHours?.toString() || '',
        laborRate: data.laborRate?.toString() || '',
        materialCost: data.materialCost?.toString() || '',
        indirectRate: data.indirectRate?.toString() || '',
      };
    });

    return NextResponse.json({ 
      success: true, 
      data: formattedData 
    });

  } catch (error) {
    console.error('Error fetching pricing data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing data' },
      { status: 500 }
    );
  }
}