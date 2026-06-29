// src/services/InvoiceService.js
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

export function generateInvoice(order, studioData) {
  const doc = new jsPDF()

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20

  // Header Background
  doc.setFillColor(99, 102, 241) // #6366f1
  doc.rect(0, 0, pageWidth, 50, 'F')

  // Studio Name
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text(studioData?.studioName || 'ShootDesk Studio', margin, 25)

  // Invoice Title
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('INVOICE', pageWidth - margin, 25, { align: 'right' })

  // Invoice Details
  doc.setFontSize(10)
  doc.text(`Invoice #: ${order.id?.substring(0, 8).toUpperCase() || 'N/A'}`, pageWidth - margin, 35, { align: 'right' })
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - margin, 42, { align: 'right' })

  // Client Info Section
  doc.setTextColor(30, 30, 30)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('BILL TO:', margin, 65)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(order.clientName, margin, 73)
  if (order.phone) doc.text(`Phone: ${order.phone}`, margin, 80)
  if (order.venue) doc.text(`Venue: ${order.venue}`, margin, 87)

  // Shoot Details
  doc.setFont('helvetica', 'bold')
  doc.text('SHOOT DETAILS:', margin, 102)

  doc.setFont('helvetica', 'normal')
  doc.text(`Type: ${order.shootType}`, margin, 110)
  doc.text(`Date: ${order.date}`, margin, 117)
  if (order.time) doc.text(`Time: ${order.time}`, margin, 124)

  // Table - Payment Breakdown
  const tableData = [
    ['Description', 'Amount'],
    ['Total Amount', `₹${Number(order.total || 0).toLocaleString()}`],
    ['Advance Paid', `- ₹${Number(order.advance || 0).toLocaleString()}`],
    ['Balance Due', `₹${(Number(order.total || 0) - Number(order.advance || 0)).toLocaleString()}`],
  ]

  doc.autoTable({
    startY: 135,
    head: [['Description', 'Amount']],
    body: tableData.slice(1),
    theme: 'grid',
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 10,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 250],
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 'auto', halign: 'right' },
    },
    margin: { left: margin, right: margin },
  })

  // Balance Due Highlight
  const finalY = doc.lastAutoTable.finalY + 10
  doc.setFillColor(239, 68, 68) // Red
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  
  const balance = Number(order.total || 0) - Number(order.advance || 0)
  doc.text(`BALANCE DUE: ₹${balance.toLocaleString()}`, margin, finalY)

  // Footer
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Thank you for choosing ' + (studioData?.studioName || 'our studio') + '!', margin, finalY + 20)
  doc.text('For queries, contact: ' + (studioData?.phone || 'N/A'), margin, finalY + 27)

  // Studio Address
  if (studioData?.address) {
    doc.text(studioData.address, margin, finalY + 34)
  }

  // Save
  const fileName = `Invoice_${order.clientName.replace(/\s+/g, '_')}_${order.date}.pdf`
  doc.save(fileName)

  return fileName
}

export function shareInvoice(order, studioData) {
  // Generate PDF as blob for sharing
  const doc = new jsPDF()
  
  // Same content as above...
  // (Same code, just return blob instead of save)
  
  const pdfBlob = doc.output('blob')
  const pdfUrl = URL.createObjectURL(pdfBlob)
  
  // WhatsApp share link
  const text = `Hi ${order.clientName},\n\nYour invoice is ready for ${order.shootType} shoot on ${order.date}.\n\nTotal: ₹${Number(order.total || 0).toLocaleString()}\nBalance Due: ₹${(Number(order.total || 0) - Number(order.advance || 0)).toLocaleString()}\n\nThank you!`
  
  const whatsappUrl = `https://wa.me/${order.phone}?text=${encodeURIComponent(text)}`
  
  return { pdfUrl, whatsappUrl }
}