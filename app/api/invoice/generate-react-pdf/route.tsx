import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import ReactPDF, { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Image,
  Font,
  renderToBuffer 
} from '@react-pdf/renderer';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

// Register fonts
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: '/System/Library/Fonts/Helvetica.ttc', fontWeight: 'normal' },
    { src: '/System/Library/Fonts/Helvetica.ttc', fontWeight: 'bold' }
  ]
});

// KFAR Brand Colors
const COLORS = {
  leafGreen: '#478c0b',
  sunGold: '#f6af0d',
  earthFlame: '#c23c09',
  creamBase: '#fef9ef',
  soilBrown: '#3a3a1d',
  herbalMint: '#cfe7c1',
  white: '#ffffff',
  lightGray: '#e5e7eb',
  darkGray: '#4b5563',
  black: '#000000'
};

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: COLORS.white
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 15
  },
  companyInfo: {
    flex: 1
  },
  companyName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.leafGreen,
    marginBottom: 2
  },
  marketplace: {
    fontSize: 12,
    color: COLORS.sunGold,
    marginBottom: 4
  },
  tagline: {
    fontSize: 9,
    color: COLORS.darkGray
  },
  invoiceLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right'
  },
  invoiceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  invoiceNumber: {
    fontSize: 10,
    color: COLORS.earthFlame,
    fontWeight: 'bold'
  },
  date: {
    fontSize: 10,
    color: COLORS.black
  },
  billingSection: {
    flexDirection: 'row',
    marginBottom: 25
  },
  billingColumn: {
    flex: 1
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10
  },
  customerTitle: {
    color: COLORS.leafGreen
  },
  vendorTitle: {
    color: COLORS.sunGold
  },
  billingText: {
    fontSize: 10,
    marginBottom: 3,
    color: COLORS.black
  },
  table: {
    marginBottom: 20
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.leafGreen,
    padding: 8
  },
  tableHeaderText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold'
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray
  },
  tableRowAlt: {
    backgroundColor: COLORS.creamBase
  },
  vendorHeader: {
    backgroundColor: COLORS.herbalMint,
    padding: 6,
    marginTop: 5,
    marginBottom: 2
  },
  vendorHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.soilBrown
  },
  itemName: {
    flex: 3,
    fontSize: 9
  },
  itemQty: {
    flex: 1,
    fontSize: 9,
    textAlign: 'center'
  },
  itemPrice: {
    flex: 1,
    fontSize: 9,
    textAlign: 'right'
  },
  itemTotal: {
    flex: 1,
    fontSize: 9,
    textAlign: 'right'
  },
  summarySection: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray
  },
  qrSection: {
    width: 100,
    alignItems: 'center'
  },
  qrCode: {
    width: 80,
    height: 80,
    marginBottom: 5
  },
  qrText: {
    fontSize: 8,
    color: COLORS.darkGray,
    textAlign: 'center'
  },
  totalsSection: {
    flex: 1,
    alignItems: 'flex-end',
    paddingLeft: 20
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginBottom: 8
  },
  totalLabel: {
    fontSize: 10,
    color: COLORS.darkGray
  },
  totalValue: {
    fontSize: 10,
    color: COLORS.black
  },
  totalDue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.earthFlame,
    padding: 10,
    width: 200,
    marginTop: 10
  },
  totalDueLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white
  },
  totalDueValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray
  },
  footerThank: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.leafGreen,
    marginBottom: 8
  },
  footerContact: {
    fontSize: 9,
    color: COLORS.darkGray,
    marginBottom: 5
  },
  footerLegal: {
    fontSize: 8,
    color: COLORS.lightGray
  }
});

