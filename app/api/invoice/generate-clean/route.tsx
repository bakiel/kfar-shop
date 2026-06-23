import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet,
  Image,
  renderToBuffer 
} from '@react-pdf/renderer';
import QRCode from 'qrcode';

// Clean color palette
const colors = {
  primary: '#478c0b',    // KFAR green
  secondary: '#f6af0d',   // KFAR gold
  dark: '#333333',
  gray: '#666666',
  lightGray: '#f0f0f0',
  white: '#ffffff',
  border: '#dddddd'
};

// Create clean styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: colors.dark
  },
  
  // Header styles
  header: {
    marginBottom: 30
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  companySection: {
    flex: 1
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4
  },
  companyTagline: {
    fontSize: 10,
    color: colors.gray
  },
  invoiceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 4
  },
  invoiceNumber: {
    fontSize: 9,
    color: colors.gray,
    textAlign: 'right'
  },
  
  // Info section
  infoSection: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 30
  },
  infoBox: {
    flex: 1
  },
  infoTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  infoText: {
    fontSize: 10,
    marginBottom: 2,
    color: colors.dark
  },
  
  // Table styles
  table: {
    marginBottom: 20
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    padding: 8
  },
  tableHeaderText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: 8
  },
  tableRowAlt: {
    backgroundColor: colors.lightGray
  },
  
  // Table columns
  colDescription: {
    flex: 4
  },
  colQty: {
    flex: 1,
    textAlign: 'center'
  },
  colPrice: {
    flex: 1.5,
    textAlign: 'right'
  },
  colTotal: {
    flex: 1.5,
    textAlign: 'right'
  },
  
  // Summary section
  summarySection: {
    marginTop: 20
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 5
  },
  summaryLabel: {
    width: 100,
    textAlign: 'right',
    marginRight: 20,
    fontSize: 10,
    color: colors.gray
  },
  summaryValue: {
    width: 80,
    textAlign: 'right',
    fontSize: 10
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: colors.primary
  },
  totalLabel: {
    width: 100,
    textAlign: 'right',
    marginRight: 20,
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary
  },
  totalValue: {
    width: 80,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary
  },
  
  // Footer with QR
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  qrSection: {
    alignItems: 'center'
  },
  qrCode: {
    width: 60,
    height: 60,
    marginBottom: 4
  },
  qrText: {
    fontSize: 8,
    color: colors.gray
  },
  footerText: {
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 20
  },
  thankYou: {
    fontSize: 11,
    color: colors.primary,
    marginBottom: 4
  },
  footerContact: {
    fontSize: 8,
    color: colors.gray
  }
});

// Clean Invoice Component
const CleanInvoice = ({ data, invoiceNumber, qrCodeUrl }: any) => {
  // Calculate totals
  const subtotal = data.items.reduce((sum: number, item: any) => 
    sum + (item.price * item.quantity), 0
  );
  const vat = subtotal * 0.17;
  const deliveryFee = data.deliveryFee || 0;
  const total = subtotal + vat + deliveryFee;
  
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.companySection}>
              <Text style={styles.companyName}>KFAR MARKETPLACE</Text>
              <Text style={styles.companyTagline}>The Whole Village, In Your Hand</Text>
            </View>
            <View>
              <Text style={styles.invoiceTitle}>INVOICE</Text>
              <Text style={styles.invoiceNumber}>#{invoiceNumber}</Text>
            </View>
          </View>
        </View>
        
        {/* Customer and Invoice Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Bill To</Text>
            <Text style={styles.infoText}>{data.customer.name}</Text>
            <Text style={styles.infoText}>{data.customer.email}</Text>
            <Text style={styles.infoText}>{data.customer.phone}</Text>
            {data.customer.address && (
              <Text style={styles.infoText}>{data.customer.address}</Text>
            )}
          </View>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Invoice Details</Text>
            <Text style={styles.infoText}>Date: {date}</Text>
            <Text style={styles.infoText}>Payment: {data.paymentMethod}</Text>
            <Text style={styles.infoText}>Delivery: {data.deliveryMethod}</Text>
          </View>
        </View>
        
        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>Price</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
          </View>
          
          {/* Table Rows */}
          {data.items.map((item: any, index: number) => (
            <View 
              key={index} 
              style={[
                styles.tableRow,
                ...(index % 2 === 1 ? [styles.tableRowAlt] : [])
              ]}
            >
              <Text style={styles.colDescription}>
                {item.name}
                {item.vendorName && (
                  <Text style={{ fontSize: 8, color: colors.gray }}>
                    {'\n'}by {item.vendorName}
                  </Text>
                )}
              </Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>₪{item.price.toFixed(2)}</Text>
              <Text style={styles.colTotal}>₪{(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>
        
        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>₪{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>VAT (17%):</Text>
            <Text style={styles.summaryValue}>₪{vat.toFixed(2)}</Text>
          </View>
          {deliveryFee > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery:</Text>
              <Text style={styles.summaryValue}>₪{deliveryFee.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Due:</Text>
            <Text style={styles.totalValue}>₪{total.toFixed(2)}</Text>
          </View>
        </View>
        
        {/* Footer with QR Code */}
        <View style={styles.footer}>
          <View style={styles.qrSection}>
            {qrCodeUrl && (
              <>
                <Image style={styles.qrCode} src={qrCodeUrl} />
                <Text style={styles.qrText}>Scan to pay</Text>
              </>
            )}
          </View>
          
          <View style={styles.footerText}>
            <Text style={styles.thankYou}>Thank you for your business!</Text>
            <Text style={styles.footerContact}>
              support@kfar.market | 052-KFAR-MKT
            </Text>
          </View>
          
          <View style={{ width: 60 }} />
        </View>
      </Page>
    </Document>
  );
};

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Generate invoice number
    const invoiceNumber = `${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Generate QR code
    const qrData = {
      invoiceNumber,
      amount: data.total || 0,
      paymentUrl: `https://kfar-final.vercel.app/pay/${invoiceNumber}`
    };
    
    const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 120,
      margin: 1
    });
    
    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      <CleanInvoice 
        data={data} 
        invoiceNumber={invoiceNumber}
        qrCodeUrl={qrCodeUrl}
      />
    );
    
    const pdfBase64 = pdfBuffer.toString('base64');
    
    return NextResponse.json({
      success: true,
      invoice: {
        invoiceNumber,
        pdfBase64,
        qrCode: qrCodeUrl,
        total: data.total || 0,
        createdAt: new Date().toISOString()
      },
      downloadUrl: `data:application/pdf;base64,${pdfBase64}`
    });
    
  } catch (error) {
    console.error('Invoice generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