// Invoice Component
const InvoiceDocument = ({ data, invoiceNumber, qrCodeDataUrl, isHebrew }: any) => {
  // Calculate totals
  const subtotal = data.subtotal || data.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  const vat = data.vat || (subtotal * 0.17);
  const deliveryFee = data.deliveryFee || 0;
  const total = data.total || (subtotal + vat + deliveryFee);
  const date = new Date(data.createdAt || new Date()).toLocaleDateString(isHebrew ? 'he-IL' : 'en-US');
  
  // Check if logo exists
  const logoPath = path.join(process.cwd(), 'public', 'images', 'logos', 'kfar_icon_leaf_green.png');
  const hasLogo = fs.existsSync(logoPath);
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {hasLogo && (
            <Image 
              style={styles.logo} 
              src={logoPath}
            />
          )}
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>KFAR</Text>
            <Text style={styles.marketplace}>MARKETPLACE</Text>
            <Text style={styles.tagline}>
              {isHebrew ? 'הכפר כולו, ביד שלך' : 'The Whole Village, In Your Hand'}
            </Text>
          </View>
          <View>
            <Text style={styles.invoiceLabel}>
              {isHebrew ? 'חשבונית מס' : 'TAX INVOICE'}
            </Text>
          </View>
        </View>
        
        {/* Invoice Info */}
        <View style={styles.invoiceInfo}>
          <View>
            <Text style={{ fontSize: 10, color: COLORS.darkGray }}>
              {isHebrew ? 'מספר חשבונית: ' : 'Invoice Number: '}
              <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
            </Text>
          </View>
          <View>
            <Text style={styles.date}>
              {isHebrew ? 'תאריך: ' : 'Date: '}{date}
            </Text>
          </View>
        </View>
        
        {/* Billing Section */}
        <View style={styles.billingSection}>
          <View style={styles.billingColumn}>
            <Text style={[styles.sectionTitle, styles.customerTitle]}>
              {isHebrew ? 'פרטי לקוח' : 'BILL TO'}
            </Text>
            <Text style={styles.billingText}>{data.customer.name}</Text>
            <Text style={styles.billingText}>{data.customer.email}</Text>
            <Text style={styles.billingText}>{data.customer.phone}</Text>
            {data.customer.address && (
              <Text style={styles.billingText}>{data.customer.address}</Text>
            )}
          </View>
          
          <View style={styles.billingColumn}>
            <Text style={[styles.sectionTitle, styles.vendorTitle]}>
              {isHebrew ? 'פרטי ספק' : 'VENDOR'}
            </Text>
            <Text style={styles.billingText}>{data.vendorName}</Text>
            {data.itemsByVendor && Object.keys(data.itemsByVendor).length > 1 && (
              <Text style={{ fontSize: 9, color: COLORS.earthFlame, marginBottom: 3 }}>
                + {Object.keys(data.itemsByVendor).length - 1} {isHebrew ? 'ספקים נוספים' : 'additional vendors'}
              </Text>
            )}
            <Text style={{ fontSize: 9, color: COLORS.darkGray, marginBottom: 3 }}>
              {isHebrew ? 'משלוח: ' : 'Delivery: '}{data.deliveryMethod}
            </Text>
            <Text style={{ fontSize: 9, color: COLORS.darkGray }}>
              {isHebrew ? 'תשלום: ' : 'Payment: '}{data.paymentMethod}
            </Text>
          </View>
        </View>
        
        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.itemName]}>
              {isHebrew ? 'מוצר' : 'Item Description'}
            </Text>
            <Text style={[styles.tableHeaderText, styles.itemQty]}>
              {isHebrew ? 'כמות' : 'Qty'}
            </Text>
            <Text style={[styles.tableHeaderText, styles.itemPrice]}>
              {isHebrew ? 'מחיר' : 'Price'}
            </Text>
            <Text style={[styles.tableHeaderText, styles.itemTotal]}>
              {isHebrew ? 'סה"כ' : 'Total'}
            </Text>
          </View>
          
          {data.itemsByVendor && Object.keys(data.itemsByVendor).length > 0 ? (
            Object.entries(data.itemsByVendor).map(([vendor, items]: [string, any]) => (
              <View key={vendor}>
                <View style={styles.vendorHeader}>
                  <Text style={styles.vendorHeaderText}>📦 {vendor}</Text>
                </View>
                {items.map((item: any, index: number) => (
                  <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQty}>{item.quantity}</Text>
                    <Text style={styles.itemPrice}>₪{item.price.toFixed(2)}</Text>
                    <Text style={styles.itemTotal}>₪{(item.price * item.quantity).toFixed(2)}</Text>
                  </View>
                ))}
              </View>
            ))
          ) : (
            data.items.map((item: any, index: number) => (
              <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQty}>{item.quantity}</Text>
                <Text style={styles.itemPrice}>₪{item.price.toFixed(2)}</Text>
                <Text style={styles.itemTotal}>₪{(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))
          )}
        </View>
        
        {/* Summary Section */}
        <View style={styles.summarySection}>
          <View style={styles.qrSection}>
            {qrCodeDataUrl && (
              <>
                <Image style={styles.qrCode} src={qrCodeDataUrl} />
                <Text style={styles.qrText}>
                  {isHebrew ? 'סרוק לתשלום' : 'Scan to pay'}
                </Text>
              </>
            )}
          </View>
          
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                {isHebrew ? 'סכום ביניים:' : 'Subtotal:'}
              </Text>
              <Text style={styles.totalValue}>₪{subtotal.toFixed(2)}</Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                {isHebrew ? 'מע"מ (17%):' : 'VAT (17%):'}
              </Text>
              <Text style={styles.totalValue}>₪{vat.toFixed(2)}</Text>
            </View>
            
            {deliveryFee > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  {isHebrew ? 'דמי משלוח:' : 'Delivery:'}
                </Text>
                <Text style={styles.totalValue}>₪{deliveryFee.toFixed(2)}</Text>
              </View>
            )}
            
            <View style={styles.totalDue}>
              <Text style={styles.totalDueLabel}>
                {isHebrew ? 'סה"כ לתשלום:' : 'Total Due:'}
              </Text>
              <Text style={styles.totalDueValue}>₪{total.toFixed(2)}</Text>
            </View>
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerThank}>
            {isHebrew ? 'תודה שבחרתם ב-KFAR! 🌱' : 'Thank you for choosing KFAR! 🌱'}
          </Text>
          <Text style={styles.footerContact}>
            {isHebrew ? 'לשאלות: support@kfar.market | 052-KFAR-MKT' : 
                         'Questions? support@kfar.market | 052-KFAR-MKT'}
          </Text>
          <Text style={styles.footerLegal}>
            {isHebrew ? 'חשבונית זו הופקה אוטומטית ומהווה אסמכתא לתשלום' :
                         'This invoice was generated automatically and serves as proof of payment'}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export async function POST(request: NextRequest) {
  try {
    const invoiceData = await request.json();
    
    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const isHebrew = invoiceData.language === 'he';
    
    // Generate QR code
    const qrData = {
      type: 'kfar_invoice',
      invoiceNumber,
      amount: invoiceData.total || 0,
      vendorId: invoiceData.vendorId,
      orderId: invoiceData.orderId,
      paymentUrl: `https://kfar-final.vercel.app/pay/${invoiceNumber}`
    };
    
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 160,
      margin: 1
    });
    
    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      <InvoiceDocument 
        data={invoiceData} 
        invoiceNumber={invoiceNumber}
        qrCodeDataUrl={qrCodeDataUrl}
        isHebrew={isHebrew}
      />
    );
    
    const pdfBase64 = pdfBuffer.toString('base64');
    
    return NextResponse.json({
      success: true,
      invoice: {
        invoiceNumber,
        pdfBase64,
        qrCode: qrCodeDataUrl,
        total: invoiceData.total || 0,
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